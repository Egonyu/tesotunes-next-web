# Genre Selection Debugging Guide

## Status
✅ **API Working:** `GET https://api.tesotunes.com/api/genres` returns 12 genres  
✅ **CORS Configured:** API allows requests from tesotunes.com  
✅ **Frontend Code Updated:** Hook now calls `/api/genres` (not `/genres`)  
✅ **Debug Logging Added:** Console logs added to troubleshoot  
✅ **Loading State Added:** Shows "Loading genres..." if array is empty  

## Changes Made

### 1. Fixed API Endpoint in Hook
**File:** `/var/www/tesotunes/src/hooks/useArtist.ts` (line 781)

Changed from:
```typescript
queryFn: () => apiGet<{ success: boolean; data: GenreOption[] }>("/genres")
```

To:
```typescript
queryFn: () => apiGet<{ success: boolean; data: GenreOption[] }>("/api/genres")
```

### 2. Added Debug Logging
**File:** `/var/www/tesotunes/src/app/(app)/become-artist/page.tsx`

Added after line 105:
```typescript
// Debug logging
if (typeof window !== 'undefined') {
  console.log('[BecomeArtist] Genres loading:', genresLoading);
  console.log('[BecomeArtist] Genres error:', genresError);
  console.log('[BecomeArtist] Genres data:', genresData);
  console.log('[BecomeArtist] Genres array:', genres);
}
```

### 3. Added Loading State
**File:** `/var/www/tesotunes/src/app/(app)/become-artist/page.tsx`

Added check before rendering genres:
```typescript
{genres.length === 0 ? (
  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
    <p>Loading genres...</p>
  </div>
) : (
  // ... genre buttons
)}
```

## Testing Instructions

### Step 1: Visit the Page
1. Go to https://tesotunes.com/become-artist
2. Login if prompted
3. Navigate to **Step 2: "Your Sound"**

### Step 2: Open Browser Console
1. Press `F12` or `Right Click → Inspect`
2. Go to **Console** tab
3. Look for logs starting with `[BecomeArtist]`

### Step 3: Check Console Output

**Expected Output:**
```
[BecomeArtist] Genres loading: false
[BecomeArtist] Genres error: null
[BecomeArtist] Genres data: { success: true, data: Array(12) }
[BecomeArtist] Genres array: Array(12)
```

**If you see errors:**
```
[BecomeArtist] Genres error: { message: "..." }
```
→ This tells us what's wrong with the API call

**If genres array is empty:**
```
[BecomeArtist] Genres array: []
```
→ The API call failed or returned unexpected data

### Step 4: Check Network Tab
1. In DevTools, go to **Network** tab
2. Filter by `genres`
3. Look for request to `https://api.tesotunes.com/api/genres`
4. Click on it and check:
   - **Status:** Should be `200 OK`
   - **Response:** Should show JSON with `success: true` and 12 genres
   - **Headers:** Check for CORS headers

### Step 5: What You Should See

**On Step 2, you should see:**
- Label: "Primary Genre *"
- Grid of 12 clickable genre buttons with emojis:
  - 🪕 Akogo
  - 🎵 Ateso Afrobeat  
  - 🎤 Teso Hip-Hop
  - 🎧 Urban Mainstream
  - 🙏 Gospel
  - 🥁 Afrobeat
  - 🎸 Reggae
  - 💃 Dancehall
  - 🎼 R&B
  - 🎸 Pop
  - 🥁 Traditional
  - 🎹 Electronic

**If you see "Loading genres..." instead:**
- The genres array is empty
- Check console logs to see why

## Quick API Test

You can test the API directly in your browser console:

```javascript
fetch('https://api.tesotunes.com/api/genres')
  .then(r => r.json())
  .then(d => console.log('API Response:', d))
  .catch(e => console.error('API Error:', e))
```

Expected output:
```json
{
  "success": true,
  "data": [
    { "id": "4", "name": "Akogo", "emoji": "🪕", ... },
    // ... 11 more genres
  ]
}
```

## Common Issues & Solutions

### Issue 1: API Returns 401/403
**Solution:** Check that you're logged in. The `/api/genres` endpoint should work without auth, but axios might be sending auth headers.

### Issue 2: CORS Error in Console
**Error:** `Access to fetch at 'https://api.tesotunes.com' from origin 'https://tesotunes.com' has been blocked by CORS`

**Solution:** CORS is already configured. If you see this:
```bash
# Check Laravel CORS config
cat /var/www/api.tesotunes.com/config/cors.php
```

### Issue 3: Network Error / Timeout
**Solution:** Check if API is running:
```bash
curl -I https://api.tesotunes.com/api/genres
# Should return: HTTP/2 200
```

### Issue 4: Empty Array but API Works
**Check:** Genre data structure. The page expects:
```typescript
interface GenreOption {
  id: string;
  name: string;
  emoji: string;
}
```

## Rollback if Needed

If issues persist:
```bash
cd /var/www/tesotunes
git diff src/hooks/useArtist.ts
git diff src/app/\(app\)/become-artist/page.tsx

# To revert:
git checkout src/hooks/useArtist.ts
git checkout src/app/\(app\)/become-artist/page.tsx
docker restart tesotunes
```

## Contact Information

If genres still don't show:
1. Share the **console logs** from DevTools
2. Share the **Network tab** response for `/api/genres`
3. Share any **error messages** in red

The API is confirmed working, so the issue is likely in how the frontend is consuming the data.
