from django.contrib import admin
from .models import Studio, Genre, Person, Movie, MovieRating

@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'founded_year']
    list_filter = ['country']
    search_fields = ['name']

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_role', 'nationality']
    list_filter = ['primary_role', 'nationality']
    search_fields = ['name']

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'release_date', 'studio', 'budget', 'revenue', 'roi']
    list_filter = ['release_date', 'rating', 'studio', 'genres']
    search_fields = ['title', 'overview']
    readonly_fields = ['roi', 'created_at', 'updated_at']
    
    # Add calculate ROI action
    actions = ['calculate_roi_for_selected']
    
    def calculate_roi_for_selected(self, request, queryset):
        for movie in queryset:
            movie.calculate_roi()
        self.message_user(request, f"ROI calculated for {queryset.count()} movies.")
    calculate_roi_for_selected.short_description = "Calculate ROI for selected movies"

@admin.register(MovieRating)
class MovieRatingAdmin(admin.ModelAdmin):
    list_display = ['movie', 'source', 'rating', 'max_rating']
    list_filter = ['source']
    search_fields = ['movie__title']