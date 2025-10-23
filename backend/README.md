# 🐍 MovieMetrics Django Backend

Django REST Framework API for movie analytics and business intelligence.

## Architecture
```
Django Apps:
├── movies/ # Movie data models
├── analytics/ # Business intelligence
├── api/ # REST API endpoints
├── users/ # User management
├── reports/ # Report generation
└── cinemetrics/ # Django settings
```

## Quick Start
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## API Endpoints
GET /api/movies/ - Movie database with filtering
GET /api/analytics/ - Business intelligence metrics
GET /api/analytics/studios/ - Studio performance analysis
GET /api/analytics/genres/ - Genre market analysis
GET /api/reports/ - Generate business reports

## Features
✅ Movie database with comprehensive analytics
✅ Business intelligence calculations
✅ Studio and genre performance metrics
✅ Professional report generation
✅ CORS enabled for frontend integration