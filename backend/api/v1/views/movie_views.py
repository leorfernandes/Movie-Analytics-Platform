from rest_framework import generics, filters, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Sum, Count
from movies.models import Movie, Studio, Genre
from api.v1.serializers.movie_serializers import (
    MovieListSerializer, MovieDetailSerializer, MovieCreateUpdateSerializer,
    StudioSerializer, GenreSerializer
)


class MovieListCreateView(generics.ListCreateAPIView):
    """
    GET: List all movies with filtering and search
    POST: Create new movie
    """
    queryset = Movie.objects.select_related('studio').prefetch_related('genres')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'overview', 'studio__name']
    filterset_fields = ['rating', 'studio', 'genres']
    ordering_fields = ['release_date', 'budget', 'revenue', 'roi']
    ordering = ['-release_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MovieCreateUpdateSerializer
        return MovieListSerializer


class MovieDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Movie details with full information
    PUT/PATCH: Update movie
    DELETE: Delete movie
    """
    queryset = Movie.objects.select_related('studio').prefetch_related('genres', 'ratings')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return MovieCreateUpdateSerializer
        return MovieDetailSerializer


class StudioListView(generics.ListAPIView):
    """List all studios with movie counts"""
    queryset = Studio.objects.annotate(movie_count=Count('movie')).order_by('name')
    serializer_class = StudioSerializer


class GenreListView(generics.ListAPIView):
    """List all genres"""
    queryset = Genre.objects.all().order_by('name')
    serializer_class = GenreSerializer


@api_view(['GET'])
def movie_analytics(request):
    """
    🎯 BUSINESS INTELLIGENCE ENDPOINT
    This will power your React dashboard!
    """
    # Basic statistics
    total_movies = Movie.objects.count()
    movies_with_budget = Movie.objects.exclude(budget__isnull=True).count()
    movies_with_revenue = Movie.objects.exclude(revenue__isnull=True).count()
    
    # Financial analytics
    total_budget = Movie.objects.aggregate(Sum('budget'))['budget__sum'] or 0
    total_revenue = Movie.objects.aggregate(Sum('revenue'))['revenue__sum'] or 0
    avg_roi = Movie.objects.exclude(roi__isnull=True).aggregate(Avg('roi'))['roi__avg']
    
    # Profitability analysis
    profitable_movies = Movie.objects.filter(roi__gt=0).count()
    loss_movies = Movie.objects.filter(roi__lt=0).count()
    
    # Top performers
    top_revenue_movies = Movie.objects.exclude(revenue__isnull=True).order_by('-revenue')[:5]
    top_roi_movies = Movie.objects.exclude(roi__isnull=True).order_by('-roi')[:5]
    
    # Genre analysis
    genre_performance = Genre.objects.annotate(
        movie_count=Count('movie'),
        avg_revenue=Avg('movie__revenue'),
        avg_roi=Avg('movie__roi')
    ).order_by('-avg_revenue')[:10]
    
    # Studio analysis
    studio_performance = Studio.objects.annotate(
        movie_count=Count('movie'),
        total_revenue=Sum('movie__revenue'),
        avg_roi=Avg('movie__roi')
    ).order_by('-total_revenue')[:10]
    
    analytics_data = {
        'overview': {
            'total_movies': total_movies,
            'movies_with_budget': movies_with_budget,
            'movies_with_revenue': movies_with_revenue,
            'completion_rate': round((movies_with_revenue / total_movies * 100), 2) if total_movies > 0 else 0
        },
        'financial_summary': {
            'total_budget': total_budget,
            'total_revenue': total_revenue,
            'overall_roi': round(((total_revenue - total_budget) / total_budget * 100), 2) if total_budget > 0 else 0,
            'average_roi': round(avg_roi, 2) if avg_roi else 0
        },
        'profitability': {
            'profitable_movies': profitable_movies,
            'loss_movies': loss_movies,
            'success_rate': round((profitable_movies / (profitable_movies + loss_movies) * 100), 2) if (profitable_movies + loss_movies) > 0 else 0
        },
        'top_performers': {
            'by_revenue': MovieListSerializer(top_revenue_movies, many=True).data,
            'by_roi': MovieListSerializer(top_roi_movies, many=True).data
        },
        'genre_insights': [
            {
                'name': genre.name,
                'movie_count': genre.movie_count,
                'avg_revenue': genre.avg_revenue,
                'avg_roi': round(genre.avg_roi, 2) if genre.avg_roi else 0
            }
            for genre in genre_performance if genre.avg_revenue
        ],
        'studio_insights': [
            {
                'name': studio.name,
                'movie_count': studio.movie_count,
                'total_revenue': studio.total_revenue,
                'avg_roi': round(studio.avg_roi, 2) if studio.avg_roi else 0
            }
            for studio in studio_performance if studio.total_revenue
        ]
    }
    
    return Response(analytics_data)


@api_view(['GET'])
def profitable_movies(request):
    """Get all profitable movies (ROI > 0) - DASHBOARD FILTER"""
    movies = Movie.objects.filter(roi__gt=0).order_by('-roi')
    serializer = MovieListSerializer(movies, many=True)
    return Response({
        'count': len(serializer.data),
        'results': serializer.data
    })


@api_view(['GET'])
def movies_by_budget_range(request):
    """Get movies filtered by budget range - BUSINESS FILTERING"""
    min_budget = request.query_params.get('min_budget', 0)
    max_budget = request.query_params.get('max_budget', 999999999)
    
    movies = Movie.objects.filter(
        budget__gte=min_budget,
        budget__lte=max_budget
    ).exclude(budget__isnull=True).order_by('-budget')
    
    serializer = MovieListSerializer(movies, many=True)
    return Response({
        'filters': {
            'min_budget': min_budget,
            'max_budget': max_budget
        },
        'count': len(serializer.data),
        'results': serializer.data
    })


@api_view(['GET'])
def ml_training_data(request):
    """
    🤖 SPECIAL ENDPOINT FOR ML MODELS
    Provides clean, formatted data for training
    """
    # Get movies with complete data for ML training
    movies = Movie.objects.exclude(
        budget__isnull=True
    ).exclude(
        revenue__isnull=True
    ).exclude(
        roi__isnull=True
    ).select_related('studio').prefetch_related('genres')
    
    ml_data = []
    for movie in movies:
        # Feature engineering for ML
        ml_data.append({
            'title': movie.title,
            'budget': float(movie.budget),
            'revenue': float(movie.revenue),
            'roi': float(movie.roi),
            'runtime': movie.runtime,
            'year': movie.release_date.year,
            'month': movie.release_date.month,
            'studio': movie.studio.name if movie.studio else 'Unknown',
            'genre_count': movie.genres.count(),
            'primary_genre': movie.genres.first().name if movie.genres.first() else 'Unknown',
            'budget_category': MovieDetailSerializer().get_budget_category(movie),
            'performance_rating': MovieDetailSerializer().get_performance_rating(movie),
            # Binary success indicator for classification
            'is_successful': movie.roi > 50,  # Define success as ROI > 50%
        })
    
    return Response({
        'count': len(ml_data),
        'training_data': ml_data,
        'features': [
            'budget', 'runtime', 'year', 'month', 'studio', 
            'genre_count', 'primary_genre', 'budget_category'
        ],
        'target_variables': ['roi', 'is_successful']
    })