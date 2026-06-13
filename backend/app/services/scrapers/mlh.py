# backend/app/services/scrapers/mlh.py
# MLH (Major League Hacking) serves a static HTML events page — parseable without JS.

import httpx
from bs4 import BeautifulSoup
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, detect_online

EVENTS_URL = "https://mlh.io/seasons/2025/events"

class MLHScraper(BaseScraper):
    source = "mlh"

    async def fetch(self) -> list[RawHackathon]:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            res = await client.get(EVENTS_URL)
            res.raise_for_status()
        return self._parse(res.text)

    def _parse(self, html: str) -> list[RawHackathon]:
        soup = BeautifulSoup(html, "html.parser")
        results = []

        # MLH event cards: <div class="event"> or <div class="event-wrapper">
        for card in soup.select(".event, .event-wrapper, [class*=event-block]"):
            title_el = card.select_one("h3, h2, .event-name, [class*=title]")
            title = clean_text(title_el.get_text()) if title_el else None
            if not title:
                continue

            link_el = card.select_one("a[href]")
            url = link_el["href"] if link_el else None
            if url and not url.startswith("http"):
                url = f"https://mlh.io{url}"

            date_el = card.select_one(".event-date, [class*=date], time")
            date_text = clean_text(date_el.get_text()) if date_el else None
            # MLH dates like "Jan 17 - 19, 2025" — take last part as deadline
            deadline = parse_date(date_text.split("–")[-1].strip() if date_text and "–" in date_text
                                  else date_text.split("-")[-1].strip() if date_text else None)

            loc_el = card.select_one(".event-location, [class*=location]")
            location = clean_text(loc_el.get_text()) if loc_el else None

            img_el = card.select_one("img")
            banner_url = img_el.get("src") or img_el.get("data-src") if img_el else None

            results.append(RawHackathon(
                title=title,
                source=self.source,
                url=url,
                banner_url=banner_url,
                location=location,
                is_online=detect_online(location),
                deadline=deadline,
                tags=["student", "mlh"],
            ))

        return results
