# backend/app/services/scrapers/reskilll.py
# Reskilll (3 l's) — Next.js site, extracts from __NEXT_DATA__ or HTML cards.

import json
import httpx
from bs4 import BeautifulSoup
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.models.hackathon import HackathonSource
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool, detect_online

LIST_URL = "https://reskilll.com/hackathons"

class ReskilllScraper(BaseScraper):
    source = "reskilll"  # Note: not in HackathonSource enum — add if needed

    async def fetch(self) -> list[RawHackathon]:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            res = await client.get(LIST_URL)
            res.raise_for_status()
        return self._parse(res.text)

    def _parse(self, html: str) -> list[RawHackathon]:
        soup = BeautifulSoup(html, "html.parser")
        results = []

        script = soup.find("script", {"id": "__NEXT_DATA__"})
        if script:
            try:
                data = json.loads(script.string)
                items = (
                    data.get("props", {}).get("pageProps", {}).get("hackathons")
                    or data.get("props", {}).get("pageProps", {}).get("events", [])
                )
                for h in items:
                    loc = h.get("location") or h.get("city")
                    slug = h.get("slug") or h.get("id")
                    results.append(RawHackathon(
                        title=clean_text(h.get("title") or h.get("name")) or "",
                        source=HackathonSource.reskilll,
                        url=f"https://reskilll.com/hackathon/{slug}" if slug else None,
                        description=clean_text(h.get("description")),
                        banner_url=h.get("banner") or h.get("thumbnail"),
                        location=loc,
                        is_online=detect_online(loc),
                        prize_pool=normalize_prize_pool(str(h.get("prize", "")) or None),
                        start_date=parse_date(h.get("start_date")),
                        end_date=parse_date(h.get("end_date")),
                        deadline=parse_date(h.get("deadline") or h.get("reg_deadline")),
                        tags=h.get("tags", []),
                    ))
                if results:
                    return results
            except (json.JSONDecodeError, KeyError):
                pass

        # Fallback HTML
        for card in soup.select("a[href*='/hackathon/'], [class*=card]"):
            title_el = card.select_one("h2, h3, [class*=title]")
            title = clean_text(title_el.get_text()) if title_el else clean_text(card.get_text()[:60])
            if not title or len(title) < 3:
                continue
            href = card.get("href", "")
            url = href if href.startswith("http") else f"https://reskilll.com{href}"
            date_el = card.select_one("[class*=date], time")
            deadline = parse_date(clean_text(date_el.get_text())) if date_el else None
            results.append(RawHackathon(
                title=title, source=HackathonSource.reskilll, url=url,
                is_online=True, deadline=deadline,
            ))

        return results
