# backend/app/services/scrapers/hack2skill.py
# Hack2Skill is a React SPA — the listing page server-renders some data in
# a __NEXT_DATA__ JSON script tag, which we can extract without a browser.

import json
import httpx
from bs4 import BeautifulSoup
from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.normalize import clean_text, parse_date, normalize_prize_pool, detect_online

LIST_URL = "https://hack2skill.com/hack/allhackathons"

class Hack2SkillScraper(BaseScraper):
    source = "hack2skill"

    async def fetch(self) -> list[RawHackathon]:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": "Mozilla/5.0"}) as client:
            res = await client.get(LIST_URL)
            res.raise_for_status()
        return self._parse(res.text)

    def _parse(self, html: str) -> list[RawHackathon]:
        soup = BeautifulSoup(html, "html.parser")
        results = []

        # Try __NEXT_DATA__ first
        script = soup.find("script", {"id": "__NEXT_DATA__"})
        if script:
            try:
                data = json.loads(script.string)
                hackathons = (
                    data.get("props", {})
                        .get("pageProps", {})
                        .get("hackathons")
                    or data.get("props", {})
                        .get("pageProps", {})
                        .get("data", [])
                )
                for h in hackathons:
                    loc = h.get("location") or h.get("city")
                    slug = h.get("slug") or h.get("id")
                    results.append(RawHackathon(
                        title=clean_text(h.get("title") or h.get("name")) or "",
                        source=self.source,
                        url=f"https://hack2skill.com/hackathon/{slug}" if slug else None,
                        description=clean_text(h.get("description") or h.get("tagline")),
                        banner_url=h.get("banner") or h.get("image"),
                        location=loc,
                        is_online=detect_online(loc) or h.get("mode", "").lower() == "online",
                        prize_pool=normalize_prize_pool(str(h.get("prize_pool", "")) or None),
                        team_size=str(h.get("team_size", "")) or None,
                        start_date=parse_date(h.get("start_date")),
                        end_date=parse_date(h.get("end_date")),
                        deadline=parse_date(h.get("registration_deadline") or h.get("deadline")),
                        tags=h.get("tags", []),
                    ))
                if results:
                    return results
            except (json.JSONDecodeError, KeyError):
                pass

        # Fallback: card-based HTML parse
        for card in soup.select("[class*=hackathon-card], [class*=HackCard], [class*=hack-card]"):
            title_el = card.select_one("h2, h3, [class*=title]")
            title = clean_text(title_el.get_text()) if title_el else None
            if not title:
                continue
            link_el = card.select_one("a[href]")
            url = link_el["href"] if link_el else None
            if url and not url.startswith("http"):
                url = f"https://hack2skill.com{url}"
            date_el = card.select_one("[class*=date], time")
            deadline = parse_date(clean_text(date_el.get_text())) if date_el else None
            loc_el = card.select_one("[class*=location]")
            location = clean_text(loc_el.get_text()) if loc_el else None
            img_el = card.select_one("img")
            banner_url = img_el.get("src") if img_el else None
            results.append(RawHackathon(
                title=title, source=self.source, url=url,
                banner_url=banner_url, location=location,
                is_online=detect_online(location), deadline=deadline,
            ))

        return results
