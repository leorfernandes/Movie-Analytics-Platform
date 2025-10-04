from rest_framework import serializers
from movies.models import Movie, Studio, Genre, MovieRating, Person


class StudioSerializer(serializers.ModelSerializer):
    """Studio serializer for API responses"""
    movie_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Studio
        fields = ['id', 'name', 'country', 'founded_year', 'website', 'movie_count']
    
    def get_movie_count(self, obj):
        return obj.movie_set.count()


class GenreSerializer(serializers.ModelSerializer):
    """Genre serializer for API responses"""
    
    class Meta:
        model = Genre
        fields = ['id', 'name', 'description']


class MovieRatingSerializer(serializers.ModelSerializer):
    """Movie rating serializer"""
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    class Meta:
        model = MovieRating
        fields = ['id', 'source', 'source_display', 'rating', 'max_rating']


class MovieListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for movie lists"""
    studio_name = serializers.CharField(source='studio.name', read_only=True)
    primary_genre = serializers.SerializerMethodField()
    is_profitable = serializers.ReadOnlyField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'release_date', 'budget', 'revenue', 'roi',
            'studio_name', 'primary_genre', 'is_profitable', 'tmdb_id'
        ]
    
    def get_primary_genre(self, obj):
        """Get the first genre for the movie"""
        first_genre = obj.genres.first()
        return first_genre.name if first_genre else None


class MovieDetailSerializer(serializers.ModelSerializer):
    """Complete movie serializer with all relationships"""
    studio = StudioSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    ratings = MovieRatingSerializer(many=True, read_only=True)
    is_profitable = serializers.ReadOnlyField()
    
    # Business analytics fields
    profit_margin = serializers.SerializerMethodField()
    budget_category = serializers.SerializerMethodField()
    performance_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'original_title', 'release_date', 'runtime', 
            'rating', 'overview', 'budget', 'revenue', 'opening_weekend',
            'roi', 'is_profitable', 'profit_margin', 'budget_category',
            'performance_rating', 'studio', 'genres', 'ratings',
            'tmdb_id', 'imdb_id', 'created_at', 'updated_at'
        ]
    
    def get_profit_margin(self, obj):
        """Calculate profit margin percentage"""
        if obj.budget and obj.revenue and obj.budget > 0:
            margin = ((obj.revenue - obj.budget) / obj.revenue) * 100
            return round(margin, 2)
        return None
    
    def get_budget_category(self, obj):
        """Categorize movie by budget size"""
        if not obj.budget:
            return "Unknown"
        
        budget = float(obj.budget)
        if budget < 1_000_000:
            return "Micro Budget"
        elif budget < 15_000_000:
            return "Low Budget"
        elif budget < 50_000_000:
            return "Medium Budget"
        elif budget < 150_000_000:
            return "High Budget"
        else:
            return "Blockbuster"
    
    def get_performance_rating(self, obj):
        """Business performance assessment"""
        if not obj.roi:
            return "Unknown"
        
        roi = float(obj.roi)
        if roi < -50:
            return "Poor"
        elif roi < 0:
            return "Loss"
        elif roi < 50:
            return "Break Even"
        elif roi < 200:
            return "Good"
        else:
            return "Excellent"


class MovieCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating movies"""
    
    class Meta:
        model = Movie
        fields = [
            'title', 'original_title', 'release_date', 'runtime',
            'rating', 'overview', 'budget', 'revenue', 'opening_weekend',
            'studio', 'tmdb_id', 'imdb_id'
        ]
    
    def create(self, validated_data):
        """Create movie and calculate ROI"""
        movie = Movie.objects.create(**validated_data)
        if movie.budget and movie.revenue:
            movie.calculate_roi()
        return movie
    
    def update(self, instance, validated_data):
        """Update movie and recalculate ROI if needed"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate ROI if budget or revenue changed
        if 'budget' in validated_data or 'revenue' in validated_data:
            instance.calculate_roi()
        
        instance.save()
        return instance