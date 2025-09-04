# Create this file as: test_db.py

import os
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

print("Step 1: Testing imports...")

try:
    from dotenv import load_dotenv
    print("✅ dotenv imported")
    
    load_dotenv()
    database_url = os.getenv("DATABASE_URL", "Not found")
    print(f"✅ Database URL: {database_url}")
    
    import sqlalchemy
    print(f"✅ SQLAlchemy version: {sqlalchemy.__version__}")
    
    from sqlalchemy import create_engine
    print("✅ create_engine imported")
    
    engine = create_engine(database_url)
    print("✅ Engine created")
    
    from database.models import Base
    print("✅ Models imported")
    
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(sqlalchemy.text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        print(f"✅ Tables in database: {tables}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()