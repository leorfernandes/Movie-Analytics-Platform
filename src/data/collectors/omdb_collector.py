"""
OMDb API data collector for ratings and box office data
"""
import os
import requests
import time
from typing import Dict, List, Optional, Any
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OMDbCollector:
    """Collector for Open Movie Database (OMDb) API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OMDB_API_KEY")
        self.base_url = "http://www.omdbapi.com/"
        self.session = requests.Session()

        if not self.api_key:
            raise ValueError("OMDb API key is required")
        
    def _make_request(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make authenticated request to OMDb API."""
        params['apikey'] = self.api_key

        try:
            response = self.session.get(self.base_url, params=params)
            response.raise_for_status()

            data = response.json()

            # Check for API errors
            if data.get('Response') == 'False':
                error_msg = data.get('Error', 'Unknown error')
                logger.warning(f"OMDb API error: {error_msg}")
                return {}
            
            return data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to OMDb: {e}")
            return {}
        
    def get_movie_by_imdb_id(self, imdb_id: str) -> Dict[str, Any]:
        """Get movie data by IMDb ID."""
        return self._make_request({
            'i': imdb_id,
            'plot': 'full'
        })
    
    def get_movie_by_title(self, title: str, year: Optional[int] = None) -> Dict[str, Any]:
        """Get movie data by title."""
        params = {'t': title, 'plot': 'full'}
        if year:
            params['y'] = str(year)
        return self._make_request(params)
    
    def search_movies(self, query: str, page: int = 1) -> Dict[str, Any]:
        """Search for movies by title."""
        return self._make_request({
            's': query,
            'page': str(page)
        })
    
    def get_series_by_imdb_id(self, imdb_id: str) -> Dict[str, Any]:
        """Get TV series data by IMDb ID."""
        return self._make_request({
            'i': imdb_id,
            'type': 'series',
            'plot': 'full'
        })
    
    def bulk_collect_by_imdb_ids(self, imdb_ids: List[str]) -> List[Dict[str, Any]]:
        """Collect movie data for multiple IMDb IDs."""
        results = []

        for imdb_id in imdb_ids:
            try:
                logger.info(f"Collecting OMDb data for IMDb ID: {imdb_id}")
                movie_data = self.get_movie_by_imdb_id(imdb_id)

                if movie_data:
                    results.append(movie_data)
                
                # Rate limiting - OMDb allows 1000 requests per day
                time.sleep(0.1)

            except Exception as e:
                logger.error(f"Error collecting data for IMDb ID {imdb_id}: {e}")
                continue
        
        return results

    def extract_ratings(self, movie_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract standardized ratings from OMDb response."""
        ratings = []

        # IMDb rating
        if movie_data.get('imdbRating') and movie_data['imdbRating'] != 'N/A':
            ratings.append({
                'source': 'imdb',
                'value': movie_data['imdbRating'],
                'votes': movie_data.get('imdbVotes', '').replace(',', '') or None
            })

        # Other ratings (Rotten Tomatoes, Metacritic)
        for rating in movie_data.get('Ratings', []):
            source_map = {
                'Rotten Tomatoes': 'rotten_tomatoes',
                'Metacritic': 'metacritic'
            }

            source = source_map.get(rating['Source'])
            if source:
                ratings.append({
                    'source': source,
                    'value': rating['Value'],
                    'votes': None
                })

        return ratings
    
    def extract_box_office(self, movie_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract box office data from OMDb response."""
        box_office = {}

        # Box office gross
        if movie_data.get('BoxOffice') and movie_data['BoxOffice'] != 'N/A':
            # Remove currency symbols and commas
            gross = movie_data['BoxOffice'].replace('$', '').replace(',', '')
            try:
                box_office['domestic_gross'] = int(gross)
            except ValueError:
                pass

            return box_office
        
# Example usage
if __name__ == "__main__":
    #Set up logging
    logging.basicConfig(level=logging.INFO)

    # Initialize collector
    collector = OMDbCollector()

    # Test collection
    movie_data = collector.get_movie_by_title("The Dark Knight", 2008)
    if movie_data:
        print(f"Found movie: {movie_data.get('Title')}")
        ratings = collector.extract_ratings(movie_data)
        print(f"Extracted {len(ratings)} ratings")

        box_office = collector.extract_box_office(movie_data)
        print(f"Box office data: {box_office}")
