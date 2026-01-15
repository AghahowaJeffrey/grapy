# Payment Proof Collection System

A system for course representatives to collect and verify student payment proofs without requiring student accounts.

## Features

- **Admin Dashboard**: Course reps can create payment categories and review submissions
- **Public Submission**: Students submit payment proofs via shareable links (no account required)
- **Payment Verification**: Admins can confirm or reject submissions with notes
- **Receipt Storage**: Secure S3-compatible storage for receipt files
- **CSV Export**: Download submission data for recordkeeping
- **Immutable Audit Trail**: Status changes are logged and cannot be reversed

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Storage**: MinIO (local) / S3 (production)
- **Auth**: JWT (access + refresh tokens)

## Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL and MinIO)

## Setup Instructions

### 1. Start Infrastructure

```bash
# Start PostgreSQL and MinIO
docker-compose up -d

# Verify services are running
docker-compose ps

# Access MinIO console: http://localhost:9001
# Login: minio_admin / minio_password
```

**Note**: If Docker is not running, start Docker Desktop or the Docker daemon first.

### 2. Backend Setup

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Environment is already configured with .env file
# SECRET_KEY has been securely generated

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

### 3. Frontend Setup (Coming in Phase 9)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Development Workflow

### Create New Migration

```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Run Tests (Coming in Phase 14)

```bash
cd backend
source .venv/bin/activate
pytest
```

## Project Structure

```
grapy/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Security utilities
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── services/     # Business logic
│   │   ├── config.py     # Application settings
│   │   ├── database.py   # Database session management
│   │   └── main.py       # FastAPI application factory
│   ├── alembic/          # Database migrations
│   ├── .env              # Environment variables (gitignored)
│   └── requirements.txt  # Python dependencies
├── frontend/             # React application (coming soon)
├── docker-compose.yml    # Infrastructure orchestration
└── README.md             # This file
```

## Current Implementation Status

- [x] Phase 1: Infrastructure Setup (Docker Compose + PostgreSQL + MinIO)
- [x] Phase 2: Backend Foundation (FastAPI + SQLAlchemy + Alembic) - In Progress
- [ ] Phase 3: Authentication System (JWT + Auth endpoints)
- [ ] Phase 4: S3/MinIO Integration (File upload + signed URLs)
- [ ] Phase 5: Category Management (Admin CRUD endpoints)
- [ ] Phase 6: Public Submission Flow (Student payment submission)
- [ ] Phase 7: Admin Review Workflow (Confirm/Reject submissions)
- [ ] Phase 8: CSV Export (Download submissions as CSV)
- [ ] Phase 9: Frontend Setup (React + Router + Auth)
- [ ] Phase 10-14: Frontend pages and polish

## API Endpoints (Planned)

### Authentication
- `POST /api/auth/register` - Create admin account
- `POST /api/auth/login` - Get JWT tokens
- `POST /api/auth/refresh` - Refresh access token

### Categories (Admin)
- `POST /api/categories` - Create payment category
- `GET /api/categories` - List user's categories
- `GET /api/categories/{id}` - Get single category
- `PATCH /api/categories/{id}` - Update category
- `POST /api/categories/{id}/deactivate` - Soft delete

### Public Submission
- `GET /api/public/categories/{token}` - Get category for submission form
- `POST /api/public/categories/{token}/submissions` - Submit payment proof

### Submissions (Admin)
- `GET /api/categories/{id}/submissions` - List submissions
- `PATCH /api/submissions/{id}/confirm` - Confirm submission
- `PATCH /api/submissions/{id}/reject` - Reject submission
- `GET /api/categories/{id}/export.csv` - Download CSV

## Security Considerations

- JWT secret is cryptographically secure (64 characters)
- File uploads validated on server (type, size)
- Public tokens are 32-byte urlsafe (2^192 entropy)
- SQLAlchemy ORM prevents SQL injection
- CORS configured for development (localhost:5173)

## License

MIT
