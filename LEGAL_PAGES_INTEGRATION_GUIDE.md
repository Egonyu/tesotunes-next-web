# Legal Pages System - Integration Guide

This guide explains how to integrate the Legal Pages system into TesoTunes workflows.

---

## Quick Start

### 1. Initialize Legal Documents

```bash
# SSH into Laravel container
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed --class=LegalPagesSeeder
```

### 2. Access Admin Panel

```
http://localhost:3000/admin/legal-pages
```

### 3. Publish Documents

Admin can now create, edit, and publish legal documents.

---

## Integration Points

### Authentication Flow

#### Before User Signup
1. Show required legal documents (requires_acceptance = true)
2. User must accept all required documents
3. Only after acceptance, allow account creation

#### After Login
1. Check if user has accepted all currently required documents
2. If any required document is missing, show acceptance modal
3. Don't allow feature access until accepted

### Implementation

**Signup Component** (`src/app/auth/signup/page.tsx`)

```typescript
import { useRegister } from '@/hooks/useAuth';
import { useLegalAcceptance } from '@/hooks/useLegal';
import { useState } from 'react';

export function SignupForm() {
  const [step, setStep] = useState<'details' | 'legal'>('details');
  const { register } = useRegister();
  const { pages, acceptPolicy } = useLegalAcceptance();

  const requiredPolicies = Object.entries(pages)
    .filter(([_, p]) => !p.accepted)
    .filter(([_, p]) => p.title); // Only required docs

  const handleSubmitDetails = async (data: any) => {
    // Save user details temporarily
    setStep('legal');
  };

  const handleAcceptAll = async () => {
    // Accept all required policies
    for (const [slug, policy] of Object.entries(pages)) {
      if (!policy.accepted) {
        await acceptPolicy(/* page id */);
      }
    }
    // Now register
    await register({ ...data, acceptedLegal: true });
  };

  if (step === 'legal') {
    return (
      <LegalAcceptanceFlow
        policies={requiredPolicies}
        onAcceptAll={handleAcceptAll}
      />
    );
  }

  return <SignupDetailsForm onSubmit={handleSubmitDetails} />;
}
```

**Dashboard** (`src/app/dashboard/page.tsx`)

```typescript
import { useLegalAcceptance } from '@/hooks/useLegal';
import { useEffect } from 'react';

export function Dashboard() {
  const { allAccepted, pages } = useLegalAcceptance();
  const missingCount = Object.values(pages).filter(p => !p.accepted).length;

  useEffect(() => {
    if (!allAccepted && missingCount > 0) {
      // Show acceptance modal
    }
  }, [allAccepted, missingCount]);

  if (!allAccepted) {
    return <LegalAcceptanceModal pages={pages} />;
  }

  return <DashboardContent />;
}
```

---

## Component Examples

### Acceptance Modal

```typescript
import { useLegalAcceptance } from '@/hooks/useLegal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface LegalAcceptanceModalProps {
  onClose?: () => void;
}

export function LegalAcceptanceModal({ onClose }: LegalAcceptanceModalProps) {
  const { pages, acceptPolicy, isAccepting } = useLegalAcceptance();
  const [acceptedAll, setAcceptedAll] = useState(false);

  const missingPolicies = Object.entries(pages)
    .filter(([_, p]) => !p.accepted)
    .map(([slug, p]) => ({ slug, ...p }));

  const handleAcceptAll = async () => {
    for (const policy of missingPolicies) {
      // Get page ID from API first
      const response = await fetch(`/api/legal-pages/${policy.slug}`);
      const { data } = await response.json();
      await acceptPolicy(data.id);
    }
    setAcceptedAll(true);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          Accept Updated Policies
        </h2>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {missingPolicies.map((policy) => (
            <div key={policy.slug} className="flex items-center">
              <Checkbox 
                id={policy.slug}
                disabled
                checked={acceptedAll}
              />
              <label 
                htmlFor={policy.slug}
                className="ml-2 text-sm"
              >
                {policy.title}
              </label>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAccepting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAcceptAll}
            disabled={isAccepting}
          >
            {isAccepting ? 'Accepting...' : 'Accept All'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Legal Pages Viewer

```typescript
import { useLegalPages } from '@/hooks/useLegal';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function LegalPagesViewer() {
  const { pages, pagesLoading } = useLegalPages();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedPage = pages.find(p => p.slug === selectedSlug);

  if (pagesLoading) return <div>Loading policies...</div>;

  return (
    <div className="grid grid-cols-4 gap-6 min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="col-span-1 border-r p-6">
        <h3 className="font-semibold mb-4">Legal Documents</h3>
        <nav className="space-y-2">
          {pages.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedSlug(page.slug)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                selectedSlug === page.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {page.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="col-span-3 p-6">
        {selectedPage ? (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{selectedPage.title}</h1>
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Badge variant="outline">{selectedPage.type}</Badge>
                <span>Version {selectedPage.version}</span>
              </div>
            </div>

            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedPage.content }}
            />
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            Select a document to view
          </div>
        )}
      </main>
    </div>
  );
}
```

### Acceptance Status Badge

```typescript
import { usePolicyAccepted } from '@/hooks/useLegal';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PolicyBadgeProps {
  slug: string;
}

export function PolicyBadge({ slug }: PolicyBadgeProps) {
  const accepted = usePolicyAccepted(slug);

  return (
    <Badge variant={accepted ? 'default' : 'destructive'}>
      {accepted ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          Accepted
        </>
      ) : (
        <>
          <X className="w-3 h-3 mr-1" />
          Not Accepted
        </>
      )}
    </Badge>
  );
}
```

---

## Artist-Specific Integration

### Artist Onboarding

When user selects "Register as Artist", show Artist Agreement specifically:

```typescript
import { useLegalPage } from '@/hooks/useLegal';

export function ArtistOnboarding() {
  const { page: artistAgreement, isLoading } = useLegalPage('artist-agreement');

  if (isLoading) return <div>Loading Agreement...</div>;

  return (
    <div>
      <h2>Artist Agreement</h2>
      <div dangerouslySetInnerHTML={{ __html: artistAgreement?.content }} />
      <div className="mt-6 bg-blue-50 p-4 rounded">
        <p className="font-semibold mb-2">Key Terms:</p>
        <ul className="text-sm space-y-1">
          <li>✓ 70% artist revenue share</li>
          <li>✓ Minimum withdrawal: 50,000 UGX</li>
          <li>✓ Payouts processed monthly</li>
          <li>✓ Must pass KYC verification</li>
        </ul>
      </div>
      <Button onClick={acceptArtistAgreement}>
        I Accept & Continue
      </Button>
    </div>
  );
}
```

---

## Admin Dashboard Integration

### Document Management

```typescript
import { useAdminLegalPages } from '@/hooks/useLegal';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

export function LegalPagesAdmin() {
  const { pages, isLoading, save, publish, delete: deleteDoc } = useAdminLegalPages();

  const columns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge>{row.getValue('status')}</Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </Button>
          {row.original.status === 'draft' && (
            <Button
              size="sm"
              onClick={() => publish(row.original.id)}
            >
              Publish
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteDoc(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Legal Documents</h1>
      <DataTable columns={columns} data={pages} />
    </div>
  );
}
```

---

## API Usage Examples

### Fetch All Policies

```typescript
const response = await fetch('/api/legal-pages');
const { data } = await response.json();
// data = [{ id, slug, title, content, version, ... }]
```

### Accept Policy

```typescript
const response = await fetch('/api/legal-pages/1/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});
const { data } = await response.json();
// data = { page_id, version, accepted_at }
```

### Check User Status

```typescript
const response = await fetch('/api/legal-pages/check-acceptance');
const { data } = await response.json();
// data = {
//   all_accepted: false,
//   pages: {
//     'terms-of-service': { accepted: true, version: 1 },
//     'privacy-policy': { accepted: false, version: 1 }
//   }
// }
```

### Admin: Create Policy

```typescript
const response = await fetch('/api/admin/legal-pages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Policy',
    type: 'custom',
    content: '<h1>Policy Content</h1>',
    applies_to: 'all',
    requires_acceptance: true,
  }),
});
```

### Admin: Publish Policy

```typescript
const response = await fetch('/api/admin/legal-pages/1/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    effective_date: '2026-04-20T00:00:00Z',
  }),
});
```

---

## Testing Legal Pages

### Test Acceptance Flow

```bash
# 1. Create a test user
POST /api/auth/signup
{
  "email": "test@tesotunes.com",
  "password": "password123",
  "name": "Test User"
}

# 2. Check acceptance status (should show all unaccepted)
GET /api/legal-pages/check-acceptance
# Response: all_accepted = false

# 3. Accept each policy
POST /api/legal-pages/1/accept
POST /api/legal-pages/2/accept
# ...

# 4. Check again (should show all accepted)
GET /api/legal-pages/check-acceptance
# Response: all_accepted = true
```

### Test Admin Operations

```bash
# Create a policy
POST /api/admin/legal-pages
{
  "title": "Test Policy",
  "type": "test",
  "content": "<h1>Test</h1>",
  "requires_acceptance": true
}

# Publish it
POST /api/admin/legal-pages/1/publish

# Get acceptances
GET /api/admin/legal-pages/1/acceptances

# Archive it
POST /api/admin/legal-pages/1/archive
```

---

## Monitoring & Analytics

### Key Metrics

Track these in your analytics:
- **Acceptance Rate**: % of users accepting each policy
- **Time to Accept**: Average time from document view to acceptance
- **Drop-off Points**: Where users abandon signup due to policies
- **Policy Views**: Which documents are most viewed

### Query Examples

```sql
-- Acceptance rate by policy
SELECT 
  lp.title,
  COUNT(DISTINCT lpa.user_id) as accepted_count,
  COUNT(DISTINCT u.id) as total_users,
  ROUND(100.0 * COUNT(DISTINCT lpa.user_id) / COUNT(DISTINCT u.id), 2) as acceptance_rate
FROM legal_pages lp
LEFT JOIN legal_page_acceptances lpa ON lp.id = lpa.legal_page_id
LEFT JOIN users u ON lpa.user_id = u.id OR TRUE
WHERE lp.status = 'published'
GROUP BY lp.id, lp.title;

-- Recent acceptances
SELECT 
  u.email,
  lp.title,
  lpa.accepted_at,
  lpa.version
FROM legal_page_acceptances lpa
JOIN users u ON lpa.user_id = u.id
JOIN legal_pages lp ON lpa.legal_page_id = lp.id
ORDER BY lpa.accepted_at DESC
LIMIT 100;
```

---

## Troubleshooting

### Issue: Pages not showing in frontend

**Check:**
1. Pages are published (`status = 'published'`)
2. Effective date is in past (or NULL)
3. Sunset date is in future (or NULL)
4. Deleted at is NULL
5. Applies to matches user role

### Issue: Acceptance not tracking

**Check:**
1. User is authenticated
2. Legal page exists and is published
3. Version number matches
4. Check `legal_page_acceptances` table

### Issue: Admin can't publish

**Check:**
1. User has `admin` or `super_admin` role
2. Content is not empty
3. Check Laravel logs for validation errors

---

## Next Steps

1. **Integrate into Signup**: Modify `src/app/auth/signup` to require acceptance
2. **Add Middleware**: Create route middleware to enforce acceptance
3. **Email Notifications**: Notify users of policy updates
4. **Analytics**: Track acceptance metrics and user behavior
5. **Multi-language**: Add translation support for policies
6. **E-Signature**: Implement digital signature for formal agreements

---

## Support

For help:
- Check `/admin/legal-pages` for current policies
- Review `LEGAL_PAGES_DOCUMENTATION.md` in Laravel project
- Check API logs: `storage/logs/laravel.log`
- Check browser console for frontend errors
