# backend/app/db/init_db.py

from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401 - registers all models with Base

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating tables...")
    init_db()
    print("Done.")