# Deploying Legal Pages to Vercel

This guide will help you deploy the Privacy Policy and Terms of Service pages to Vercel for free.

## Step 1: Push to GitHub

1. Make sure all files are committed:
   ```bash
   git add .
   git commit -m "Add privacy policy and terms of service pages"
   git push origin main
   ```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with your GitHub account
2. Click "Add New Project"
3. Import your GitHub repository (`pesopro-curreny-converter`)
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (static files)
   - **Output Directory**: `public` (or leave empty if Vercel detects it)
5. Click "Deploy"

## Step 3: Get Your Vercel URL

After deployment, Vercel will give you a URL like:
- `https://your-project-name.vercel.app`

Your legal pages will be available at:
- `https://your-project-name.vercel.app/privacy-policy.html`
- `https://your-project-name.vercel.app/terms-of-service.html`

## Step 4: Update Swift Code

Update the URLs in `ios/PesoProSwiftUI/PesoProSwiftUI/Paywall/PurchaseView.swift`:

Replace `https://your-project-name.vercel.app` with your actual Vercel URL.

The code is already set up to use these URLs - you just need to replace the placeholder.

## Step 5: (Optional) Custom Domain

If you want a custom domain later:
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update the Swift code with your new domain

## Files Included

- `public/privacy-policy.html` - Privacy Policy page
- `public/terms-of-service.html` - Terms of Service page
- `public/index.html` - Landing page with links to both documents
- `vercel.json` - Vercel configuration for routing

