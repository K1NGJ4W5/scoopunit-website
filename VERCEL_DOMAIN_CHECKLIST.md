# ✅ Vercel Domain Configuration Checklist for scoopunit.com

## 🎯 Step-by-Step Configuration Guide

### **Step 1: Clean Up Existing Projects**
- [ ] **Go to Vercel Dashboard:** https://vercel.com/dashboard
- [ ] **Identify your 4 projects** - look for one connected to "scoopunit-website" GitHub repo
- [ ] **Delete unused projects:** Settings → General → Delete Project (keep only the active one)

### **Step 2: Configure Correct Project**
- [ ] **Open your scoopunit-website project**
- [ ] **Verify it's connected to:** `K1NGJ4W5/scoopunit-website` GitHub repo
- [ ] **Check latest deployment:** Should show Apple-inspired files (index.html, apple-inspired-styles.css)

### **Step 3: Domain Configuration**
- [ ] **Go to:** Settings → Domains
- [ ] **Add primary domain:** `scoopunit.com`
- [ ] **Add www domain:** `www.scoopunit.com`
- [ ] **Set scoopunit.com as primary domain**
- [ ] **Configure www to redirect to main domain**

### **Step 4: DNS Records at Domain Registrar**
Add these exact records where you bought scoopunit.com:

```
Record Type: A
Name: @ (or leave blank)
Value: 76.76.19.61
TTL: 3600 (or Auto)

Record Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### **Step 5: Verification**
- [ ] **Wait 15-30 minutes** for DNS propagation
- [ ] **Check SSL status:** Should show "Valid" in Vercel domains section
- [ ] **Test URLs:**
  - https://scoopunit.com
  - https://www.scoopunit.com (should redirect)
- [ ] **Verify content:** Look for "Your Yard. Clean. Safe. Always." headline

## 🚨 Common Issues & Solutions

### **Issue: "Domain is already assigned to another project"**
**Solution:**
1. Find the other project using this domain
2. Remove domain from that project first
3. Then add to correct project

### **Issue: "DNS configuration invalid"**
**Solution:**
1. Double-check DNS records at your registrar
2. Use exactly: `76.76.19.61` (not 76.76.19.62 or similar)
3. CNAME must be: `cname.vercel-dns.com`

### **Issue: "SSL Certificate Pending"**
**Solution:**
1. Wait 5-15 minutes for automatic SSL
2. If still pending after 30 minutes, remove and re-add domain

### **Issue: "404 Not Found" on website**
**Solution:**
1. Check project is connected to correct GitHub repo
2. Redeploy latest version
3. Verify index.html exists in root directory

### **Issue: "Old website still showing"**
**Solution:**
1. Clear browser cache (Ctrl+F5)
2. Try incognito/private mode
3. Wait for DNS propagation (up to 24 hours)

## 🔧 Vercel Project Settings Checklist

### **General Settings:**
- [ ] **Project Name:** scoopunit-website (or similar)
- [ ] **Framework:** None (Static Site)
- [ ] **Root Directory:** ./ (leave blank)
- [ ] **Build Command:** Leave blank
- [ ] **Output Directory:** Leave blank

### **Git Integration:**
- [ ] **Repository:** K1NGJ4W5/scoopunit-website
- [ ] **Branch:** master
- [ ] **Auto-deploy:** Enabled

### **Domains Section Should Show:**
```
✅ scoopunit.com (Primary)
✅ www.scoopunit.com → scoopunit.com (Redirect)
✅ [random].vercel.app (Vercel domain)
```

## 📋 Quick Test Commands

Run these on your computer to test:

```bash
# Test DNS resolution
nslookup scoopunit.com
nslookup www.scoopunit.com

# Test domain diagnostic
cd scoopunit-website
node domain-diagnostic.js

# Test website accessibility  
curl -I https://scoopunit.com
curl -I https://www.scoopunit.com
```

## 🎯 Expected Final Result

When correctly configured, you should see:

### **At https://scoopunit.com:**
- ✅ Clean white Apple-inspired design
- ✅ "Your Yard. Clean. Safe. Always." headline
- ✅ Blue "FREE 1 Min Quote" buttons  
- ✅ Customer testimonials section
- ✅ Smooth hover animations
- ✅ Mobile-responsive layout

### **Technical Indicators:**
- ✅ SSL certificate shows "Valid" 
- ✅ No browser security warnings
- ✅ Fast loading (under 3 seconds)
- ✅ Works on mobile devices

## 🆘 If Still Not Working

**Take these screenshots and share:**
1. **Vercel Domains section** showing your configuration
2. **DNS settings** at your domain registrar  
3. **Browser error** when visiting scoopunit.com
4. **Results of domain-diagnostic.js** script

## ⚡ Emergency Backup Options

### **Option 1: Use Vercel Domain Temporarily**
- Use the `.vercel.app` URL from your project
- Example: `https://scoopunit-website-abc123.vercel.app`

### **Option 2: GitHub Pages**
- Enable at: https://github.com/K1NGJ4W5/scoopunit-website/settings/pages
- Will be live at: `https://k1ngj4w5.github.io/scoopunit-website/`

**Your Apple-inspired website is ready - we just need the domain pointing correctly! 🍎🚀**