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
- **Storage**: Backblaze B2 (S3-compatible cloud storage)
- **Auth**: JWT (access + refresh tokens)

## Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL)
- Backblaze B2 account for file storage

## Setup Instructions

### 1. Configure Backblaze B2 Storage

1. **Create Backblaze Account**:
   - Sign up at [https://www.backblaze.com/b2/sign-up.html](https://www.backblaze.com/b2/sign-up.html)
   - Free tier: 10 GB storage, 1 GB daily download

2. **Create Application Key**:
   - Go to [https://secure.backblaze.com/app_keys.htm](https://secure.backblaze.com/app_keys.htm)
   - Click "Add a New Application Key"
   - Name: `payment-proof-system`
   - Type of Access: Read and Write
   - **Save the keyID and applicationKey** (shown only once!)

3. **Create B2 Bucket**:
   - Go to [https://secure.backblaze.com/b2_buckets.htm](https://secure.backblaze.com/b2_buckets.htm)
   - Click "Create a Bucket"
   - Bucket name: Must be globally unique (e.g., `yourname-payment-receipts`)
   - Files in Bucket: **Private**
   - Note the bucket region (e.g., `us-west-004`)

### 2. Start PostgreSQL

```bash
# Start PostgreSQL
docker-compose up -d

# Verify service is running
docker-compose ps
```

**Note**: If Docker is not running, start Docker Desktop or the Docker daemon first.

### 3. Backend Setup

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Update .env file with your Backblaze B2 credentials:
# S3_ENDPOINT_URL=https://s3.<your-region>.backblazeb2.com
# S3_ACCESS_KEY=<your-keyID>
# S3_SECRET_KEY=<your-applicationKey>
# S3_BUCKET_NAME=<your-bucket-name>
# S3_REGION=<your-region>

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

### 4. Frontend Setup

```bash
cd frontend

# Dependencies are already installed
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

**🎉 Backend: 100% Complete | Frontend: 100% Complete | Overall: Production Ready ✨**

- [x] Phase 1: Infrastructure Setup (Docker Compose + PostgreSQL + MinIO)
- [x] Phase 2: Backend Foundation (FastAPI + SQLAlchemy + Alembic)
- [x] Phase 3: Authentication System (JWT + Auth endpoints)
- [x] Phase 4: S3/MinIO Integration (File upload + signed URLs)
- [x] Phase 5: Category Management (Admin CRUD endpoints)
- [x] Phase 6: Public Submission Flow (Student payment submission)
- [x] Phase 7: Admin Review Workflow (Confirm/Reject submissions)
- [x] Phase 8: CSV Export (Download submissions as CSV)
- [x] Phase 9: Frontend Setup (React + Router + Auth)
- [x] Phase 10: Auth Pages (Login + Registration UI)
- [x] Phase 11: Admin Dashboard (Category management UI)
- [x] Phase 12: Submission Management (Admin review UI)
- [x] Phase 13: Public Submission Page (Student submission UI)
- [x] Phase 14: Polish & Error Handling (Toast notifications, confirmations, error boundaries)

## API Endpoints (All Implemented ✅)

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
