# backend/app/services/scrapers/ethglobal.py
# ETHGlobal publishes event data as a static JSON feed on their site.

import httpx
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, detect_online

# ETHGlobal events page — falls back to HTML parse if JSON feed unavailable
EVENTS_URL = "https://ethglobal.com/events"
API_URL = "https://ethglobal.com/api/events"

class ETHGlobalScraper(BaseScraper):
    source = "ethglobal"

    async def fetch(self) -> list[RawHackathon]:
        async with httpx.AsyncClient(timeout=20, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json, text/html",
        }) as client:
            # Try JSON API first
            try:
                res = await client.get(API_URL, headers={"Accept": "application/json"})
                if res.status_code == 200 and "application/json" in res.headers.get("content-type", ""):
                    return self._parse_json(res.json())
            except Exception:
                pass
            # Fallback: HTML parse
            res = await client.get(EVENTS_URL)
            res.raise_for_status()
            return self._parse_html(res.text)

    def _parse_json(self, data) -> list[RawHackathon]:
        results = []
        events = data if isinstance(data, list) else data.get("events", [])
        for e in events:
            loc = e.get("location") or e.get("city")
            results.append(RawHackathon(
                title=clean_text(e.get("name") or e.get("title")) or "",
                source=self.source,
                url=f"https://ethglobal.com/events/{e.get('slug', '')}",
                description=clean_text(e.get("description")),
                banner_url=e.get("image") or e.get("banner_url"),
                location=loc,
                is_online=detect_online(loc) or e.get("is_online", False),
                prize_pool=e.get("prize_pool"),
                start_date=parse_date(e.get("start_date") or e.get("starts_at")),
                end_date=parse_date(e.get("end_date") or e.get("ends_at")),
                deadline=parse_date(e.get("deadline") or e.get("application_deadline")),
                tags=["web3", "ethereum"] + (e.get("tags") or []),
            ))
        return results

    def _parse_html(self, html: str) -> list[RawHackathon]:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")
        results = []
        # ETHGlobal event cards typically link to /events/<slug>
        seen = set()
        for a in soup.select("a[href*='/events/']"):
            href = a.get("href", "")
            slug = href.rstrip("/").split("/")[-1]
            if not slug or slug in seen or slug == "events":
                continue
            seen.add(slug)
            title_el = a.select_one("h2, h3, [class*=title], [class*=name]")
            title = clean_text(title_el.get_text()) if title_el else clean_text(a.get_text())
            if not title or len(title) < 3:
                continue
            loc_el = a.select_one("[class*=location], [class*=city]")
            location = clean_text(loc_el.get_text()) if loc_el else None
            date_el = a.select_one("[class*=date], time")
            deadline = parse_date(clean_text(date_el.get_text())) if date_el else None
            url = href if href.startswith("http") else f"https://ethglobal.com{href}"
            results.append(RawHackathon(
                title=title,
                source=self.source,
                url=url,
                location=location,
                is_online=detect_online(location),
                deadline=deadline,
                tags=["web3", "ethereum"],
            ))
        return results
