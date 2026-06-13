# backend/app/services/scrapers/devpost.py
# Devpost exposes a public JSON search endpoint — no browser needed.

import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool, detect_online

API_URL = "https://devpost.com/api/hackathons"
PARAMS = {"status[]": ["upcoming", "open"], "order_by": "deadline", "per_page": 50}

class DevpostScraper(BaseScraper):
    source = "devpost"

    async def fetch(self) -> list[RawHackathon]:
        results: list[RawHackathon] = []
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            page = 1
            while True:
                res = await client.get(API_URL, params={**PARAMS, "page": page})
                res.raise_for_status()
                data = res.json()
                hackathons = data.get("hackathons", [])
                if not hackathons:
                    break
                for h in hackathons:
                    results.append(RawHackathon(
                        title=clean_text(h.get("title")) or "",
                        source=self.source,
                        url=h.get("url"),
                        description=clean_text(h.get("tagline")),
                        banner_url=h.get("thumbnail_url"),
                        location=h.get("displayed_location", {}).get("location"),
                        is_online=h.get("online_only", True),
                        prize_pool=normalize_prize_pool(str(h.get("prize_amount", "")) if h.get("prize_amount") else None),
                        start_date=parse_date(h.get("submission_period_dates", "").split("–")[0].strip() if h.get("submission_period_dates") else None),
                        deadline=parse_date(h.get("submission_period_dates", "").split("–")[-1].strip() if h.get("submission_period_dates") else None),
                        tags=[t["name"] for t in h.get("themes", [])],
                    ))
                if page >= data.get("meta", {}).get("total_pages", 1):
                    break
                page += 1
        return results
