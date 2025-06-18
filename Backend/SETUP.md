# HealthHub Backend Setup Guide

## Quick Fix for "Authorization server not configured with default connection" Error

This error occurs because your Auth0 tenant is missing the required database connection. Follow these steps to resolve it:

### Step 1: Create Environment File

Create a `.env` file in the `Backend` directory with the following content:

```bash
# API Configuration
API_ORIGIN=http://localhost:5000
PORT=5000
IS_PRODUCTION=false

# Database Configuration
DB_CONNECTION=Server=localhost;Database=HealthHub;Trusted_Connection=true;TrustServerCertificate=true;

# Auth0 Configuration - REPLACE WITH YOUR ACTUAL VALUES
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200

# Email Configuration (Optional for development)
MAIL_SENDER_EMAIL=your-email@gmail.com
MAIL_SENDER_PASSWORD=your-app-password

# Payment Configuration (Optional for development)
CHAPA_API_ORIGIN=https://api.chapa.co
CHAPA_PUBLIC_KEY=your-chapa-public-key
CHAPA_SECRET_KEY=your-chapa-secret-key

# Webhook Configuration (Optional for development)
WEBHOOK_SECRET=your-webhook-secret
```

### Step 2: Configure Auth0 Application

1. **Go to [Auth0 Dashboard](https://manage.auth0.com/)**
2. **Select your application** (or create a new one)
3. **In the Settings tab:**
   - Copy your **Domain**, **Client ID**, and **Client Secret**
   - Add these URLs to **Allowed Callback URLs**: `http://localhost:5000/api/auth/callback`
   - Add these URLs to **Allowed Web Origins**: `http://localhost:4200`
   - Enable **Allow Cross-Origin Authentication**
4. **In the Connections tab:**
   - **ENABLE "Username-Password-Authentication"** ← This fixes your error!
   - Optionally enable "google-oauth2" for Google login

### Step 3: Update .env with Real Values

Replace the placeholder values in your `.env` file:

```bash
# Example with real values (replace with yours):
AUTH0_DOMAIN=myapp.us.auth0.com
AUTH0_AUDIENCE=https://myapp.us.auth0.com/api/v2/
AUTH0_CLIENT_ID=abc123def456ghi789
AUTH0_CLIENT_SECRET=xyz789uvw456rst123
```

### Step 4: Database Setup

1. **Install SQL Server** (if not already installed)
2. **Create the database:**
   ```sql
   CREATE DATABASE HealthHub;
   ```
3. **Run migrations:**
   ```bash
   cd Backend
   dotnet ef database update
   ```

### Step 5: Start the Application

```bash
cd Backend
dotnet watch run
```

## Troubleshooting

### If you still get the same error:

1. **Check Auth0 Connections:**
   - Go to Auth0 Dashboard → Applications → Your App → Connections
   - Make sure "Username-Password-Authentication" is **ENABLED**
   - If it's not there, go to Auth0 Dashboard → Authentication → Database → Create DB Connection

2. **Verify .env file:**
   - Make sure the `.env` file is in the `Backend` directory
   - Check that all Auth0 values are correct
   - No spaces around the `=` sign in environment variables

3. **Check Application Logs:**
   - Look for more specific error messages in the console output
   - Check the `Logs/HealthHub.log` file

### Common Issues:

- **Wrong Auth0 Domain**: Make sure you're using the full domain (e.g., `myapp.us.auth0.com`)
- **Wrong Audience**: Should be `https://your-domain.auth0.com/api/v2/`
- **Connection not enabled**: The "Username-Password-Authentication" connection must be enabled
- **Database not accessible**: Make sure SQL Server is running and the connection string is correct

## Next Steps

After fixing the Auth0 configuration:

1. **Test the API**: Try accessing `http://localhost:5000/swagger` to see the API documentation
2. **Test Authentication**: Try registering/logging in through your frontend
3. **Check Logs**: Monitor the application logs for any other issues

## Support

If you continue to have issues:
1. Check the application logs in `Backend/Logs/HealthHub.log`
2. Verify your Auth0 configuration in the Auth0 dashboard
3. Make sure all environment variables are set correctly in the `.env` file 