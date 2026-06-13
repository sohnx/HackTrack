# backend/app/services/scrapers/normalize.py

import re
from datetime import datetime

def clean_text(text: str | None) -> str | None:
    if not text:
        return None
    text = re.sub(r"\s+", " ", text).strip()
    return text or None

def parse_date(value: str | None, fmt: str | None = None) -> datetime | None:
    if not value:
        return None
    value = value.strip()
    formats = [fmt] if fmt else ["%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d", "%b %d, %Y", "%B %d, %Y"]
    for f in formats:
        if not f:
            continue
        try:
            return datetime.strptime(value, f)
        except (ValueError, TypeError):
            continue
    return None

def normalize_prize_pool(value: str | None) -> str | None:
    if not value:
        return None
    value = clean_text(value)
    if not value:
        return None
    match = re.search(r"[\$₹€£]\s?[\d,.]+(?:\s?[kKmM])?", value)
    return match.group(0) if match else value

def detect_online(location: str | None) -> bool:
    if not location:
        return True
    return any(kw in location.lower() for kw in ["online", "virtual", "remote"])