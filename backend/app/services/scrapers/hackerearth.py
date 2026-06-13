# backend/app/services/scrapers/hackerearth.py
# HackerEarth exposes a public challenges API used by their frontend.

import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool

API_URL = "https://www.hackerearth.com/chrome-extension/events/"

class HackerEarthScraper(BaseScraper):
    source = "hackerearth"

    async def fetch(self) -> list[RawHackathon]:
        results: list[RawHackathon] = []
        async with httpx.AsyncClient(timeout=20, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        }) as client:
            res = await client.get(API_URL)
            res.raise_for_status()
            data = res.json()

        # API can return a top-level list, or {"response": {...}} / {"response": [...]}
        if isinstance(data, list):
            events = data
        else:
            response = data.get("response", data)
            if isinstance(response, list):
                events = response
            else:
                events = response.get("hackathons", []) + response.get("challenges", [])

        for e in events:
            if not isinstance(e, dict):
                continue
            results.append(RawHackathon(
                title=clean_text(e.get("title")) or "",
                source=self.source,
                url=e.get("url"),
                description=clean_text(e.get("description")),
                banner_url=e.get("cover_image") or e.get("banner"),
                location=None,
                is_online=True,  # HackerEarth is fully online
                prize_pool=normalize_prize_pool(e.get("prize") or e.get("prize_pool")),
                start_date=parse_date(e.get("start_utc") or e.get("start_time")),
                end_date=parse_date(e.get("end_utc") or e.get("end_time")),
                deadline=parse_date(e.get("end_utc") or e.get("end_time")),
                tags=e.get("tags", []),
            ))

        return results
