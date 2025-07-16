from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'asr_data.db')
SQLALCHEMY_DATABASE_URL = f'sqlite:///{DB_PATH}'

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine) 