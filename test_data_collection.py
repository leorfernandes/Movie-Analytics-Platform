"""
Test data collection pipeline
"""

import os
import sys
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

print("🎬 Testing CineMetrics Data Collection Pipeline\n")

try:
    from dotenv import load_dotenv

    load_dotenv()

    # Test TMDb collector
    print("1️⃣ Testing TMDb Collector...")
    from data.collectors.tmdb_collector import TMDbCollector

    tmdb = TMDbCollector()
    print(f"✅ TMDb API Key loaded: {tmdb.api_key[:10]}...")

    # Test basic API call
    print("   📡 Testing API connection...")
    popular_movies = tmdb.get_popular_movies(page=1)
    movie_count = len(popular_movies.get("results", []))
    print(f"   ✅ Retrieved {movie_count} popular movies")

    if movie_count > 0:
        first_movie = popular_movies["results"][0]
        print(f"   🎭 Sample movie: {first_movie.get('title')}")

        # Test detailed movie info
        print("   📋 Testing detailed movie info...")
        details = tmdb.get_movie_details(first_movie["id"])
        print(f"   ✅ Got details for: {details.get('title')}")
        print(f"   📅 Release date: {details.get('release_date')}")
        print(f"   💰 Budget: ${details.get('budget', 0):,}")
        print(f"   🎯 Rating: {details.get('vote_average')}/10")

    print("\n2️⃣ Testing OMDb Collector...")
    from data.collectors.omdb_collector import OMDbCollector

    omdb = OMDbCollector()
    print(f"✅ OMDb API Key loaded: {omdb.api_key}...")

    # Test with a known movie
    print("   📡 Testing API connection...")
    movie_data = omdb.get_movie_by_title("The Dark Knight", 2008)

    if movie_data:
        print(f"   ✅ Retrieved: {movie_data.get('Title')}")
        print(f"   🎭 Director: {movie_data.get('Director')}")
        print(f"   ⭐ IMDb Rating: {movie_data.get('imdbRating')}")

        # Test ratings extraction
        ratings = omdb.extract_ratings(movie_data)
        print(f"   📊 Extracted {len(ratings)} ratings")
        for rating in ratings:
            print(f"      - {rating['source']}: {rating['value']}")

    print("\n3️⃣ Testing Database Integration...")
    from database.connection import get_database
    from database.models import Genre, Movie

    # Test database connection
    db = next(get_database())
    movie_count = db.query(Movie).count()
    genre_count = db.query(Genre).count()

    print(f"   ✅ Database connected")
    print(f"   📊 Current movies in DB: {movie_count}")
    print(f"   🏷️ Current genres in DB: {genre_count}")

    db.close()

    print("\n🎉 All tests passed! Data collection pipeline is ready!")
    print("\n🚀 Next step: Run the full data collection:")
    print("   python scripts/collect_data.py")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback

    traceback.print_exc()
