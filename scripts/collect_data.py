"""
Data collection script for movies and series
"""

import os
import sys
from pathlib import Path
import logging
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from database.connection import get_database
from database.models import Movie, Genre, Person, Rating, BoxOffice
from data.collectors.tmdb_collector import TMDbCollector
from data.collectors.omdb_collector import OMDbCollector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataCollectionPipeline:
    """Main data collection pipeline."""

    def __init__(self):
        self.tmdb_collector = TMDbCollector()
        self.omdb_collector = OMDbCollector()

    def collect_popular_movies(self, pages: int = 5):
        """Collect popular movies from TMDb."""
        logger.info(f"Starting collection of popular movies ({pages} pages)...")

        db = next(get_database())

        try:
            # Get popular movies
            popular_movies = self.tmdb_collector.bulk_collect_popular_movies(pages)
            logger.info(f"Collected {len(popular_movies)} movies")  # Fixed: Collectedd -> Collected

            for movie_data in popular_movies:
                self._process_movie(db, movie_data)

            db.commit()
            logger.info("Popular movies collection completed!")

        except Exception as e:
            logger.error(f"Error in popular movies collection: {e}")
            db.rollback()
            raise
        finally:
            db.close()

    def _process_movie(self, db: Session, movie_data: dict):
        """Process and save a single movie."""
        try:
            # Check if movie already exists
            existing_movie = db.query(Movie).filter(Movie.tmdb_id == movie_data['id']).first()

            if existing_movie:
                logger.info(f"Movie already exists: {movie_data.get('title')}")
                return
            
            # Get detailed movie information
            detailed_movie = self.tmdb_collector.get_movie_details(movie_data['id'])

            # Create movie record
            movie = Movie(
                tmdb_id=detailed_movie['id'],
                imdb_id=detailed_movie.get('imdb_id'),
                title=detailed_movie['title'],
                original_title=detailed_movie.get('original_title'),
                overview=detailed_movie.get('overview'),
                release_date=self._parse_date(detailed_movie.get('release_date')),
                runtime=detailed_movie.get('runtime'),  # Fixed: runntime -> runtime
                budget=detailed_movie.get('budget'),
                revenue=detailed_movie.get('revenue'),
                popularity=detailed_movie.get('popularity'),
                vote_average=detailed_movie.get('vote_average'),
                vote_count=detailed_movie.get('vote_count'),
                poster_path=detailed_movie.get('poster_path'),
                backdrop_path=detailed_movie.get('backdrop_path'),  # Fixed: baackdrop_path -> backdrop_path
                adult=detailed_movie.get('adult', False),
                video=detailed_movie.get('video', False),
                status=detailed_movie.get('status'),
                tagline=detailed_movie.get('tagline'),
                homepage=detailed_movie.get('homepage'),
                original_language=detailed_movie.get('original_language')
            )

            db.add(movie)
            db.flush()  # Get the movie ID

            # Process genres
            self._process_movie_genres(db, movie, detailed_movie.get('genres', []))

            # Collect OMDb data for additional ratings
            if movie.imdb_id:
                self._process_omdb_data(db, movie)

            logger.info(f"Processed movie: {movie.title}")

        except Exception as e:
            logger.error(f"Error processing movie {movie_data.get('title')}: {e}")

    def _process_movie_genres(self, db: Session, movie: Movie, genres_data: list):
        """Process and link movie genres."""
        for genre_data in genres_data:
            genre = db.query(Genre).filter(Genre.tmdb_id == genre_data['id']).first()
            if not genre:
                # Create genre if it doesn't exist
                genre = Genre(
                    tmdb_id=genre_data['id'],
                    name=genre_data['name']
                )
                db.add(genre)
                db.flush()
            
            movie.genres.append(genre)

    def _process_omdb_data(self, db: Session, movie: Movie):
        """Process OMDb data for additional ratings and box office."""
        try:
            omdb_data = self.omdb_collector.get_movie_by_imdb_id(movie.imdb_id)

            if omdb_data:
                # Process ratings
                ratings = self.omdb_collector.extract_ratings(omdb_data)
                for rating_data in ratings:
                    rating = Rating(
                        movie_id=movie.id,
                        source=rating_data['source'],
                        value=rating_data['value'],
                        votes=rating_data.get('votes')
                    )
                    db.add(rating)

                # Process box office
                box_office_data = self.omdb_collector.extract_box_office(omdb_data)
                if box_office_data:
                    box_office = BoxOffice(
                        movie_id=movie.id,
                        **box_office_data
                    )
                    db.add(box_office)

        except Exception as e:
            logger.error(f"Error processing OMDb data for {movie.title}: {e}")

    def _parse_date(self, date_string: str) -> Optional[datetime]:  # Fixed return type
        """Parse date string to datetime object."""
        if not date_string:
            return None
        
        try:
            return datetime.strptime(date_string, '%Y-%m-%d')
        except ValueError:
            return None
        
def main():
    """Main data collection function."""  # Fixed: collecton -> collection
    pipeline = DataCollectionPipeline()

    # Collect popular movies
    pipeline.collect_popular_movies(pages=3)

    logger.info("Data collection completed!")

if __name__ == "__main__":
    main()