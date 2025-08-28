# Deployment Guide

## GitHub Repository Setup

### 1. Create GitHub Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: MLM Platform with Binary Tree Architecture"

# Add remote repository
git remote add origin https://github.com/yourusername/mlm-platform.git

# Push to GitHub
git push -u origin main
```

### 2. Environment Variables Setup

Create `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Netlify Deployment

#### Option A: Connect GitHub to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify dashboard

#### Option B: Manual Deployment
1. Run `npm run build` locally
2. Drag and drop the `dist` folder to Netlify

### 4. Supabase Configuration

#### Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/20250715185532_dusty_sea.sql`

#### Edge Functions Deployment
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

### 5. Third-Party Service Configuration

#### Gmail SMTP Setup
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Google Account → Security → App Passwords
   - Select "Mail" and generate password
3. Configure in Admin Panel:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail address
   - Password: Generated App Password

#### Twilio SMS Setup
1. Create account at [Twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token from Console
3. Purchase phone number or use trial number
4. Configure in Admin Panel:
   - Account SID: From Twilio Console
   - Auth Token: From Twilio Console
   - From Number: Your Twilio phone number

### 6. Admin Panel Access

Default admin credentials:
- URL: `your-domain.com/backpanel/login`
- Email: `admin@mlmplatform.com`
- Password: `Admin@123456`

**Important**: Change the default password after first login!

### 7. Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] SMTP settings configured and tested
- [ ] SMS settings configured and tested
- [ ] Admin password changed
- [ ] SSL certificate active (automatic with Netlify)
- [ ] Custom domain configured (optional)

## Continuous Deployment

Once connected to GitHub, Netlify will automatically deploy when you push changes:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Netlify will automatically build and deploy your changes.

## Monitoring

- **Netlify Dashboard**: Monitor deployments and site analytics
- **Supabase Dashboard**: Monitor database usage and API calls
- **Twilio Console**: Monitor SMS usage and costs
- **Gmail**: Monitor email sending through Gmail SMTP

## Support

For issues with:
- **Deployment**: Check Netlify build logs
- **Database**: Check Supabase logs and RLS policies
- **Email**: Verify Gmail App Password and SMTP settings
- **SMS**: Check Twilio account balance and phone number status