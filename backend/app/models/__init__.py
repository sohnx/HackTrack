# backend/app/models/__init__.py

from .user import User
from .hackathon import Hackathon
from .milestone import Milestone
from .team import Team, TeamMember
from .resource import Resource
from .notification import Notification
from .tag import Tag, HackathonTag
from .discovered_hackathon import DiscoveredHackathon