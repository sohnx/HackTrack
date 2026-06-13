# backend/app/services/scrapers/kaggle.py
# Kaggle has a public competitions listing API (no auth needed for public comps).
# NOTE: Full data requires Kaggle API key. This scraper uses the public web JSON
# endpoint. For richer data, set KAGGLE_USERNAME + KAGGLE_KEY env vars.

import os
import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool

PUBLIC_API = "https://www.kaggle.com/api/v1/competitions/list"
PARAMS = {"sortBy": "deadline", "pageSize": 50, "group": "general", "category": "featured"}

class KaggleScraper(BaseScraper):
    source = "kaggle"

    async def fetch(self) -> list[RawHackathon]:
        results: list[RawHackathon] = []
        headers = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

        # Use basic auth if credentials are provided
        username = os.getenv("KAGGLE_USERNAME")
        api_key = os.getenv("KAGGLE_KEY")
        auth = (username, api_key) if username and api_key else None

        async with httpx.AsyncClient(timeout=20, headers=headers, auth=auth) as client:
            page = 1
            while True:
                res = await client.get(PUBLIC_API, params={**PARAMS, "page": page})
                if res.status_code == 401:
                    # No auth available — skip gracefully
                    break
                res.raise_for_status()
                items = res.json()
                if not items:
                    break
                for c in items:
                    slug = c.get("ref", "").lstrip("/competitions/")
                    results.append(RawHackathon(
                        title=clean_text(c.get("title")) or "",
                        source=self.source,
                        url=f"https://www.kaggle.com/c/{slug}" if slug else c.get("url"),
                        description=clean_text(c.get("description")),
                        banner_url=None,
                        location=None,
                        is_online=True,
                        prize_pool=normalize_prize_pool(str(c.get("reward", "")) or None),
                        deadline=parse_date(c.get("deadline")),
                        tags=["ml", "data-science"] + ([c.get("category")] if c.get("category") else []),
                    ))
                page += 1
                if len(items) < PARAMS["pageSize"]:
                    break

        return results
