# Back4App Deployment Guide

This guide will help you deploy the Arabic Softech Smart Business application to Back4App.

## Prerequisites

1. A Back4App account (sign up at https://www.back4app.com)
2. Docker installed on your local machine
3. Git installed on your local machine

## Step 1: Prepare Your Application

1. Make sure all files are committed to your Git repository
2. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. Update the following in `.env`:
   - `JWT_SECRET`: Use a strong, unique secret key
   - `MONGODB_URI`: Will be provided by Back4App

## Step 2: Set Up Back4App

1. Log in to your Back4App account
2. Create a new App:
   - Click "Build new app"
   - Choose "Backend as a Service"
   - Select "Docker" as the deployment method
   - Give your app a name (e.g., "softech-business-arabic")

3. Configure MongoDB:
   - Go to "Database" → "Browser"
   - Back4App will provide you with a MongoDB connection string
   - Copy this connection string for later use

## Step 3: Configure Environment Variables

In your Back4App dashboard:

1. Go to "App Settings" → "Environment Variables"
2. Add the following variables:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Environment mode |
   | `PORT` | `5000` | Server port |
   | `MONGODB_URI` | `<your-back4app-mongodb-uri>` | MongoDB connection string |
   | `JWT_SECRET` | `<your-secret-key>` | JWT secret key |
   | `JWT_EXPIRE` | `30d` | JWT expiration time |

## Step 4: Deploy Using Docker

### Option A: Deploy via Back4App Dashboard

1. In your Back4App dashboard, go to "Cloud Code"
2. Click "Deploy" → "Docker"
3. Connect your Git repository
4. Select the branch to deploy (usually `main` or `master`)
5. Click "Deploy"

### Option B: Deploy via CLI

1. Install Back4App CLI:
   ```bash
   npm install -g back4app-cli
   ```

2. Login to Back4App:
   ```bash
   back4app login
   ```

3. Initialize your project:
   ```bash
   back4app init
   ```

4. Deploy:
   ```bash
   back4app deploy
   ```

## Step 5: Build and Push Docker Image

If deploying manually:

1. Build the Docker image:
   ```bash
   docker build -t softech-business-arabic .
   ```

2. Tag the image:
   ```bash
   docker tag softech-business-arabic:latest <your-back4app-registry>/softech-business-arabic:latest
   ```

3. Push to Back4App registry:
   ```bash
   docker push <your-back4app-registry>/softech-business-arabic:latest
   ```

## Step 6: Verify Deployment

1. Wait for the deployment to complete (usually 2-5 minutes)
2. Check the deployment logs in Back4App dashboard
3. Access your application at the provided URL
4. Test the health endpoint: `https://your-app.back4app.io/api/health`

## Step 7: Seed the Database (Optional)

To populate the database with sample data:

1. Access your Back4App MongoDB through the dashboard
2. Or use the seed script locally and connect to Back4App MongoDB:
   ```bash
   MONGODB_URI=<your-back4app-mongodb-uri> npm run seed
   ```

## Troubleshooting

### Application won't start
- Check the deployment logs in Back4App dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

### Database connection issues
- Verify MongoDB URI format: `mongodb://username:password@host:port/database`
- Check if your IP is whitelisted in Back4App (if required)
- Ensure database user has correct permissions

### Build fails
- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Health check fails
- Check if the application is listening on the correct port
- Verify the health endpoint is accessible
- Check application logs for errors

## Monitoring

Back4App provides:
- Real-time logs
- Performance metrics
- Error tracking
- Automatic scaling

Access these features in your Back4App dashboard under "Analytics" and "Logs".

## Support

For Back4App specific issues:
- Documentation: https://www.back4app.com/docs
- Community: https://www.back4app.com/community
- Support: https://www.back4app.com/support

For application issues:
- Check the TROUBLESHOOTING.md file
- Review application logs
- Contact the development team
