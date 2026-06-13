# backend/app/services/scrapers/base.py

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class RawHackathon:
    title: str
    source: str
    url: str | None = None
    description: str | None = None
    banner_url: str | None = None
    location: str | None = None
    is_online: bool | None = None
    prize_pool: str | None = None
    team_size: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    deadline: datetime | None = None
    tags: list[str] = field(default_factory=list)

class BaseScraper(ABC):
    """Common interface for all hackathon source scrapers."""

    source: str

    @abstractmethod
    async def fetch(self) -> list[RawHackathon]:
        """Fetch and return raw hackathon listings from the source."""
        raise NotImplementedError