"""
Performance analytic for movies and genres
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd
from sqlalchemy import func
from sqlalchemy.orm import Session

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from database.connection import get_database
from database.models import Genre, Movie, Rating


class GenrePerformanceAnalyzer:
    """Analyze genre performance metrics."""

    def __init__(self):
        self.db = next(get_database())

    def get_genre_ratings_summary(self) -> pd.DataFrame:
        """Get average ratings and movie counts by genre."""

        # Query to get genre performance data
        query = (
            self.db.query(
                Genre.name.label("genre"),
                func.avg(Movie.vote_average).label("avg_rating"),
                func.count(Movie.id).label("movie_count"),
                func.min(Movie.vote_average).label("min_rating"),
                func.max(Movie.vote_average).label("max_rating"),
            )
            .join(Movie.genres)
            .group_by(Genre.name)
            .order_by(func.avg(Movie.vote_average).desc())
        )

        results = query.all()

        # Convert to DataFrame for easy analysis
        data = []
        for result in results:
            data.append(
                {
                    "Genre": result.genre,
                    "Avg Rating": round(result.avg_rating, 2),
                    "Movie Count": result.movie_count,
                    "Min Rating": round(result.min_rating, 2),
                    "Max Rating": round(result.max_rating, 2),
                    "Rating Range": round(result.max_rating - result.min_rating, 2),
                }
            )

        return pd.DataFrame(data)

    def get_top_movies_by_genre(self, genre_name: str, limit: int = 5) -> List[Dict]:
        """Get top-rated movies for a specific genre."""

        movies = (
            self.db.query(Movie)
            .join(Movie.genres)
            .filter(Genre.name == genre_name)
            .order_by(Movie.vote_average.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "title": movie.title,
                "rating": movie.vote_average,
                "release_year": movie.release_date.year
                if movie.release_date
                else "Unknown",
                "budget": f"${movie.budget:,}" if movie.budget else "Unknown",
                "revenue": f"${movie.revenue:,}" if movie.revenue else "Unknown",
            }
            for movie in movies
        ]

    def get_top_movies(self, limit: int = 10) -> List[Dict]:
        """Get highest-rated movies overall."""
        movies = (
            self.db.query(Movie).order_by(Movie.vote_average.desc()).limit(limit).all()
        )

        return [
            {
                "title": movie.title,
                "rating": movie.vote_average,
                "release_year": movie.release_date.year
                if movie.release_date
                else "Unknown",
                "vote_count": movie.vote_count or 0,
                "genres": [genre.name for genre in movie.genres],
                "budget": f"${movie.budget:,}" if movie.budget else "Unknown",
                "revenue": f"${movie.revenue:,}" if movie.revenue else "Unknown",
            }
            for movie in movies
        ]

    def get_bottom_movies(self, limit: int = 10) -> List[Dict]:
        """Get lowest-rated movies overall."""
        movies = (
            self.db.query(Movie).order_by(Movie.vote_average.asc()).limit(limit).all()
        )

        return [
            {
                "title": movie.title,
                "rating": movie.vote_average,
                "release_year": movie.release_date.year
                if movie.release_date
                else "Unknown",
                "vote_count": movie.vote_count or 0,
                "genres": [genre.name for genre in movie.genres],
            }
            for movie in movies
        ]

    def analyze_movie_rankings(self) -> None:
        """Print comprehensive movie ranking analysis."""
        print("MOVIE RANKING ANALYSIS")
        print("=" * 50)

        # Top movies
        print("TOP 10 HIGHEST-RATED MOVIES:")
        print("-" * 30)
        top_movies = self.get_top_movies(10)
        for i, movie in enumerate(top_movies, 1):
            genres_str = ", ".join(movie["genres"][:2])  # Show first 2 genres
            print(
                f"{i:2d}. {movie['title']} ({movie['release_year']}) - {movie['rating']}/10"
            )
            print(f"  Genres: {genres_str} | Votes: {movie['vote_count']}")

        # Bottom movies
        print("BOTTOM 10 LOWEST RATED MOVIES:")
        print("-" * 30)
        bottom_movies = self.get_bottom_movies(10)
        for i, movie in enumerate(bottom_movies, 1):
            genres_str = ", ".join(movie["genres"][:2])
            print(
                f"{i:2d}. {movie['title']} ({movie['release_year']}) - {movie['rating']}/10"
            )
            print(f"   Genres: {genres_str} | Votes: {movie['vote_count']}")

        # Quick stats
        if top_movies and bottom_movies:
            print(f"\n QUICK STATS:")
            print(
                f"   Best Movie: {top_movies[0]['title']} ({top_movies[0]['rating']}/10)"
            )
            print(
                f"   Worst Movie: {bottom_movies[0]['title']} ({bottom_movies[0]['rating']}/10)"
            )
            print(
                f"   Rating Range: {top_movies[0]['rating'] - bottom_movies[0]['rating']:.2f} points"
            )

    def analyze_all_genres(self) -> None:
        """Print comprehensive genre analysis."""
        print("GENRE PERFORMANCE ANALYSIS")
        print("=" * 50)

        # Get genre summary
        df = self.get_genre_ratings_summary()

        if df.empty:
            print("No genre data found")
            return

        print(f"\nGENRE RATINGS SUMMARY ({len(df)} genres analyzed)")
        print("-" * 50)
        print(df.to_string(index=False))

        # Best performing genre
        best_genre = df.iloc[0]
        print(f"\nBEST PERFORMING GENRE:")
        print(
            f"   {best_genre['Genre']} - {best_genre['Avg Rating']}/10 ({best_genre['Movie Count']} movies)"
        )

        # Worst performing genre
        worst_genre = df.iloc[-1]
        print(f"\nLOWEST RATED GENRE:")
        print(
            f"   {worst_genre['Genre']} - {worst_genre['Avg Rating']}/10 ({worst_genre['Movie Count']} movies)"
        )

        # Most represented genre
        most_movies = df.loc[df["Movie Count"].idxmax()]
        print(f"\nMOST REPRESENTED GENRE:")
        print(f"   {most_movies['Genre']} - {most_movies['Movie Count']}")

        # Show top movies for best genre
        print(f"\nTOP MOVIES IN '{best_genre['Genre']}':")
        top_movies = self.get_top_movies_by_genre(best_genre["Genre"])
        for i, movie in enumerate(top_movies, 1):
            print(
                f"   {i}. {movie['title']} ({movie['release_year']}) - {movie['rating']}/10"
            )

    def analyze_financial_performance(self) -> None:
        """Analyze budget vs revenue and ROI for movies."""
        print("\nFINANCIAL PERFORMANCE ANALYSIS")
        print("=" * 50)

        # Get movies with both budget and revenue data
        movies_with_finance = (
            self.db.query(Movie).filter(Movie.budget > 0, Movie.revenue > 0).all()
        )

        if not movies_with_finance:
            print("No financial data available (budget and revenue)")
            return

        # Calculate financial metrics
        financial_data = []
        for movie in movies_with_finance:
            profit = movie.revenue - movie.budget
            roi = (profit / movie.budget) * 100 if movie.budget > 0 else 0

            financial_data.append(
                {
                    "title": movie.title,
                    "budget": movie.budget,
                    "revenue": movie.revenue,
                    "profit": profit,
                    "roi": roi,
                    "rating": movie.vote_average,
                    "release_year": movie.release_date.year
                    if movie.release_date
                    else "Unknown",
                }
            )

        # Sort by ROI
        financial_data.sort(key=lambda x: x["roi"], reverse=True)

        print(
            f"\nFINANCIAL OVERVIEW ({len(financial_data)} movies with financial data):"
        )
        print("-" * 60)

        if financial_data:
            total_budget = sum(movie["budget"] for movie in financial_data)
            total_revenue = sum(movie["revenue"] for movie in financial_data)
            total_profit = total_revenue - total_budget
            avg_roi = sum(movie["roi"] for movie in financial_data) / len(
                financial_data
            )

            print(f"Total Budget:     ${total_budget:,}")
            print(f"Total Revenue:    ${total_revenue:,}")
            print(f"Total Profit:     ${total_profit:,}")
            print(f"Average ROI:      {avg_roi:.1f}%")

        # Top ROI performers
        print(f"\nTOP 5 ROI PERFORMERS:")
        print("-" * 40)
        for i, movie in enumerate(financial_data[:5], 1):
            print(f"{i}. {movie['title']} ({movie['release_year']})")
            print(f"   ROI: {movie['roi']:.1f}% | Rating: {movie['rating']}/10")
            print(f"   Budget: ${movie['budget']:,} → Revenue: ${movie['revenue']:,}")

        # Worst ROI performers
        if len(financial_data) >= 5:
            print(f"\nBOTTOM 5 ROI PERFORMERS:")
            print("-" * 40)
            for i, movie in enumerate(financial_data[-5:], 1):
                print(f"{i}. {movie['title']} ({movie['release_year']})")
                print(f"   ROI: {movie['roi']:.1f}% | Rating: {movie['rating']}/10")
                print(
                    f"   Budget: ${movie['budget']:,} → Revenue: ${movie['revenue']:,}"
                )

        # Budget categories analysis
        print(f"\nBUDGET CATEGORY ANALYSIS:")
        print("-" * 40)

        # Categorize by budget
        low_budget = [m for m in financial_data if m["budget"] < 50_000_000]
        mid_budget = [
            m for m in financial_data if 50_000_000 <= m["budget"] < 150_000_000
        ]
        high_budget = [m for m in financial_data if m["budget"] >= 150_000_000]

        categories = [
            ("Low Budget (<$50M)", low_budget),
            ("Mid Budget ($50M-$150M)", mid_budget),
            ("High Budget (>$150M)", high_budget),
        ]

        for category_name, category_movies in categories:
            if category_movies:
                avg_roi = sum(m["roi"] for m in category_movies) / len(category_movies)
                avg_rating = sum(m["rating"] for m in category_movies) / len(
                    category_movies
                )
                print(f"{category_name}: {len(category_movies)} movies")
                print(
                    f"   Average ROI: {avg_roi:.1f}% | Average Rating: {avg_rating:.1f}/10"
                )

    def close(self):
        """Close database connection."""
        self.db.close()


# Example usage
if __name__ == "__main__":
    analyzer = GenrePerformanceAnalyzer()
    analyzer.analyze_all_genres()
    analyzer.analyze_movie_rankings()
    analyzer.analyze_financial_performance()
    analyzer.close()
