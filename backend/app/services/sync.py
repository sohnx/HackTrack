# backend/app/services/sync.py

import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.discovered_hackathon import DiscoveredHackathon
from app.services.scrapers import SCRAPERS
from app.services.scrapers.base import RawHackathon

logger = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))

def _is_expired(item: RawHackathon, cutoff: datetime) -> bool:
    """An item is expired if its end_date (or deadline, if no end_date) is before
    the cutoff (start of "today" in IST). Using start-of-day rather than the
    exact current time avoids dropping hackathons whose deadline is later today
    but was parsed as a date-only value (midnight), and the IST cutoff avoids
    treating a deadline expressed as "today, IST" but stored as "yesterday, UTC"
    as expired."""
    reference = item.end_date or item.deadline
    if reference is None:
        return False
    if reference.tzinfo is None:
        reference = reference.replace(tzinfo=timezone.utc)
    return reference < cutoff

def _upsert(db: Session, item: RawHackathon) -> bool:
    existing = db.query(DiscoveredHackathon).filter(
        DiscoveredHackathon.source == item.source,
        DiscoveredHackathon.url == item.url,
    ).first()

    fields = dict(
        title=item.title,
        description=item.description,
        url=item.url,
        banner_url=item.banner_url,
        source=item.source,
        location=item.location,
        is_online=item.is_online if item.is_online is not None else True,
        prize_pool=item.prize_pool,
        team_size=item.team_size,
        start_date=item.start_date,
        end_date=item.end_date,
        deadline=item.deadline,
        tags=",".join(item.tags) if item.tags else None,
    )

    if existing:
        for k, v in fields.items():
            setattr(existing, k, v)
        return False

    db.add(DiscoveredHackathon(**fields))
    return True

async def run_sync(sources: list[str] | None = None) -> dict[str, dict[str, int]]:
    """Run scrapers and upsert results. Returns per-source counts."""
    targets = sources or list(SCRAPERS.keys())
    summary: dict[str, dict[str, int]] = {}
    now_ist = datetime.now(IST)
    cutoff = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)

    for name in targets:
        scraper_cls = SCRAPERS.get(name)
        if not scraper_cls:
            summary[name] = {"error": "unknown source"}
            continue

        db = SessionLocal()
        try:
            items = await scraper_cls().fetch()
            active_items = [item for item in items if not _is_expired(item, cutoff)]
            expired_count = len(items) - len(active_items)

            created = updated = 0
            for item in active_items:
                if _upsert(db, item):
                    created += 1
                else:
                    updated += 1

            # Remove previously-stored listings that are now over and were not
            # refreshed in this sync (covers items dropped from the source feed).
            removed = (
                db.query(DiscoveredHackathon)
                .filter(
                    DiscoveredHackathon.source == name,
                    DiscoveredHackathon.end_date.isnot(None),
                    DiscoveredHackathon.end_date < cutoff,
                )
                .delete(synchronize_session=False)
            )
            removed += (
                db.query(DiscoveredHackathon)
                .filter(
                    DiscoveredHackathon.source == name,
                    DiscoveredHackathon.end_date.is_(None),
                    DiscoveredHackathon.deadline.isnot(None),
                    DiscoveredHackathon.deadline < cutoff,
                )
                .delete(synchronize_session=False)
            )

            db.commit()
            summary[name] = {
                "fetched": len(items),
                "skipped_expired": expired_count,
                "created": created,
                "updated": updated,
                "removed": removed,
            }
        except Exception as e:
            logger.exception("Sync failed for %s", name)
            db.rollback()
            summary[name] = {"error": str(e)}
        finally:
            db.close()

    return summary