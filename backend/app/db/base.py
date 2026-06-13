# backend/app/db/base.py

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime, func

class Base(DeclarativeBase):
    pass