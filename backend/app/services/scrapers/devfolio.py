# backend/app/services/scrapers/devfolio.py

import httpx
from bs4 import BeautifulSoup
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool, detect_online

LIST_URL = "https://devfolio.co/hackathons/open"

class DevfolioScraper(BaseScraper):
    source = "devfolio"

    async def fetch(self) -> list[RawHackathon]:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            res = await client.get(LIST_URL)
            res.raise_for_status()
        return self._parse(res.text)

    def _parse(self, html: str) -> list[RawHackathon]:
        soup = BeautifulSoup(html, "html.parser")
        results: list[RawHackathon] = []

        for card in soup.select("a[href*='/hackathons/']"):
            title = clean_text(card.select_one("h3, h2, [class*=title]") and card.select_one("h3, h2, [class*=title]").get_text())
            if not title:
                continue

            href = card.get("href", "")
            url = href if href.startswith("http") else f"https://devfolio.co{href}"

            location_el = card.select_one("[class*=location], [class*=mode]")
            location = clean_text(location_el.get_text()) if location_el else None

            prize_el = card.select_one("[class*=prize]")
            prize_pool = normalize_prize_pool(prize_el.get_text()) if prize_el else None

            date_el = card.select_one("[class*=date]")
            deadline = parse_date(clean_text(date_el.get_text())) if date_el else None

            banner_el = card.select_one("img")
            banner_url = banner_el.get("src") if banner_el else None

            results.append(RawHackathon(
                title=title,
                source=self.source,
                url=url,
                location=location,
                is_online=detect_online(location),
                prize_pool=prize_pool,
                deadline=deadline,
                banner_url=banner_url,
            ))

        return results