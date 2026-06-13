# backend/app/services/sync.py

import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.discovered_hackathon import DiscoveredHackathon
from app.services.scrapers import SCRAPERS
from app.services.scrapers.base import RawHackathon

logger = logging.getLogger(__name__)

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

    for name in targets:
        scraper_cls = SCRAPERS.get(name)
        if not scraper_cls:
            summary[name] = {"error": "unknown source"}
            continue

        db = SessionLocal()
        try:
            items = await scraper_cls().fetch()
            created = updated = 0
            for item in items:
                if _upsert(db, item):
                    created += 1
                else:
                    updated += 1
            db.commit()
            summary[name] = {"fetched": len(items), "created": created, "updated": updated}
        except Exception as e:
            logger.exception("Sync failed for %s", name)
            db.rollback()
            summary[name] = {"error": str(e)}
        finally:
            db.close()

    return summary