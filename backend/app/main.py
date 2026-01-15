"""
FastAPI application factory.
Main entry point for the payment proof collection system.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Import routers
from app.api import auth, categories, public, submissions


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Payment Proof Collection System",
        description="System for course representatives to collect and verify student payment proofs",
        version="1.0.0"
    )

    # CORS middleware configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth.router)
    app.include_router(categories.router)
    app.include_router(public.router)
    app.include_router(submissions.router)

    # Health check endpoint
    @app.get("/health", tags=["health"])
    def health_check():
        """Health check endpoint for monitoring."""
        return {"status": "ok", "message": "Payment Proof System is running"}

    return app


# Create application instance
app = create_app()
