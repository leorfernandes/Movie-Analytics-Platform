"""
Database models for CineMetrics platform
"""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Associate tables for many-to-many relationships
movie_genre_association = Table(
    "movies_genres",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id")),
    Column("genre_id", Integer, ForeignKey("genres.id")),
)

movie_cast_association = Table(
    "movie_cast",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id")),
    Column("person_id", Integer, ForeignKey("people.id")),
    Column("character_name", String(255)),
    Column("order", Integer),
)

movie_crew_association = Table(
    "movie_crew",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id")),
    Column("person_id", Integer, ForeignKey("people.id")),
    Column("job", String(100)),
    Column("department", String(100)),
)


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    imdb_id = Column(String(20), unique=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    original_title = Column(String(255))
    overview = Column(Text)
    release_date = Column(DateTime)  # Fixed: DataTime -> DateTime
    runtime = Column(Integer)
    budget = Column(Integer)
    revenue = Column(Integer)  # Fixed: revenuew -> revenue
    popularity = Column(Float)
    vote_average = Column(Float)
    vote_count = Column(Integer)
    poster_path = Column(String(255))
    backdrop_path = Column(String(255))
    adult = Column(Boolean, default=False)
    video = Column(Boolean, default=False)
    status = Column(String(50))
    tagline = Column(String(500))
    homepage = Column(String(500))
    original_language = Column(String(10))

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    genres = relationship(
        "Genre", secondary=movie_genre_association, back_populates="movies"
    )
    cast = relationship(
        "Person", secondary=movie_cast_association, back_populates="acted_movies"
    )  # Fixed: seconday -> secondary
    crew = relationship(
        "Person", secondary=movie_crew_association, back_populates="crew_movies"
    )  # Fixed: back_poplates -> back_populates
    ratings = relationship("Rating", back_populates="movie")
    box_office = relationship("BoxOffice", back_populates="movie", uselist=False)


class TVSeries(Base):
    __tablename__ = "tv_series"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    imdb_id = Column(String(20), unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    original_name = Column(String(255))
    overview = Column(Text)
    first_air_date = Column(DateTime)
    last_air_date = Column(DateTime)
    number_of_episodes = Column(Integer)
    number_of_seasons = Column(Integer)
    episode_run_time = Column(String(100))
    popularity = Column(Float)
    vote_average = Column(Float)
    vote_count = Column(Integer)
    poster_path = Column(String(255))
    backdrop_path = Column(String(255))
    adult = Column(Boolean, default=False)
    status = Column(String(50))
    tagline = Column(String(500))
    homepage = Column(String(500))
    original_language = Column(String(10))

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    imdb_id = Column(String(20), unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    birthday = Column(DateTime)
    deathday = Column(DateTime)
    gender = Column(Integer)
    biography = Column(Text)
    place_of_birth = Column(String(255))
    profile_path = Column(String(255))
    popularity = Column(Float)
    adult = Column(Boolean, default=False)
    known_for_department = Column(String(100))

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    acted_movies = relationship(
        "Movie", secondary=movie_cast_association, back_populates="cast"
    )
    crew_movies = relationship(
        "Movie", secondary=movie_crew_association, back_populates="crew"
    )  # Fixed: back_populate -> back_populates


class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)

    # Relationships
    movies = relationship(
        "Movie", secondary=movie_genre_association, back_populates="genres"
    )


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    source = Column(String(50), nullable=False)  # imdb, rotten_tomatoes, metacritic
    value = Column(String(50), nullable=False)
    votes = Column(Integer)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    movie = relationship("Movie", back_populates="ratings")


class BoxOffice(Base):
    __tablename__ = "box_office"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))  # Fixed: moveis -> movies
    domestic_gross = Column(Integer)
    international_gross = Column(Integer)
    worldwide_gross = Column(Integer)
    opening_weekend = Column(Integer)
    widest_release = Column(Integer)

    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    movie = relationship("Movie", back_populates="box_office")


class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"

    id = Column(Integer, primary_key=True, index=True)  # Added missing id column
    movie_id = Column(Integer, ForeignKey("movies.id"))
    source = Column(String(50))  # twitter, reddit, review
    sentiment_score = Column(Float)  # -1 to 1
    confidence = Column(Float)  # 0 to 1
    review_count = Column(Integer)
    positive_mentions = Column(Integer)
    negative_mentions = Column(Integer)
    neutral_mentions = Column(Integer)

    # Timestamps
    analysis_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
