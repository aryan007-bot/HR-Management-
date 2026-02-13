# Deployment Guide - HR Management System

## Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Storage bucket configured
- [ ] Environment variables prepared
- [ ] Code tested locally
- [ ] Default super admin password changed

## Supabase Production Setup

### 1. Database Configuration

```sql
-- Execute in Supabase SQL Editor (Production)
-- Copy content from database/schema.sql

-- Important: After execution, change default super admin password
UPDATE users 
SET password_hash = '<new_bcrypt_hash>' 
WHERE email = 'superadmin@system.com';
```

### 2. Storage Bucket Setup

1. Go to Storage in Supabase Dashboard
2. Create bucket: `employee-documents`
3. Configuration:
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: Configure as needed

4. Set up bucket policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-documents');

-- Allow users to view their company's documents
CREATE POLICY "Users can view company documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents');
```

### 3. Row Level Security (Optional but Recommended)

```sql
-- Example RLS policy for users table
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Example RLS for employees
CREATE POLICY "Users can view company employees"
ON employees FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);
```

## Deployment Platforms

### Option 1: Render

1. **Create Account**: Sign up at [render.com](https://render.com)

2. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - Name: hr-management-api
     - Environment: Node
     - Build Command: `npm install`
     - Start Command: `npm start`

3. **Environment Variables**:
```
NODE_ENV=production
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key
JWT_SECRET=your_strong_secret_key
PORT=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Deploy**: Click "Create Web Service"

### Option 2: Railway

1. **Create Project**: Go to [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - New Project
   - Deploy from GitHub repo
   - Select repository

3. **Configure**:
   - Add environment variables
   - Railway auto-detects Node.js
   - Sets PORT automatically

4. **Custom Domain** (optional):
   - Settings → Domains
   - Add custom domain

### Option 3: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create hr-management-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_ROLE=your_key
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 4: AWS EC2

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Configure security group: Open ports 22, 80, 443, 5000

2. **Connect and Setup**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd hr-management-backend

# Install dependencies
npm install

# Create .env file
nano .env
# Paste environment variables

# Start with PM2
pm2 start src/server.js --name hr-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/hr-api
```

3. **Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hr-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 5: DigitalOcean App Platform

1. **Create App**:
   - Apps → Create App
   - Connect GitHub
   - Select repository

2. **Configure**:
   - Detected as Node.js
   - Build Command: `npm install`
   - Run Command: `npm start`

3. **Environment Variables**: Add in App settings

4. **Deploy**: Automatic deployment on git push

## Post-Deployment

### 1. Verify Deployment

```bash
# Health check
curl https://your-api-url.com/health

# Expected response:
{
  "success": true,
  "message": "HR Management System API is running",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Test Authentication

```bash
# Login
curl -X POST https://your-api-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@system.com",
    "password": "SuperAdmin@123"
  }'
```

### 3. Change Default Password

```bash
# After login, change password immediately
curl -X POST https://your-api-url.com/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SuperAdmin@123",
    "newPassword": "NewSecurePassword@2024"
  }'
```

### 4. Create First Company

```bash
curl -X POST https://your-api-url.com/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Company Name"
  }'
```

## Monitoring

### Setup Logging

Use PM2 for process management and logging:

```bash
# View logs
pm2 logs hr-api

# Monitor
pm2 monit

# Restart
pm2 restart hr-api
```

### Error Tracking

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: APM monitoring

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- Better Uptime

## Security Best Practices

1. **Environment Variables**:
   - Never commit .env files
   - Use strong JWT secret (min 32 characters)
   - Rotate secrets regularly

2. **HTTPS**:
   - Always use SSL in production
   - Use Let's Encrypt for free SSL

3. **Rate Limiting**:
   - Already configured in the app
   - Adjust limits based on usage

4. **CORS**:
   - Configure allowed origins in production
   - Don't use `*` wildcard

5. **Database**:
   - Enable RLS in Supabase
   - Regular backups
   - Monitor query performance

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for session storage (if needed)
- Implement caching layer

### Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Monitor slow queries

### Storage Optimization
- CDN for document delivery
- Implement file compression
- Set up lifecycle policies

## Backup Strategy

### Database Backups
- Supabase automatic daily backups
- Manual backups before major changes
- Test restore procedures

### Storage Backups
- Supabase storage has built-in replication
- Consider additional backup to S3

## Rollback Procedure

```bash
# If deployment fails, rollback to previous version

# Heroku
heroku rollback

# PM2
pm2 restart hr-api --update-env

# Manual
git checkout previous-stable-commit
npm install
pm2 restart hr-api
```

## Support Contacts

- **Supabase Issues**: Check dashboard logs
- **Deployment Issues**: Platform-specific docs
- **Application Issues**: Check application logs

## Cost Estimation

### Supabase (Free Tier)
- Database: Up to 500MB
- Storage: 1GB
- Bandwidth: 2GB

### Hosting
- **Render Free**: $0/month (limited)
- **Railway**: ~$5-10/month
- **Heroku**: ~$7/month (Eco dyno)
- **AWS EC2**: ~$5-10/month (t2.micro)
- **DigitalOcean**: ~$5/month (Basic droplet)

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review rate limit hits
- Check storage usage
- Update dependencies monthly
- Security patches immediately

### Monthly Tasks
- Review user access
- Archive old data
- Performance optimization
- Cost analysis

---

**Production Checklist**

- [ ] Database schema deployed
- [ ] Storage bucket configured
- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Default password changed
- [ ] First company created
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation shared

**Your API is now production-ready! 🚀**
