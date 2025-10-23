# 📊 Data Pipeline - Feature Branch

This branch contains **ONLY** the data collection and processing pipeline for MovieMetrics.

## 📦 What's in This Branch
- ✅ `src/` - Data collectors, processors, and analytics engine
  - TMDb API integration
  - OMDb API integration
  - Data validation and cleaning
  - Database models and connections
- ✅ `scripts/` - Utility scripts for data operations
  - Database initialization
  - Data collection automation
  - Testing utilities

## ❌ What's NOT in This Branch
- Django backend → See `feature/django-backend` branch
- React frontend → See `feature/react-frontend` branch
- Docker/Infrastructure → See `development` or `main` branch

## 🚀 Quick Start

```bash
# Set up environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure API keys in .env file
cp .env.example .env
# Edit .env with your TMDb and OMDb API keys

# Initialize database
python scripts/init_database.py

# Collect movie data
python scripts/collect_data.py

# Run analytics
python src/analytics/performance.py
```

## 🎯 Branch Purpose
This feature branch demonstrates:

Clean separation of concerns - Data pipeline isolated
Git workflow best practices - Feature branch development
Professional code organization - Modular data engineering
Team collaboration simulation - Ready for code reviews

## 🔗 Related Branches
main - Production-ready full project
development - Integration branch with all components
feature/django-backend - Django REST API (backend only)
feature/react-frontend - React dashboard (frontend only)

## 🛠️ Tech Stack
Python 3.11+
SQLAlchemy for database ORM
Requests for API calls
Pandas for data processing
TMDb & OMDb APIs