# backend/app/utils/date.py

from datetime import datetime, timezone


def days_until(dt: datetime | None) -> int | None:
    if not dt:
        return None
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = (dt - now).days
    return max(delta, 0)
