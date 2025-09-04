"""
TMDb API data collector for movies and TV series
"""

import logging
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class TMDbCollector:
    """Collector for The Movie Database (TMDb) API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("TMDB_API_KEY")
        self.base_url = "https://api.themoviedb.org/3"
        self.session = requests.Session()

        if not self.api_key:
            raise ValueError("TMDb API key is required")

    def _make_request(
        self, endpoint: str, params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make authenticated request to TMDb API."""
        if params is None:
            params = {}

        params["api_key"] = self.api_key
        url = f"{self.base_url}/{endpoint}"

        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()

            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 1))
                logger.warning(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self._make_request(endpoint, params)

            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to {url}: {e}")
            raise

    def get_popular_movies(self, page: int = 1) -> Dict[str, Any]:
        """Get popular movies from TMDb."""
        return self._make_request("movie/popular", {"page": page})

    def get_movie_details(self, movie_id: int) -> Dict[str, Any]:
        """Get detailed information for a specific movie."""
        return self._make_request(
            f"movie/{movie_id}",
            {"append_to_response": "credits,reviews,keywords,videos"},
        )

    def get_movie_credits(self, movie_id: int) -> Dict[str, Any]:
        """Get cast and crew information for a movie."""
        return self._make_request(f"movie/{movie_id}/credits")

    def get_popular_tv_series(self, page: int = 1) -> Dict[str, Any]:
        """Get popular TV series from TMDb"""
        return self._make_request("tv/popular", {"page": page})

    def get_tv_details(self, tv_id: int) -> Dict[str, Any]:
        """Get detailed information for a specific TV series."""
        return self._make_request(
            f"tv/{tv_id}", {"append_to_response": "credits,review,keywords,videos"}
        )

    def search_movies(
        self, query: str, page: int = 1, year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Search for movies by title."""
        params = {"query": query, "page": page}
        if year:
            params["year"] = year
        return self._make_request("search/movie", params)

    def search_tv_series(self, query: str, page: int = 1) -> Dict[str, Any]:
        """Search for TV series by name."""
        return self._make_request("search/tv", {"query": query, "page": page})

    def get_person_details(self, person_id: int) -> Dict[str, Any]:
        """Get detailed information for a person."""
        return self._make_request(
            f"person/{person_id}", {"append_to_response": "movie_credits,tv_credits"}
        )

    def get_genres(self, media_type: str = "movie") -> Dict[str, Any]:
        """Get list of genres for movies or TV."""
        return self._make_request(f"genre/{media_type}/list")

    def discover_movies(self, **kwargs) -> Dict[str, Any]:
        """Discover movies with various filters."""
        return self._make_request("discover/movie", kwargs)

    def get_trending(
        self, media_type: str = "movie", time_window: str = "day"
    ) -> Dict[str, Any]:
        """Get trending movies or TV series."""
        return self._make_request(f"trending/{media_type}/{time_window}")

    def bulk_collect_popular_movies(self, pages: int = 10) -> List[Dict[str, Any]]:
        """Collect popular movies from multiple pages."""
        all_movies = []

        for page in range(1, pages + 1):
            logger.info(f"Collecting popular movies - page {page}")
            response = self.get_popular_movies(page)
            all_movies.extend(response.get("results", []))

            # Rate limiting - TMDb allows 40 requests per 10 seconds
            time.sleep(0.25)

        return all_movies

    def collect_movie_details_bulk(self, movie_ids: List[int]) -> List[Dict[str, Any]]:
        """Collect detailed information for multiple movies."""
        detailed_movies = []

        for movie_id in movie_ids:
            try:
                logger.info(f"Collecting details for movie ID: {movie_id}")
                movie_details = self.get_movie_details(movie_id)
                detailed_movies.append(movie_details)

                # Rate limiting
                time.sleep(0.25)

            except Exception as e:
                logger.error(f"Error collecting details for movie {movie_id}: {e}")
                continue

        return detailed_movies


# Example usage
if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(level=logging.INFO)

    # Initialize collector
    collector = TMDbCollector()

    # Test collection
    popular_movies = collector.get_popular_movies()
    print(f"Found {len(popular_movies.get('results', []))} popular movies")

    if popular_movies.get("results"):
        first_movie = popular_movies["results"][0]
        movie_details = collector.get_movie_details(first_movie["id"])
        print(f"Collected details for: {movie_details.get('title')}")
