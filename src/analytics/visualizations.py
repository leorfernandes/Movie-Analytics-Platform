"""
Data visualization for CineMetrics analytics
"""

import sys
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from typing import List, Dict
import numpy as np

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from database.connection import get_database
from database.models import Movie, Genre
from analytics.performance import GenrePerformanceAnalyzer

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class MovieDataVisualizer:
    """Create visualizations for movie analytics."""

    def __init__(self):
        self.analyzer = GenrePerformanceAnalyzer()

    def create_genre_performance_chart(self, save_path: str = "genre_performance.png"):
        """Create bar chart showing average rating by genre."""
        df = self.analyzer.get_genre_ratings_summary()

        if df.empty:
            print("No data available for genre performance chart")
            return
        
        # Create figure and axis
        plt.figure(figsize=(12, 8))

        # Create bar chart
        bars = plt.bar(df['Genre'], df['Avg Rating'],
                       color=sns.color_palette("viridis", len(df)))
        
        # Customize the chart
        plt.title('Genre Performance Analysis\nAverage Ratings by Genre',
                  fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Genre', fontsize=12, fontweight='bold')
        plt.ylabel('Average Rating (out of 10)', fontsize=12, fontweight='bold')

        # Rotate x-axis labels for better readability
        plt.xticks(rotation=45, ha='right')

        # Add value labels on bars
        for bar, rating in zip(bars, df['Avg Rating']):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.05,
                     f'{rating:.1f}', ha='center', va='bottom', fontweight='bold')
        
        # Add movie count as text below bars
        for i, (genre, count) in enumerate(zip(df['Genre'], df['Movie Count'])):
            plt.text(i, 0.2, f'({count} movies)', ha='center', va='bottom',
                     fontsize=9, style='italic')
            
        # Customize grid and layout
        plt.grid(axis='y', alpha=0.3, linestyle='--')
        plt.ylim(0, 10)
        plt.tight_layout()

        # Save the chart
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Genre performance chart saved as: {save_path}")
        plt.show()

    def create_rating_distribution(self, save_path: str = "rating_distribution.png"):
        """Create histogram showing distribution of movie ratings."""
        db = next(get_database())

        # Get all movie ratings
        movies = db.query(Movie).all()
        ratings = [movie.vote_average for movie in movies if movie.vote_average]

        if not ratings:
            print("No rating data available")
            db.close()
            return
        
        plt.figure(figsize=(10, 6))

        # Create histogram
        plt.hist(ratings, bins=20, color='skyblue', alpha=0.7, edgecolor='black')

        # Add mean line
        mean_rating = np.mean(ratings)
        plt.axvline(mean_rating, color='red', linestyle='--', linewidth=2,
                    label=f'Average: {mean_rating:.2f}')
        
        # Customize
        plt.title('Movie Rating Distribution\nHow Your Movies are Rated',
                  fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Rating (out of 10)', fontsize=12, fontweight='bold')
        plt.ylabel('Number of Movies', fontsize=12, fontweight='bold')
        plt.legend()
        plt.grid(axis='y', alpha=0.3)

        # Add statistics text
        stats_text = f"""
        Total Movies: {len(ratings)}
        Average Rating: {mean_rating:.2f}
        Best Rating: {max(ratings):.1f}
        Worst Rating: {min(ratings):.1f}
        """
        plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes,
                 verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Rating distribution chart saved as: {save_path}")
        plt.show()

        db.close()

    def create_top_movies_chart(self, limit: int = 10, save_path: str = "top_movies.png"):
        """Create horizontal bar chart of top-rated movies."""
        top_movies = self.analyzer.get_top_movies(limit)

        if not top_movies:
            print("No movie data available")
            return
        
        # Prepare data
        titles = [f"{movie['title']} ({movie['release_year']})" for movie in top_movies]
        ratings = [movie['rating'] for movie in top_movies]

        # Create horizontal bar chart
        plt.figure(figsize=(12, 8))
        bars = plt.barh(range(len(titles)), ratings, color=sns.color_palette("rocket", len(titles)))

        # Customize
        plt.title(f'Top {limit} Highest-Rated Movies', fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Rating (out of 10)', fontsize=12, fontweight='bold')
        plt.ylabel('Movies', fontsize=12, fontweight='bold')

        # Set y-axis labels
        plt.yticks(range(len(titles)), titles)

        # Add rating labels on bars
        for i, (bar, rating) in enumerate(zip(bars, ratings)):
            plt.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height()/2,
                     f'{rating:.1f}', va='center', fontweight='bold')
            
        plt.xlim(0, 10)
        plt.grid(axis='x', alpha=0.3)
        plt.tight_layout()

        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Top movies chart saved as: {save_path}")
        plt.show()

    def create_genre_distribution_pie(self, save_path: str = "genre_distribution.png"):
        """Create pie chart showing genre distribution."""
        df = self.analyzer.get_genre_ratings_summary()

        if df.empty:
            print("No genre data available")
            return
        
        plt.figure(figsize=(10, 8))

        # Create pie chart
        colors = sns.color_palette("Set3", len(df))
        wedges, texts, autotexts = plt.pie(df['Movie Count'], labels=df['Genre'],
                                           autopct='%1.1f%%', colors=colors, startangle=90)
    
        # Enhance text
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')

        plt.title('Genre Distribution in Your Collection\nPercentage of Movies by Genre',
                  fontsize=16, fontweight='bold', pad=20)
        
        # Add legend with movie counts
        legend_labels = [f"{genre} ({count} movies)" for genre, count in zip(df['Genre'], df['Movie Count'])]
        plt.legend(wedges, legend_labels, title="Genres", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))

        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Genre distribution chart saved as: {save_path}")
        plt.show()

    def create_all_visualizations(self):
        """Create all visualizations at once."""
        print("Creating all visualizations...")
        print("=" * 50)

        self.create_genre_performance_chart()
        self.create_rating_distribution()
        self.create_top_movies_chart()
        self.create_genre_distribution_pie()

        print("\n All visualizations completed!")
        print("Check your project folder for the image files!")

    def close(self):
        """Close analyzer connection."""
        self.analyzer.close()

# Example usage
if __name__ == "__main__":
    visualizer = MovieDataVisualizer()
    visualizer.create_all_visualizations()
    visualizer.close()