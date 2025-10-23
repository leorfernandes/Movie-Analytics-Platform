from .movie_views import (
    MovieListCreateView,
    MovieDetailView,
    StudioListView,
    GenreListView,
    movie_analytics,
    profitable_movies,
    movies_by_budget_range,
    ml_training_data
)

__all__ = [
    'MovieListCreateView',
    'MovieDetailView', 
    'StudioListView',
    'GenreListView',
    'movie_analytics',
    'profitable_movies',
    'movies_by_budget_range',
    'ml_training_data'
]