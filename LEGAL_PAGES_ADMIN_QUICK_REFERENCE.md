# Legal Pages Admin Panel - Quick Reference

This is a quick reference guide for using the Legal Pages admin panel at `/admin/legal-pages`.

---

## Dashboard Overview

The Admin Panel has two main sections:

### 1. Documents List Tab
View all legal documents with their current status.

**Column Headers:**
- **Title**: Document name
- **Type**: Category (Terms, Privacy, Artist Agreement, etc.)
- **Status**: Draft, Published, or Archived
- **Version**: Current version number
- **Modified**: Last update date

**Quick Actions:**
- **Edit**: Click row to open editor
- **Publish**: Make a draft public
- **Archive**: Retire a published document
- **Delete**: Permanently remove

**Filters:**
- Search by title
- Filter by type
- Filter by status (All/Draft/Published/Archived)

---

## Creating a New Legal Document

### Step 1: Click "Create New Document"

From the "All Documents" tab:
1. Click the "Create New Document" button (top right)
2. Navigate to "Create/Edit" tab

### Step 2: Fill in Document Details

**Document Title** (Required)
- Example: "Refund Policy"
- This appears as the heading in public view

**Document Subtitle** (Optional)
- Smaller text below title
- Example: "Effective January 1, 2026"

**Document Type** (Required)
Select from predefined types:
- **Terms of Service** - General platform rules
- **Privacy Policy** - Data handling
- **Acceptable Use** - Prohibited activities
- **Artist Agreement** - Artist-specific terms (70% revenue share)
- **Payment Terms** - Payment schedules
- **Copyright** - IP and DMCA procedures
- **Cookie Policy** - Cookie usage
- **DMCA Policy** - Takedown process
- **Disclaimer** - Legal disclaimers
- **Accessibility** - Accessibility statement
- **Other** - Custom categories

**Applies To** (Required)
Who must accept this document:
- **All Users** - Everyone
- **Users Only** - Regular users (not artists)
- **Artists Only** - Artist accounts
- **Labels Only** - Label accounts
- **Event Organizers Only** - Event management accounts

**Content** (Required)
The full document text in HTML format.

**Requires User Acceptance** (Checkbox)
- ✓ Check if users must actively accept this
- Leave unchecked if purely informational

**Effective Date** (Optional)
When this version becomes active. Leave empty for immediate.

---

## Editing a Document

### Step 1: Select Document to Edit

From "All Documents" tab:
1. Find the document in the list
2. Click the Edit button (or click row)

### Step 2: Modify Content

Edit any field:
- Update title
- Modify content in the text area
- Change effective date
- Update requirements

### Step 3: Save Changes

Click "Update Document" button.

**Option: Create New Version**
- If you checked "Create Version", a new version is recorded
- Previous version is preserved in history
- Add "Changelog" message explaining changes
- Old acceptances remain valid (users don't need to re-accept)

---

## Publishing a Document

### From Draft to Published

**Method 1: Direct Publish**
1. From "All Documents" list
2. Find draft document
3. Click "Publish" button

**Method 2: Edit, Then Publish**
1. From "All Documents" list, click Edit
2. Make changes if needed
3. Click "Update Document"
4. Click "Publish" button
5. Set "Effective Date" (when changes take effect)
6. Click "Confirm Publish"

**What Happens:**
- Document status changes to "Published"
- Document becomes visible to public at `/legal` page
- Users can accept it if "Requires User Acceptance" is checked
- Previous version preserved in version history

---

## Archiving a Document

### Retire an Old Policy

Click "Archive" on any published document.

**What Happens:**
- Document marked as "Archived"
- Hidden from `/legal` public page
- Not shown to new users
- Existing user acceptances remain valid
- Document remains in database (can be unarchived if needed)

**Why Archive Instead of Delete?**
- Preserves audit trail
- Maintains record of who accepted which versions
- Can restore if needed
- Legal compliance (some jurisdictions require retention)

---

## Viewing Version History

### See What Changed

1. Click on a published document
2. Click "View Version History" link
3. See all previous versions with:
   - Version number
   - Date created
   - Creator (admin name)
   - Changelog message
   - Full content diff

---

## Tracking User Acceptances

### Monitor Who Accepted What

1. Click on any "Requires User Acceptance" document
2. Click "View Acceptances" or "Acceptance Statistics"
3. See:
   - Total acceptances
   - Acceptance rate (%)
   - List of users with email, acceptance date, IP address
   - Version they accepted

**Example:**
- Document: "Terms of Service" Version 2
- Total users: 10,000
- Acceptances: 9,850
- Rate: 98.5%
- Newest: John (john@example.com) - April 15, 2026

---

## Document Types Explained

| Type | Purpose | Who Needs It | Example Audience |
|------|---------|-------------|------------------|
| **Terms of Service** | Platform usage rules | All users | Everyone |
| **Privacy Policy** | Data handling practices | All users | Everyone |
| **Acceptable Use** | Prohibited content/behavior | All users | Everyone |
| **Artist Agreement** | Artist-specific terms with revenue split | Artists | Content creators |
| **Payment Terms** | Payment schedules, fees, withdrawals | All | Artists, platforms |
| **Copyright** | IP rights and DMCA process | All | IP owners |
| **Cookie Policy** | Cookie and tracking usage | All | Everyone |
| **DMCA Policy** | Takedown and copyright procedures | All | Creators, rights holders |
| **Disclaimer** | Legal disclaimers and limitations | All | Legal protection |
| **Accessibility** | Web accessibility compliance | All | Accessibility standards |

---

## Common Tasks

### Task: Update Terms After Legal Review

1. Find "Terms of Service" in list
2. Click Edit
3. Make changes to content
4. Check "Create Version"
5. In Changelog, write: "Updated section 3 per legal review, April 2026"
6. Set Effective Date to: "April 20, 2026"
7. Click "Update Document"
8. Click "Publish"
9. Confirm

**Result:** 
- New version 2 created
- Old acceptances remain valid
- Changes effective April 20
- Users can view version history

### Task: Add New Artist Fees Policy

1. Click "Create New Document"
2. Title: "Artist Fee Structure"
3. Type: "Artist Agreement"
4. Applies To: "Artists Only"
5. Content: paste new policy HTML
6. Check "Requires User Acceptance"
7. Set Effective Date: "May 1, 2026"
8. Click "Save Document"
9. Click "Publish"

**Result:**
- Only visible to artists
- Artists must accept before full feature access
- Takes effect May 1

### Task: Emergency Policy Change

1. Find policy to change
2. Click Edit
3. Update content with urgent notice (all caps recommended)
4. Check "Create Version"
5. Changelog: "URGENT: Security update - effective immediately"
6. Leave Effective Date empty (takes effect now)
7. Click "Update"
8. Click "Publish"

**Result:**
- Published immediately
- All future users see update
- Existing users notified of new version requiring acceptance

---

## HTML Tips for Content

### Basic Formatting

```html
<!-- Headings -->
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

<!-- Paragraphs -->
<p>A paragraph of text.</p>

<!-- Lists -->
<ul>
  <li>Bullet point 1</li>
  <li>Bullet point 2</li>
</ul>

<ol>
  <li>Numbered item 1</li>
  <li>Numbered item 2</li>
</ol>

<!-- Emphasis -->
<strong>Bold text</strong>
<em>Italic text</em>

<!-- Links -->
<a href="https://tesotunes.com">Link text</a>

<!-- Line break -->
<br />
```

### Structure Template

```html
<h1>Document Title</h1>
<p>Effective Date: January 1, 2026</p>

<h2>1. Introduction</h2>
<p>Introductory paragraph...</p>

<h2>2. Key Terms</h2>
<ul>
  <li><strong>Platform:</strong> TesoTunes website and app</li>
  <li><strong>User:</strong> Any person accessing the platform</li>
</ul>

<h2>3. User Rights</h2>
<ol>
  <li>The right to access content</li>
  <li>The right to create an account</li>
</ol>

<h2>4. User Responsibilities</h2>
<p>Users must...</p>

<h2>5. Limitations of Liability</h2>
<p>TesoTunes is provided "as is"...</p>
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save Document | Ctrl+S / Cmd+S |
| New Document | Ctrl+N / Cmd+N |
| Search | Ctrl+F / Cmd+F |
| Filter | Ctrl+L / Cmd+L |

---

## Troubleshooting

### Problem: Can't Save Document

**Error: "Content required"**
- Add content HTML to document

**Error: "Title required"**
- Add title for document

**Error: "Permission denied"**
- Verify you have admin or super_admin role
- Check if logged in

### Problem: Changes Not Appearing to Users

**Check:**
1. Is document published? (Status should be "Published")
2. Is effective date today or earlier?
3. Is sunset date today or later?
4. Are users refreshing their browser?

### Problem: Can't Archive Document

**Only published documents can be archived**
- Draft documents can only be deleted
- Archived documents can't be edited (create new version instead)

### Problem: Users Don't See Acceptance Modal

**Check:**
1. Is "Requires User Acceptance" checked?
2. Is document published?
3. Is effective date correct?
4. Has user already accepted this version?

---

## Best Practices

✅ **Do:**
- Write clear, concise content
- Use version control for changes
- Include effective dates for major updates
- Archive old documents instead of deleting
- Review policy acceptances regularly
- Keep changelog messages detailed
- Test new policies before publishing

❌ **Don't:**
- Delete important documents (archive instead)
- Publish without review
- Forget to set effective dates
- Create multiple versions of same content
- Leave draft documents indefinitely
- Publish drastically different terms without notice
- Edit published documents directly (create new version)

---

## Support

**Questions?**
- Check the seeded policies for examples
- Review LEGAL_PAGES_DOCUMENTATION.md for API details
- Check browser console for error messages
- Review Laravel logs at `storage/logs/laravel.log`

**Need help?**
- Admin Email: support@tesotunes.com
- Documentation: `/docs/LEGAL_PAGES_DOCUMENTATION.md`
- API Reference: `POST /api/admin/legal-pages`
