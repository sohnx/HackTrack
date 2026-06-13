# backend/app/services/scrapers/unstop.py
# Unstop has a public REST API used by their own frontend.

import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool, detect_online

API_URL = "https://unstop.com/api/public/opportunity/search-result"
PARAMS = {
    "opportunity": "hackathons",
    "per_page": 50,
    "oppstatus": "open",
    "sort": "deadline",
}

class UnstopScraper(BaseScraper):
    source = "unstop"

    async def fetch(self) -> list[RawHackathon]:
        results: list[RawHackathon] = []
        async with httpx.AsyncClient(timeout=20, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        }) as client:
            page = 1
            while True:
                res = await client.get(API_URL, params={**PARAMS, "page": page})
                res.raise_for_status()
                data = res.json().get("data", {})
                items = data.get("data", [])
                if not items:
                    break
                for item in items:
                    loc = item.get("city") or item.get("country") or None
                    results.append(RawHackathon(
                        title=clean_text(item.get("title")) or "",
                        source=self.source,
                        url=f"https://unstop.com/hackathons/{item.get('public_url', item.get('id', ''))}",
                        description=clean_text(item.get("description") or item.get("tagline")),
                        banner_url=item.get("logo_url") or item.get("banner"),
                        location=loc,
                        is_online=detect_online(loc) or item.get("is_online", False),
                        prize_pool=normalize_prize_pool(str(item.get("prize_pool", "")) or None),
                        team_size=str(item.get("team_size", "")) or None,
                        start_date=parse_date(item.get("start_date")),
                        end_date=parse_date(item.get("end_date")),
                        deadline=parse_date(item.get("reg_end_date") or item.get("deadline")),
                        tags=item.get("tags", []),
                    ))
                total_pages = data.get("last_page", 1)
                if page >= total_pages:
                    break
                page += 1
        return results
