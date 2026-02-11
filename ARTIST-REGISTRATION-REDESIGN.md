# Artist Registration Redesign - February 10, 2026

## Overview
Completely redesigned the artist registration flow for better UX, removing redundant fields and simplifying the process from 6 steps to 4 steps.

## Problems Fixed

### 1. Genre Selection Not Showing
**Root Cause:** API endpoint mismatch  
**Fix:** Changed `/genres` to `/api/genres` in useAvailableGenres hook

### 2. Poor UX - Redundant Fields
**Issues:**
- Full name asked again (already collected during user registration)
- Stage name separate from full name (confusing)
- Too many steps (6 steps was overwhelming)
- Verification step with ID uploads (not essential for initial registration)
- Country/city/career start year (can be optional or collected later)

## New Flow

### Before: 6 Steps
1. Welcome
2. Your Identity (full name, stage name, country, city, career start)
3. Your Sound (genre, bio, social links)
4. Verification (phone, NIN, ID uploads)
5. Get Paid (payout setup)
6. Review

### After: 4 Steps  
1. **Welcome** - Benefits and overview
2. **Your Music** - Stage name, avatar, genre, bio, social links
3. **Get Paid** - Phone number + payout setup
4. **Review** - Confirm and submit

## Key Improvements

### ✅ Pre-filled Data
- Stage name auto-fills with user's registered name
- Can be edited if they want a different artist name
- Removes redundant "full name" field

### ✅ Better Genre Display
- Added loading spinner while genres fetch
- Error state if genres fail to load
- Larger, more clickable genre buttons with emojis
- Visual feedback with rings and check marks
- Fixed API endpoint to actually load genres

### ✅ Simplified Requirements
**Required Fields (Minimal):**
- Stage/Artist name
- Primary genre
- Bio (50+ characters)
- Phone number  
- Payout method

**Optional Fields:**
- Artist photo
- Secondary genres (up to 5)
- Social media links (collapsed by default)

**Removed:**
- Full legal name (redundant)
- Country/City (can add later in profile)
- Career start year (not essential)
- National ID uploads (can do later for verification badge)
- NIN number (not needed for registration)

### ✅ Better Visual Design
- Genre buttons: Larger with emojis, rings, and check marks
- Loading states: Spinner animation instead of text
- Error states: Alert icon with helpful message
- Progress indicator: Clear step labels
- Form validation: Real-time feedback

## Technical Changes

### Files Modified

1. `/var/www/tesotunes/src/hooks/useArtist.ts`
   - Fixed API endpoint: `/genres` → `/api/genres`
   - Added error and loading states

2. `/var/www/tesotunes/src/app/(app)/become-artist/page.tsx`
   - Reduced steps from 6 to 4
   - Combined "Identity" + "Sound" into "Your Music"
   - Removed "Verification" step entirely
   - Moved phone to "Get Paid" step
   - Pre-fill stage_name from session
   - Added useEffect to auto-fill on mount
   - Improved genre rendering with better states
   - Added AlertCircle for errors
   - Collapsible social links section

3. `/var/www/api.tesotunes.com/app/Http/Controllers/Api/GenreController.php`
   - Created genre API controller
   - Returns 12 genres with emojis

4. Database
   - Added 8 new genres (12 total)

### Components Structure

**StepWelcome** - Same as before  
**StepMusic** - NEW: Combined Identity + Sound
- Avatar upload
- Artist name (pre-filled)
- Primary genre selection (FIXED)
- Secondary genres (optional)
- Bio textarea
- Social links (collapsible)

**StepPayout** - Enhanced
- Phone number added here
- Revenue share info
- Payout method selection
- Mobile money / Bank details

**StepReview** - Simplified
- Shows selected data
- Terms acceptance
- Submit button

## Testing

### Visit Page
https://tesotunes.com/become-artist

### Expected Behavior

**Step 1: Welcome**
- Shows benefits and stats
- "Continue" button enabled

**Step 2: Your Music**
- Artist name pre-filled with your registered name
- 12 genre buttons displayed with emojis:
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
- Bio field with character counter
- Social links (optional, collapsed)
- "Continue" disabled until: artist name + genre + 50+ char bio

**Step 3: Get Paid**
- Phone number field
- 3 payout method cards
- Mobile money / bank inputs based on selection
- "Continue" disabled until: phone + payout details

**Step 4: Review**
- Artist card preview
- Summary of selections
- Terms checkboxes
- "Submit Application" button

## If Genres Still Don't Show

### Browser Console Check
Open DevTools (F12) and look for:
```
Error loading genres...
```

### Network Tab Check
1. Filter by "genres"
2. Check request to `https://api.tesotunes.com/api/genres`
3. Should return 200 with JSON

### Manual API Test
In browser console:
```javascript
fetch('https://api.tesotunes.com/api/genres')
  .then(r => r.json())
  .then(d => console.log(`Found ${d.data.length} genres`, d))
```

Should output: `Found 12 genres`

## Rollback

If needed:
```bash
cd /var/www/tesotunes
cp src/app/\(app\)/become-artist/page.tsx.backup src/app/\(app\)/become-artist/page.tsx
docker restart tesotunes
```

## Future Enhancements

- Add verification step later for verified badge
- Allow genre editing from artist dashboard
- Artist onboarding tutorial
- Progress save (draft mode)
- Email confirmation after submission
- Application status notifications

## Benefits of New Design

✅ **Faster Registration** - 33% fewer steps  
✅ **Less Friction** - No redundant fields  
✅ **Better Mobile UX** - Larger touch targets  
✅ **Clear Requirements** - Only essential info  
✅ **Smart Defaults** - Pre-filled where possible  
✅ **Progressive Disclosure** - Optional fields collapsed  
✅ **Better Feedback** - Loading and error states  
✅ **Genre Selection Works** - Fixed API endpoint  

---

**Status:** ✅ Deployed and ready for testing
**Container:** Running on port 3002
**API:** Returning 12 genres successfully
