import requests
import time
from django.core.management.base import BaseCommand
from movies.models import Movie, Studio, Genre, MovieRating
from datetime import datetime
from django.conf import settings
from decouple import config

class Command(BaseCommand):
    help = 'Import popular movies from TMDB API'
    
    def __init__(self):
        super().__init__()
        # Get your free API key from https://www.themoviedb.org/settings/api
        self.api_key = config('TMDB_API_KEY', default='PUT_YOUR_TMDB_API_KEY_HERE')
        self.base_url = "https://api.themoviedb.org/3"
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of movies to import (default: 10)'
        )
    
    def handle(self, *args, **options):
        count = options['count']
        self.stdout.write(f"Importing {count} popular movies...")
        
        # Get popular movies
        url = f"{self.base_url}/movie/popular"
        params = {'api_key': self.api_key}
        
        response = requests.get(url, params=params)
        if response.status_code != 200:
            self.stdout.write(self.style.ERROR(f"API Error: {response.status_code}"))
            return
            
        data = response.json()
        movies_imported = 0
        
        for movie_data in data.get('results', [])[:count]:
            try:
                # Get detailed movie info
                detail_url = f"{self.base_url}/movie/{movie_data['id']}"
                detail_response = requests.get(detail_url, params={'api_key': self.api_key})
                
                if detail_response.status_code == 200:
                    details = detail_response.json()
                    
                    # Parse release date
                    release_date = None
                    if details.get('release_date'):
                        try:
                            release_date = datetime.strptime(details['release_date'], '%Y-%m-%d').date()
                        except ValueError:
                            continue
                    
                    if not release_date:
                        continue
                    
                    # Create or get studio
                    studio = None
                    if details.get('production_companies'):
                        company = details['production_companies'][0]
                        studio, _ = Studio.objects.get_or_create(
                            name=company['name'],
                            defaults={'country': company.get('origin_country', '')}
                        )
                    
                    # Create movie
                    movie, created = Movie.objects.get_or_create(
                        tmdb_id=details['id'],
                        defaults={
                            'title': details['title'],
                            'original_title': details.get('original_title', ''),
                            'release_date': release_date,
                            'runtime': details.get('runtime', 120),
                            'overview': details.get('overview', ''),
                            'budget': details.get('budget') if details.get('budget') else None,
                            'revenue': details.get('revenue') if details.get('revenue') else None,
                            'studio': studio,
                        }
                    )
                    
                    if created:
                        # Add genres
                        for genre_data in details.get('genres', []):
                            genre, _ = Genre.objects.get_or_create(name=genre_data['name'])
                            movie.genres.add(genre)
                        
                        # Add rating
                        if details.get('vote_average'):
                            MovieRating.objects.get_or_create(
                                movie=movie,
                                source='tmdb',
                                defaults={
                                    'rating': details['vote_average'],
                                    'max_rating': 10
                                }
                            )
                        
                        # Calculate ROI
                        if movie.budget and movie.revenue:
                            movie.calculate_roi()
                        
                        movies_imported += 1
                        self.stdout.write(f"✓ Imported: {movie.title}")
                
                time.sleep(0.3)  # Rate limiting
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error: {e}"))
                continue
        
        self.stdout.write(
            self.style.SUCCESS(f"Successfully imported {movies_imported} movies!")
        )