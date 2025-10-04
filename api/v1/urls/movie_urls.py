from django.urls import path
from api.v1.views.movie_views import (
    MovieListCreateView, MovieDetailView, StudioListView, GenreListView,
    movie_analytics, profitable_movies, movies_by_budget_range, ml_training_data
)

app_name = 'movies_api'

urlpatterns = [
    # 🎬 Core movie CRUD operations
    path('movies/', MovieListCreateView.as_view(), name='movie-list-create'),
    path('movies/<int:pk>/', MovieDetailView.as_view(), name='movie-detail'),
    
    # 🏢 Reference data
    path('studios/', StudioListView.as_view(), name='studio-list'),
    path('genres/', GenreListView.as_view(), name='genre-list'),
    
    # 📊 Business Intelligence endpoints
    path('analytics/', movie_analytics, name='movie-analytics'),
    path('movies/profitable/', profitable_movies, name='profitable-movies'),
    path('movies/budget-range/', movies_by_budget_range, name='movies-by-budget-range'),
    
    # 🤖 ML training data
    path('ml-training-data/', ml_training_data, name='ml-training-data'),
]