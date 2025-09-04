"""
Initialize the CineMetrics database with tables and basic data
"""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

import logging

from data.collectors.tmdb_collector import TMDbCollector
from database.connection import create_tables, drop_tables, get_database
from database.models import Genre, Movie, Person

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def initialize_database():
    """Initialize database with tables and basic data."""
    try:
        logger.info("Creating database tables...")
        create_tables()
        logger.info("Database tables created successfully!")

        # Initialize basic genres
        logger.info("Initializing genres...")
        initialize_genres()

        logger.info("Database initialization completed!")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


def initialize_genres():
    """Initialize genre from TMDb."""
    try:
        collector = TMDbCollector()
        db = next(get_database())

        # Get movie genres
        movie_genres = collector.get_genres("movie")

        for genre_data in movie_genres.get("genres", []):
            existing_genre = (
                db.query(Genre).filter(Genre.tmdb_id == genre_data["id"]).first()
            )

            if not existing_genre:
                genre = Genre(tmdb_id=genre_data["id"], name=genre_data["name"])
                db.add(genre)

        db.commit()
        logger.info(f"Initialized {len(movie_genres.get('genres', []))} genres")

    except Exception as e:
        logger.error(f"Error initializing genres: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    initialize_database()
