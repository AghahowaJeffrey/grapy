"""
S3/MinIO storage service for file uploads and retrieval.
Handles receipt file uploads with validation and signed URL generation.
"""
import os
from datetime import datetime, UTC
from typing import BinaryIO

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.config import settings
from app.core.exceptions import BadRequestError


class StorageService:
    """
    Service for managing file storage in S3/MinIO.

    Provides methods for uploading files and generating pre-signed URLs
    for secure file access.
    """

    def __init__(self):
        """Initialize S3 client and ensure bucket exists."""
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT_URL,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            config=Config(signature_version='s3v4')
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """
        Create bucket if it doesn't exist (idempotent operation).

        This is safe to run on startup to ensure the bucket is available.
        """
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code')
            if error_code == '404':
                try:
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                except ClientError as create_error:
                    # Bucket might have been created by another process
                    if create_error.response.get('Error', {}).get('Code') != 'BucketAlreadyOwnedByYou':
                        raise

    def upload_file(self, file: BinaryIO, key: str, content_type: str) -> str:
        """
        Upload file to S3/MinIO.

        Args:
            file: File-like object to upload
            key: S3 object key (path within bucket)
            content_type: MIME type of the file

        Returns:
            The S3 key of the uploaded file

        Raises:
            BadRequestError: If upload fails
        """
        try:
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={'ContentType': content_type}
            )
            return key
        except ClientError as e:
            raise BadRequestError(detail=f"File upload failed: {str(e)}")

    def generate_presigned_url(self, key: str, expiration: int = 3600) -> str:
        """
        Generate a pre-signed URL for viewing a file.

        The URL allows temporary access to the file without exposing S3 credentials.
        Default expiration is 1 hour.

        Args:
            key: S3 object key
            expiration: URL expiration time in seconds (default: 3600 = 1 hour)

        Returns:
            Pre-signed URL string

        Raises:
            BadRequestError: If URL generation fails
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise BadRequestError(detail=f"Failed to generate signed URL: {str(e)}")

    def delete_file(self, key: str):
        """
        Delete a file from S3/MinIO.

        Args:
            key: S3 object key to delete

        Note:
            This is a destructive operation. Use with caution.
            Currently not used (we don't delete submissions), but provided for completeness.
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
        except ClientError as e:
            raise BadRequestError(detail=f"File deletion failed: {str(e)}")


def validate_file_extension(filename: str) -> str:
    """
    Validate file extension against allowed list.

    Args:
        filename: Original filename from upload

    Returns:
        File extension (lowercase with dot, e.g., '.jpg')

    Raises:
        BadRequestError: If file extension is not allowed
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext not in settings.ALLOWED_EXTENSIONS:
        allowed = ', '.join(settings.ALLOWED_EXTENSIONS)
        raise BadRequestError(
            detail=f"File type {ext} not allowed. Allowed types: {allowed}"
        )

    return ext


def validate_file_size(file: BinaryIO, max_size: int) -> int:
    """
    Validate file size doesn't exceed maximum.

    Args:
        file: File-like object to validate
        max_size: Maximum size in bytes (defaults to settings.MAX_UPLOAD_SIZE)

    Returns:
        File size in bytes

    Raises:
        BadRequestError: If file exceeds maximum size
    """
    if max_size is None:
        max_size = settings.MAX_UPLOAD_SIZE

    # Get file size by seeking to end
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset to beginning

    if size > max_size:
        max_mb = max_size / (1024 * 1024)
        raise BadRequestError(
            detail=f"File too large ({size} bytes). Maximum size: {max_mb:.1f} MB"
        )

    return size


def generate_receipt_key(category_id: int, submission_id: int, filename: str) -> str:
    """
    Generate S3 key for receipt file.

    Key format: receipts/{category_id}/{submission_id}/{timestamp}_{filename}

    Args:
        category_id: ID of the payment category
        submission_id: ID of the payment submission
        filename: Original filename (will be sanitized)

    Returns:
        S3 object key string
    """
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    # Sanitize filename (replace spaces with underscores)
    safe_filename = filename.replace(" ", "_")
    key = f"receipts/{category_id}/{submission_id}/{timestamp}_{safe_filename}"
    return key


# Global storage service instance
storage_service = StorageService()
