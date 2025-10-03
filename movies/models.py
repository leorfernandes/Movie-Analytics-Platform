from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class Studio(models.Model):
    """Movie studios and production companies"""
    name = models.CharField(max_length=200, unique=True)
    country = models.CharField(max_length=100)
    founded_year = models.IntegerField(null=True, blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Genre(models.Model):
    """Movie genres"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Person(models.Model):
    """Actors, directors, producers, etc."""
    ROLE_CHOICES = [
        ('actor', 'Actor'),
        ('director', 'Director'),
        ('producer', 'Producer'),
        ('writer', 'Writer'),
    ]
    
    name = models.CharField(max_length=200)
    primary_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    birth_date = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_primary_role_display()})"

class Movie(models.Model):
    """Core movie model with business metrics"""
    RATING_CHOICES = [
        ('G', 'G'),
        ('PG', 'PG'),
        ('PG-13', 'PG-13'),
        ('R', 'R'),
        ('NC-17', 'NC-17'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=300)
    original_title = models.CharField(max_length=300, blank=True)
    release_date = models.DateField()
    runtime = models.IntegerField(help_text="Runtime in minutes")
    rating = models.CharField(max_length=10, choices=RATING_CHOICES, blank=True)
    overview = models.TextField()
    
    # External IDs
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    imdb_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # Business Metrics (the important stuff!)
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    opening_weekend = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Relationships
    studio = models.ForeignKey(Studio, on_delete=models.SET_NULL, null=True, blank=True)
    genres = models.ManyToManyField(Genre, blank=True)
    
    # Calculated Business Fields
    roi = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, 
                             help_text="Return on Investment percentage")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-release_date']
        indexes = [
            models.Index(fields=['release_date']),
            models.Index(fields=['revenue']),
            models.Index(fields=['budget']),
        ]

    def __str__(self):
        return f"{self.title} ({self.release_date.year})"
    
    @property
    def is_profitable(self):
        """Check if movie was profitable"""
        if self.budget and self.revenue:
            return self.revenue > self.budget
        return None
    
    def calculate_roi(self):
        """Calculate and save ROI percentage"""
        if self.budget and self.revenue and self.budget > 0:
            roi = ((self.revenue - self.budget) / self.budget) * 100
            self.roi = round(roi, 2)
            self.save()
            return self.roi
        return None

class MovieRating(models.Model):
    """Movie ratings from various sources"""
    SOURCE_CHOICES = [
        ('tmdb', 'TMDB'),
        ('imdb', 'IMDb'),
        ('rt_critics', 'Rotten Tomatoes Critics'),
        ('rt_audience', 'Rotten Tomatoes Audience'),
    ]
    
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='ratings')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    rating = models.DecimalField(max_digits=4, decimal_places=2)
    max_rating = models.DecimalField(max_digits=4, decimal_places=2, default=10)
    
    class Meta:
        unique_together = ['movie', 'source']

    def __str__(self):
        return f"{self.movie.title} - {self.get_source_display()}: {self.rating}"