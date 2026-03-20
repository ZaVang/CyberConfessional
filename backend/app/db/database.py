from sqlmodel import SQLModel, create_engine, Session

# Use local sqlite file
sqlite_file_name = "cyber_priest.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# Initialize engine, echo=False to avoid spamming the console
engine = create_engine(sqlite_url, echo=False)

def create_db_and_tables():
    from app.models.domain import SoulMatrix, ConfessionLog
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
