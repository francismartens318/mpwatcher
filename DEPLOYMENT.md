# Vercel Deployment Guide

## Quick Deploy to Vercel

### Step 1: Push Code (Already Done ✓)
Your code is already pushed to the repository.

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Find and import your repository: `francismartens318/mpwatcher`
5. Configure the project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (should auto-fill)
   - **Output Directory**: `.next` (should auto-fill)

6. **Add Environment Variables** (IMPORTANT):
   Click "Environment Variables" and add these four variables:

   **Variable 1:**
   - Name: `ATLASSIAN_EMAIL`
   - Value: `your_atlassian_account_email@example.com`
   - Environment: Production, Preview, Development (check all)

   **Variable 2:**
   - Name: `ATLASSIAN_API_TOKEN`
   - Value: `your_actual_api_token_here` (get from https://id.atlassian.com/manage-profile/security/api-tokens)
   - Environment: Production, Preview, Development (check all)

   **Variable 3:**
   - Name: `ATLASSIAN_DEVELOPER_ID`
   - Value: `39811bd6-659c-4089-a14f-a016fbfec7d9`
   - Environment: Production, Preview, Development (check all)

   **Variable 4:**
   - Name: `PARTNER_CUT_PERCENTAGE`
   - Value: `20`
   - Environment: Production, Preview, Development (check all)

7. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from the project directory)
vercel

# During deployment, answer the prompts:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No
# - Project name? mpwatcher (or your choice)
# - Directory? ./
# - Override settings? No

# After first deployment, add environment variables:
vercel env add ATLASSIAN_EMAIL production
# Paste your Atlassian account email when prompted

vercel env add ATLASSIAN_API_TOKEN production
# Paste your API token when prompted

vercel env add ATLASSIAN_DEVELOPER_ID production
# Paste: 39811bd6-659c-4089-a14f-a016fbfec7d9

vercel env add PARTNER_CUT_PERCENTAGE production
# Paste: 20

# Redeploy with environment variables
vercel --prod
```

## Common Deployment Errors & Solutions

### Error: "Build failed"
- **Cause**: Missing dependencies or environment variables during build
- **Solution**: Ensure environment variables are added before deploying

### Error: "No output directory"
- **Cause**: Build command didn't complete
- **Solution**: Check build logs in Vercel dashboard

### Error: "Module not found"
- **Cause**: Dependencies not installed properly
- **Solution**: Clear Vercel cache and redeploy:
  - Go to Project Settings → General → scroll down
  - Click "Clear Build Cache"
  - Trigger new deployment

### Error: "FUNCTION_INVOCATION_TIMEOUT"
- **Cause**: API calls taking too long
- **Solution**: This is expected for first run. The pricing fetcher caches results.

## After Successful Deployment

1. **Check Health Endpoint**:
   ```
   https://your-app.vercel.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "config": {
       "hasEmail": true,
       "hasApiToken": true,
       "hasDeveloperId": true,
       "partnerCutPercentage": 20
     }
   }
   ```

2. **Test Validation**:
   Visit: `https://your-app.vercel.app/`

## Troubleshooting

If you still have issues:
1. Share the exact error message from Vercel
2. Check the build logs in Vercel dashboard
3. Verify environment variables are set correctly
