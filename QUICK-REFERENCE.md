# 🚀 TesoTunes Development Quick Reference

## Start Development (No Docker Rebuild!)
```bash
cd /var/www/tesotunes
npm run dev
```
Access: http://YOUR_SERVER_IP:3000

---

## Key Files for Mobile Layout
```
src/components/layout/sidebar.tsx     - Mobile navigation
src/components/layout/header.tsx      - Top header
src/app/layout.tsx                    - Root layout
```

---

## Key Files for Registration
```
src/app/(auth)/register/page.tsx      - Registration form
src/lib/auth.ts                       - NextAuth config
src/lib/api-client.ts                 - API calls
```

---

## Tailwind Mobile Classes
```tsx
<div className="hidden lg:block">            // Hide mobile, show desktop
<div className="lg:hidden">                  // Show mobile, hide desktop
<div className="px-4 md:px-6 lg:px-8">      // Responsive padding
<div className="text-sm md:text-base">      // Responsive text size
```

---

## Test Mobile Responsiveness
1. Chrome DevTools: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Test breakpoints: 375px, 768px, 1024px

---

## Debug Registration
```bash
# Test Laravel API
curl -X POST https://engine.tesotunes.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","password_confirmation":"test123"}'

# Check browser console
F12 → Console tab → Look for errors

# Check Network tab
F12 → Network tab → Find register API call → See response
```

---

## Deploy to Production
```bash
# Test build locally
npm run build

# Stop and rebuild production container
cd /var/www/tesotunes
docker stop tesotunes && docker rm tesotunes
docker build -t tesotunes:latest .

# Run production container
docker run -d --name tesotunes -p 3002:3000 \
  -e NEXT_PUBLIC_APP_NAME="TesoTunes" \
  -e NEXT_PUBLIC_APP_URL="https://tesotunes.com" \
  -e NEXT_PUBLIC_API_URL="https://engine.tesotunes.com/api" \
  -e NEXTAUTH_URL="https://tesotunes.com" \
  -e NEXTAUTH_SECRET="production-secret" \
  -e DATABASE_URL="mysql://root:PASSWORD@host.docker.internal:3306/tesotunes-next" \
  -e NODE_ENV="production" \
  --add-host=host.docker.internal:host-gateway \
  --restart unless-stopped \
  tesotunes:latest
```

---

## Useful Commands
```bash
# View dev server logs
# (logs appear in terminal where npm run dev is running)

# Kill process on port 3000
kill $(lsof -t -i:3000)

# Clear Next.js cache
rm -rf .next

# Check running containers
docker ps

# Fix permissions
chown -R www-data:www-data /var/www/tesotunes
```

---

## VSCode Remote SSH
1. Install "Remote - SSH" extension
2. F1 → "Remote-SSH: Connect to Host"
3. Connect to server
4. Open folder: /var/www/tesotunes
5. Terminal → `npm run dev`
6. Edit files - changes auto-reload! ✨

---

## Port Reference
- **Production:** 3002 → https://tesotunes.com
- **Development:** 3000 → http://localhost:3000
- **API:** https://engine.tesotunes.com/api

---

**Full Documentation:**
- Deployment: `/var/www/tesotunes/DEPLOYMENT.md`
- Development: `/var/www/tesotunes/DEVELOPMENT.md`

**Quick Start:** `cd /var/www/tesotunes && npm run dev`
