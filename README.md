# 🎬 CineMetrics: Movie Analytics Platform

> **Advanced entertainment industry analytics platform for data-driven insights and market intelligence**

[![CI Pipeline](https://github.com/yourusername/Movie-Analytics-Platform/workflows/CI%20Pipeline/badge.svg)](https://github.com/yourusername/Movie-Analytics-Platform/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📊 Analytics Examples](#-analytics-examples)
- [🏗️ Architecture](#️-architecture)
- [📚 API Documentation](#-api-documentation)
- [🧪 Development](#-development)
- [📈 Results](#-results)
- [🤝 Contributing](#-contributing)

## 🎯 Project Overview

**CineMetrics** is a comprehensive analytics platform that provides data-driven insights for entertainment industry stakeholders. Built with Python and modern data engineering practices, it combines multiple data sources to deliver actionable intelligence for content strategy and market analysis.

### 🎭 Target Users
- **Streaming Platforms** (Netflix, Disney+, HBO Max) - Content acquisition and performance benchmarking
- **Production Studios** (Warner Bros, Universal, Sony) - Project greenlight decisions and budget optimization
- **Investors & Analysts** - Market trend analysis and ROI predictions
- **Content Creators** - Genre insights and market positioning strategy

### 💼 Business Value
- **Data-Driven Decisions**: Analytics based on 60+ movies and 19 genres
- **Financial Intelligence**: ROI analysis with 373.5% average return insights
- **Market Intelligence**: Genre performance and trend identification
- **Professional Reporting**: Automated visualizations and comprehensive metrics

## ✨ Features

### 📊 **Analytics Engine**
- **Genre Performance Analysis** - Compare average ratings, movie counts, and performance ranges across genres
- **Movie Rankings** - Top/bottom performers with detailed metrics and financial data
- **Financial ROI Analysis** - Budget vs revenue correlation with profit/loss calculations
- **Data Visualizations** - Beautiful charts and graphs for all analytics

### 🔄 **Data Collection Pipeline**
- **TMDb API Integration** - Movies, TV shows, cast, crew, and detailed metadata
- **OMDb API Integration** - Additional ratings, box office data, and reviews
- **Automated Data Validation** - Cleaning and processing pipelines
- **Real-time Updates** - Scheduled data collection and refresh

### 🛠️ **Technical Features**
- **SQLAlchemy ORM** - Robust database models and relationships
- **Professional Code Quality** - Black formatting, pre-commit hooks, CI/CD
- **Comprehensive Testing** - Automated quality checks and validation
- **Docker Ready** - Containerized deployment support

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Git
- TMDb API Key ([Get yours here](https://www.themoviedb.org/settings/api))
- OMDb API Key ([Get yours here](http://www.omdbapi.com/apikey.aspx))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Movie-Analytics-Platform.git
   cd Movie-Analytics-Platform
   ```

2. **Set up virtual environment**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # macOS/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Initialize database**
   ```bash
   python scripts/init_database.py
   ```

6. **Collect sample data**
   ```bash
   python scripts/collect_data.py
   ```

7. **Run analytics**
   ```bash
   python src/analytics/performance.py
   ```

## 📊 Analytics Examples

### Genre Performance Analysis
```
🎭 GENRE PERFORMANCE ANALYSIS
==================================================

 GENRE RATINGS SUMMARY (17 genres analyzed)
--------------------------------------------------
          Genre  Avg Rating  Movie Count  Min Rating  Max Rating  Rating Range
          Music        8.40            1        8.40        8.40          0.00
      Animation        7.51            6        6.07        8.40          2.33
        Mystery        7.38            2        7.17        7.59          0.42
      Adventure        7.24           13        5.96        8.02          2.06
```

### Financial ROI Analysis
```
💰 FINANCIAL PERFORMANCE ANALYSIS
==================================================

📈 FINANCIAL OVERVIEW (29 movies with financial data):
------------------------------------------------------------
💸 Total Budget:     $2,815,000,000
💰 Total Revenue:    $11,027,135,321
📊 Total Profit:     $8,212,135,321
🎯 Average ROI:      373.5%

🚀 TOP 5 ROI PERFORMERS:
----------------------------------------
1. Ne Zha (2019)
   💰 ROI: 3276.0% | Rating: 7.915/10
   💵 Budget: $22,000,000 → Revenue: $742,718,496
```

### Data Visualizations
The platform automatically generates professional charts:
- **Genre Performance Bar Chart** - Average ratings by genre
- **Rating Distribution Histogram** - Movie rating spread analysis
- **Top Movies Chart** - Horizontal bar chart of best performers
- **Genre Distribution Pie Chart** - Market share by genre

## 🏗️ Architecture

### Tech Stack
- **Backend**: Python 3.11+, SQLAlchemy, pandas, numpy
- **Database**: SQLite (development), PostgreSQL (production ready)
- **APIs**: TMDb API, OMDb API
- **Visualization**: matplotlib, seaborn, plotly
- **Quality Assurance**: Black, isort, flake8, pre-commit hooks
- **CI/CD**: GitHub Actions

### Project Structure
```
CineMetrics/
├── src/
│   ├── analytics/          # Performance analysis and visualizations
│   ├── api/               # FastAPI endpoints (planned)
│   ├── data/              # Data collection and processing
│   ├── database/          # Database models and connections
│   └── ml/                # Machine learning models (planned)
├── scripts/               # Utility scripts for setup and data collection
├── tests/                 # Comprehensive test suite
├── docs/                  # Additional documentation
└── infrastructure/        # Deployment configurations
```

### Database Schema
- **Movies** - Core movie metadata, ratings, budget/revenue
- **Genres** - Genre classification with many-to-many relationships
- **People** - Cast and crew information
- **Ratings** - Multi-source rating aggregation (IMDb, Rotten Tomatoes, Metacritic)
- **Box Office** - Financial performance tracking

## 📚 API Documentation

### Analytics Endpoints (Planned)
```python
# Genre Performance
GET /api/genres/performance
Response: Genre ratings, counts, and performance metrics

# Movie Rankings
GET /api/movies/top?limit=10
Response: Highest-rated movies with detailed info

# Financial Analysis
GET /api/analytics/financial
Response: ROI analysis, budget categories, profit/loss data

# Data Visualizations
GET /api/visualizations/genre-performance
Response: Chart data for frontend rendering
```

## 🧪 Development

### Code Quality
```bash
# Install pre-commit hooks
pre-commit install

# Run all quality checks
pre-commit run --all-files

# Format code
black .
isort .
```

### Testing
```bash
# Run analytics test
python src/analytics/performance.py

# Generate visualizations
python src/analytics/visualizations.py

# Test data collection
python test_data_collection.py
```

### Contributing Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📈 Results

### Key Metrics Achieved
- **60+ Movies** analyzed across 17 genres
- **$11B+ Revenue** tracked with financial insights
- **373.5% Average ROI** across analyzed films
- **29 Movies** with complete financial data
- **4 Visualization Types** automatically generated

### Industry Insights Discovered
- **Animation** shows consistent high performance (7.51/10 average)
- **Action** dominates market share (50% of collection)
- **Low-Mid Budget** films ($50M-$150M) achieve highest ROI (489.2%)
- **Ne Zha franchise** demonstrates exceptional ROI (3000%+ returns)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork and clone the repository
2. Set up development environment
3. Install pre-commit hooks
4. Make your changes
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDb](https://www.themoviedb.org/) for comprehensive movie database API
- [OMDb](http://www.omdbapi.com/) for additional ratings and box office data
- The open-source community for excellent tools and libraries

---

**Built with ❤️ and lots of ☕by Leo Fernandes**
