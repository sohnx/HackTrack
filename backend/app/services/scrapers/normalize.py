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

    if fmt:
        try:
            return datetime.strptime(value, fmt)
        except (ValueError, TypeError):
            pass

    # Normalize trailing 'Z' (UTC) to an offset Python understands
    iso_value = value
    if iso_value.endswith("Z"):
        iso_value = iso_value[:-1] + "+00:00"

    # Try native ISO 8601 parsing first (handles fractional seconds, offsets)
    try:
        return datetime.fromisoformat(iso_value)
    except ValueError:
        pass

    formats = ["%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d", "%b %d, %Y", "%B %d, %Y"]
    for f in formats:
        try:
            return datetime.strptime(value, f)
        except (ValueError, TypeError):
            continue
    return None

def normalize_prize_pool(value: str | None) -> str | None:
    if not value:
        return None
    value = re.sub(r"<[^>]+>", "", value)  # strip HTML tags e.g. <span data-currency-value>0</span>
    value = clean_text(value)
    if not value:
        return None
    match = re.search(r"[\$₹€£]\s?[\d,.]+(?:\s?[kKmM])?", value)
    if match:
        result = match.group(0)
    else:
        result = value
    # Treat zero/blank amounts as "no prize info"
    digits = re.sub(r"[^\d.]", "", result)
    if digits in ("", "0", "0.0", "0.00"):
        return None
    return result

def detect_online(location: str | None) -> bool:
    if not location:
        return True
    return any(kw in location.lower() for kw in ["online", "virtual", "remote"])