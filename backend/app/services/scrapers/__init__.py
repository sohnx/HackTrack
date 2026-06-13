# backend/app/services/scrapers/__init__.py

from app.services.scrapers.base import BaseScraper, RawHackathon
from app.services.scrapers.devfolio import DevfolioScraper
from app.services.scrapers.devpost import DevpostScraper
from app.services.scrapers.unstop import UnstopScraper
from app.services.scrapers.hack2skill import Hack2SkillScraper
from app.services.scrapers.ethglobal import ETHGlobalScraper
from app.services.scrapers.mlh import MLHScraper
from app.services.scrapers.hackerearth import HackerEarthScraper
from app.services.scrapers.kaggle import KaggleScraper
from app.services.scrapers.reskilll import ReskilllScraper

SCRAPERS: dict[str, type[BaseScraper]] = {
    "devfolio":    DevfolioScraper,
    "devpost":     DevpostScraper,
    "unstop":      UnstopScraper,
    "hack2skill":  Hack2SkillScraper,
    "ethglobal":   ETHGlobalScraper,
    "mlh":         MLHScraper,
    "hackerearth": HackerEarthScraper,
    "kaggle":      KaggleScraper,
    "reskilll":    ReskilllScraper,
}
