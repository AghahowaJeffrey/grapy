# Backblaze B2 Setup Guide

This guide walks you through setting up Backblaze B2 cloud storage for the Payment Proof Collection System.

## Why Backblaze B2?

- **S3-compatible API**: Works with existing S3 clients (boto3)
- **Cost-effective**: $5/TB/month storage, $10/TB download
- **Free tier**: 10 GB storage, 1 GB daily download
- **No egress fees**: First 3x your storage is free
- **Reliable**: 99.9% uptime SLA

## Setup Steps

### 1. Create Backblaze Account

1. Visit [https://www.backblaze.com/b2/sign-up.html](https://www.backblaze.com/b2/sign-up.html)
2. Sign up with your email
3. Verify your email address
4. Complete account setup

**Free Tier Benefits:**
- 10 GB of storage
- 1 GB of daily download bandwidth
- No credit card required for free tier

### 2. Create Application Key

Application keys are used to authenticate API requests from your application.

1. **Login to Backblaze**:
   - Go to [https://secure.backblaze.com/](https://secure.backblaze.com/)

2. **Navigate to App Keys**:
   - Click on "App Keys" in the left sidebar
   - Or visit: [https://secure.backblaze.com/app_keys.htm](https://secure.backblaze.com/app_keys.htm)

3. **Create New Key**:
   - Click "Add a New Application Key"
   - Fill in the form:
     - **Name of Key**: `payment-proof-system` (or any descriptive name)
     - **Allow access to Bucket(s)**: Select "All" or specific bucket (create bucket first if selecting specific)
     - **Type of Access**: Select "Read and Write"
     - **Allow List All Bucket Names**: Check this box
     - **File name prefix**: Leave empty (allows access to all files)
     - **Duration**: Leave empty (never expires)

4. **Save Credentials**:
   - Click "Create New Key"
   - **IMPORTANT**: You will see:
     - `keyID` (looks like: `005a1b2c3d4e5f6g7h8i9j0k`)
     - `applicationKey` (looks like: `K005abcdefghijklmnopqrstuvwxyz`)
   - **Copy both values immediately** - the applicationKey is shown only once!
   - Store them in a secure password manager

### 3. Create B2 Bucket

Buckets are containers for your files (similar to folders, but at the root level).

1. **Navigate to Buckets**:
   - Click on "Buckets" in the left sidebar
   - Or visit: [https://secure.backblaze.com/b2_buckets.htm](https://secure.backblaze.com/b2_buckets.htm)

2. **Create Bucket**:
   - Click "Create a Bucket"
   - Fill in the form:
     - **Bucket Name**: Must be globally unique across all B2 users
       - Example: `yourcompany-payment-receipts`
       - Example: `johndoe-uni-payments-2026`
       - Must be 6-50 characters, lowercase letters, numbers, hyphens
     - **Files in Bucket are**: Select **"Private"** (important for security!)
     - **Default Encryption**: "Disable" (we're not storing sensitive data)
     - **Object Lock**: "Disable" (not needed)
     - **Lifecycle Settings**: Leave empty for now

3. **Note the Region**:
   - After creating, note the endpoint URL shown
   - Example: `s3.us-west-004.backblazeb2.com`
   - The region is the part between `s3.` and `.backblazeb2.com` (e.g., `us-west-004`)

**Available Regions:**
- `us-west-001` - US West (California)
- `us-west-002` - US West (California)
- `us-west-004` - US West (Arizona)
- `us-east-005` - US East (Florida)
- `eu-central-003` - EU Central (Amsterdam)

### 4. Configure Backend Environment

Update your `backend/.env` file with the Backblaze credentials:

```bash
# Backblaze B2 / S3 Configuration
S3_ENDPOINT_URL=https://s3.us-west-004.backblazeb2.com
S3_ACCESS_KEY=005a1b2c3d4e5f6g7h8i9j0k
S3_SECRET_KEY=K005abcdefghijklmnopqrstuvwxyz
S3_BUCKET_NAME=yourcompany-payment-receipts
S3_REGION=us-west-004
```

**Important**:
- Replace `us-west-004` with your actual region
- Replace access keys with your actual credentials
- Replace bucket name with your actual bucket name
- **Never commit `.env` to git** (it's in `.gitignore`)

### 5. Test the Connection

Start your backend server and test file upload:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Then:
1. Register an admin account
2. Create a payment category
3. Try submitting a payment proof via the public link
4. Check if the file appears in your Backblaze B2 bucket

## Verifying Files in Backblaze

1. Go to your Backblaze dashboard: [https://secure.backblaze.com/b2_buckets.htm](https://secure.backblaze.com/b2_buckets.htm)
2. Click on your bucket name
3. Click "Browse Files"
4. You should see uploaded receipts in the `receipts/` folder structure

## Troubleshooting

### Error: "Access Denied" or "403 Forbidden"

**Cause**: Application key doesn't have proper permissions

**Solution**:
1. Check that your application key has "Read and Write" access
2. Verify the bucket name in `.env` matches exactly
3. Try creating a new application key with "All Buckets" access

### Error: "Bucket Not Found" or "404"

**Cause**: Bucket name doesn't exist or is misspelled

**Solution**:
1. Verify bucket name in `.env` matches exactly (case-sensitive)
2. Check bucket exists in Backblaze dashboard
3. Ensure S3_REGION matches your bucket's region

### Error: "Invalid Endpoint"

**Cause**: S3_ENDPOINT_URL is incorrect

**Solution**:
1. Format must be: `https://s3.<region>.backblazeb2.com`
2. Check your bucket's region in Backblaze dashboard
3. No trailing slash in endpoint URL

### Error: "Signature Does Not Match"

**Cause**: Access keys are incorrect

**Solution**:
1. Verify S3_ACCESS_KEY is your keyID (not applicationKey)
2. Verify S3_SECRET_KEY is your applicationKey (not keyID)
3. Check for extra spaces or newlines in `.env` values
4. Try creating a new application key

## Cost Estimates

### Free Tier (First 10 GB)
- Storage: **FREE** (up to 10 GB)
- Downloads: **FREE** (up to 1 GB/day)
- API Calls: **FREE** (Class C: uploads, deletes)

### Beyond Free Tier
- **Storage**: $5/TB/month ($0.005/GB/month)
- **Downloads**: $10/TB ($0.01/GB)
  - First 3x your stored data is FREE
  - Example: If you store 100 GB, first 300 GB of downloads/month is free
- **API Calls**: Class B (downloads): $4 per 10,000 calls

### Example Costs
- **100 receipts/day** (5 MB each):
  - Storage: 500 MB/day × 30 days = 15 GB/month
  - Downloads: 10 views/receipt = 5 GB/month
  - **Cost**: ~$0.08/month (within free tier if <10 GB stored)

- **1,000 receipts/day**:
  - Storage: 150 GB/month
  - Downloads: 50 GB/month (within 3x free tier)
  - **Cost**: ~$0.70/month

## Security Best Practices

1. **Use Private Buckets**: Never set bucket to "Public"
2. **Pre-signed URLs**: Application generates temporary URLs (1 hour expiry)
3. **Rotate Keys**: Periodically create new application keys
4. **Restrict Key Access**: Use bucket-specific keys when possible
5. **Monitor Usage**: Check Backblaze dashboard for unusual activity
6. **Backup Keys**: Store application keys in password manager
7. **Environment Variables**: Never commit `.env` to git

## Additional Resources

- **Backblaze B2 Documentation**: [https://www.backblaze.com/b2/docs/](https://www.backblaze.com/b2/docs/)
- **S3-Compatible API**: [https://www.backblaze.com/b2/docs/s3_compatible_api.html](https://www.backblaze.com/b2/docs/s3_compatible_api.html)
- **Pricing Calculator**: [https://www.backblaze.com/b2/cloud-storage-pricing.html](https://www.backblaze.com/b2/cloud-storage-pricing.html)
- **Support**: [https://help.backblaze.com/](https://help.backblaze.com/)

## Migration from MinIO (if applicable)

If you previously used MinIO for local development:

1. **Stop MinIO containers**:
   ```bash
   docker-compose down
   docker volume rm grapy_minio_data
   ```

2. **Update environment variables** as shown in step 4

3. **Restart application**:
   ```bash
   docker-compose up -d  # Only PostgreSQL now
   cd backend && uvicorn app.main:app --reload
   ```

4. **Test with new storage**: Submit a test payment proof

5. **Verify in Backblaze**: Check files appear in bucket

No data migration needed - Backblaze will start storing new uploads. Old MinIO data is gone once volume is removed.
