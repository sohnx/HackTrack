# backend/app/services/scrapers/hack2skill.py
# Hack2Skill exposes a public event-list API used by their own frontend.

import logging
import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, detect_online

logger = logging.getLogger(__name__)

API_URL = "https://hack2skill.com/api/v1/innovator/public/event/list"
PARAMS = {"page": 1, "records": 100}


class Hack2SkillScraper(BaseScraper):
    source = "hack2skill"

    async def fetch(self) -> list[RawHackathon]:
        try:
            async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
                res = await client.get(API_URL, params=PARAMS)
                res.raise_for_status()
                payload = res.json()
        except Exception:
            logger.exception("Hack2Skill fetch failed")
            return []

        data = payload.get("data", {}) or {}
        events = (data.get("flagshipEvents") or []) + (data.get("communityEvents") or [])

        results: list[RawHackathon] = []
        for event in events:
            if not isinstance(event, dict):
                continue

            title = clean_text(event.get("title"))
            event_url = event.get("customEventUrl") or (
                f"https://hack2skill.com/{event['eventUrl']}" if event.get("eventUrl") else None
            )
            if not title or not event_url:
                continue

            loc = event.get("location") or event.get("city")
            results.append(RawHackathon(
                title=title,
                source=self.source,
                url=event_url,
                description=clean_text(event.get("description")),
                banner_url=event.get("thumbnail"),
                location=loc,
                is_online=detect_online(loc),
                deadline=parse_date(event.get("registrationEnd")),
            ))

        return results
