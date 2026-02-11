# TesoTunes Development Workflow Guide

## 🚀 Quick Start Options

You have **3 development options**:

### Option 1: Direct Development (Recommended for VSCode Remote)
**Pros:** Fastest, no Docker overhead, direct file editing  
**Cons:** Requires Node.js 22+ installed

### Option 2: Docker Development with Hot-Reload
**Pros:** Consistent environment, no local Node.js needed  
**Cons:** Slightly slower file watching

### Option 3: Hybrid (Edit locally, test in Docker)
**Pros:** Best of both worlds  
**Cons:** Need to manage both environments

---

## ✅ Option 1: Direct Development (VSCode Remote SSH)

### Setup
```bash
cd /var/www/tesotunes

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The dev server will run on **port 3000** by default.

### For VSCode Remote SSH:
1. Connect to server via SSH in VSCode
2. Open folder: `/var/www/tesotunes`
3. Terminal → Run: `npm run dev`
4. Access via: http://YOUR_SERVER_IP:3000
5. Edit files directly in VSCode - **changes auto-reload!** ✨

### Access Development Site:
- **Local access:** http://localhost:3000
- **Remote access:** http://SERVER_IP:3000
- **Via domain (setup proxy):** http://dev.tesotunes.com

### Stop Production Container (to free port 3000 if needed):
```bash
docker stop tesotunes
# To restart production later:
docker start tesotunes
```

---

## ✅ Option 2: Docker Development (Hot-Reload)

### Start Development Container
```bash
cd /var/www/tesotunes

# Start dev container with hot-reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

**Port:** 3003 (doesn't conflict with production on 3002)  
**Access:** http://localhost:3003

### How Hot-Reload Works:
- Your `/src`, `/public` folders are mounted as volumes
- Changes to `.ts`, `.tsx`, `.css` files auto-reload
- No need to rebuild container! 🎉

### Edit Files:
```bash
# Via VSCode Remote SSH
code /var/www/tesotunes/src/

# Or any editor - changes reflect immediately
nano /var/www/tesotunes/src/app/page.tsx
```

### Stop Development Container:
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## 🔧 Development Commands

### Start Development Server
```bash
# Direct (no Docker)
npm run dev

# With Docker
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```bash
# Direct
# Logs appear in terminal

# Docker
docker logs -f tesotunes-dev
```

### Restart Dev Server
```bash
# Direct: Ctrl+C then npm run dev

# Docker
docker-compose -f docker-compose.dev.yml restart
```

### Install New Package
```bash
# Direct
npm install package-name

# Docker (need to rebuild)
npm install package-name
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

---

## 📱 Fixing Mobile Layout Issues

### Common Mobile Issues in Next.js:

1. **Viewport Meta Tag** (should already be set)
```tsx
// Check in src/app/layout.tsx
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

2. **Responsive Tailwind Classes**
```tsx
// Use responsive prefixes
<div className="px-4 md:px-6 lg:px-8">
<div className="text-sm md:text-base lg:text-lg">
```

3. **Mobile Navigation**
```tsx
// Hidden on mobile, visible on desktop
<nav className="hidden lg:block">

// Visible on mobile, hidden on desktop
<div className="lg:hidden">
```

### Files to Check for Mobile Issues:
```bash
src/app/layout.tsx           # Main layout
src/components/Sidebar.tsx   # Sidebar navigation
src/components/Header.tsx    # Top navigation
src/app/page.tsx             # Homepage
```

### Test on Mobile:
1. Use Chrome DevTools: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Test responsive breakpoints: 375px, 768px, 1024px, 1440px

---

## 🐛 Fixing Registration Issues

### Check Registration Flow:

```bash
# View registration page
cat src/app/(auth)/register/page.tsx

# Check API client
cat src/lib/api-client.ts

# Check auth configuration
cat src/lib/auth.ts
```

### Common Registration Issues:

1. **API Endpoint Not Reachable**
```bash
# Test Laravel API registration endpoint
curl -X POST https://engine.tesotunes.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'
```

2. **CORS Issues**
- Check Laravel backend has CORS enabled for tesotunes.com
- Verify `NEXT_PUBLIC_API_URL` environment variable

3. **NextAuth Configuration**
- Check `src/lib/auth.ts` has correct credentials provider
- Verify session configuration

### Debug Registration:
```bash
# View browser console logs (F12)
# Check Network tab for API calls
# Look for 400, 401, 403, 500 errors
```

---

## 🔄 Development Workflow

### Typical Development Session:

```bash
# 1. Start development server
cd /var/www/tesotunes
npm run dev  # Or docker-compose -f docker-compose.dev.yml up -d

# 2. Edit files in VSCode
# Changes auto-reload in browser

# 3. Test changes
# Open http://localhost:3000 (or :3003 for Docker)

# 4. Fix issues, repeat

# 5. When ready for production
npm run build  # Test production build locally

# 6. Deploy to production
docker stop tesotunes
docker rm tesotunes
docker build -t tesotunes:latest .
docker run -d \
  --name tesotunes \
  -p 3002:3000 \
  -e NEXT_PUBLIC_APP_NAME="TesoTunes" \
  -e NEXT_PUBLIC_APP_URL="https://tesotunes.com" \
  -e NEXT_PUBLIC_API_URL="https://engine.tesotunes.com/api" \
  -e NEXTAUTH_URL="https://tesotunes.com" \
  -e NEXTAUTH_SECRET="production-secret" \
  -e DATABASE_URL="mysql://root:iHab1808./ELi@host.docker.internal:3306/tesotunes-next" \
  -e NODE_ENV="production" \
  --add-host=host.docker.internal:host-gateway \
  --restart unless-stopped \
  tesotunes:latest
```

---

## 🌐 Setting Up Development Domain (Optional)

### Add Nginx Config for Dev:
```nginx
# /etc/nginx/sites-available/dev.tesotunes.com
server {
    listen 80;
    server_name dev.tesotunes.com;
    
    location / {
        proxy_pass http://localhost:3000;  # Or 3003 for Docker
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable and reload
ln -s /etc/nginx/sites-available/dev.tesotunes.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 📦 Port Overview

| Environment | Container | Host Port | URL |
|-------------|-----------|-----------|-----|
| Production | tesotunes | 3002 | https://tesotunes.com |
| Development (Direct) | - | 3000 | http://localhost:3000 |
| Development (Docker) | tesotunes-dev | 3003 | http://localhost:3003 |
| Laravel API | - | - | https://engine.tesotunes.com/api |

---

## 🔍 Debugging Tips

### Check Running Processes:
```bash
# What's using port 3000?
lsof -i :3000

# Docker containers
docker ps

# Next.js process
ps aux | grep next
```

### View Environment Variables:
```bash
# In development
cat .env.local

# In Docker container
docker exec tesotunes-dev env | grep NEXT_PUBLIC
```

### Common Issues:

1. **Port Already in Use**
```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)
```

2. **Changes Not Reflecting**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

3. **Build Errors**
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run dev
```

---

## ✨ VSCode Remote SSH Setup

### Install VSCode Extensions:
1. Remote - SSH
2. ESLint
3. Tailwind CSS IntelliSense
4. Prettier
5. TypeScript and JavaScript Language Features

### Connect to Server:
1. Press F1 → "Remote-SSH: Connect to Host"
2. Enter: `user@your-server-ip`
3. Open folder: `/var/www/tesotunes`
4. Terminal → Run: `npm run dev`

### Recommended Settings (.vscode/settings.json):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## 🎯 Quick Reference

### Start Development:
```bash
npm run dev          # Direct, fast, recommended
```

### Fix Mobile Issues:
```bash
# Edit responsive components
src/components/Sidebar.tsx
src/components/Header.tsx
src/app/layout.tsx
```

### Fix Registration:
```bash
# Check these files
src/app/(auth)/register/page.tsx
src/lib/auth.ts
src/lib/api-client.ts
```

### Deploy to Production:
```bash
npm run build        # Test build
# Then rebuild Docker container (see deployment workflow above)
```

---

**Recommended Workflow:** Use **Option 1 (Direct Development)** with VSCode Remote SSH for fastest iteration! 🚀
