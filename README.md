# 🐍 Django Backend - Feature Branch

This branch contains **ONLY** the Django REST Framework backend for MovieMetrics.

## 📦 What's in This Branch
- ✅ `backend/` - Complete Django application with REST API
- ✅ Movie analytics and business intelligence engine
- ✅ User management and authentication system
- ✅ Database models and migrations

## ❌ What's NOT in This Branch
- React frontend → See `feature/react-frontend` branch
- Data pipeline/ML → See `feature/data-pipeline` branch
- Docker/Infrastructure → See `development` or `main` branch

## 🚀 Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend will run on: http://localhost:8000

## 🎯 Branch Purpose
This feature branch demonstrates:

Clean separation of concerns - Backend isolated from frontend
Git workflow best practices - Feature branch development
Professional code organization - Component-based structure
Team collaboration simulation - Ready for code reviews

## 🔗 Related Branches
main - Production-ready full project
development - Integration branch with all components
feature/react-frontend - React dashboard (frontend only)
feature/data-pipeline - Data collection and ML (data only)

## 📚 Backend Documentation
For detailed backend documentation, see backend/README.md