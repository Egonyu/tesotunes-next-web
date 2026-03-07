'use client';

import { Users, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import { useSaccoGroups } from '@/hooks/useSacco';

export default function SaccoGroupsPage() {
  const { data: groups = [], isLoading } = useSaccoGroups();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Groups</h1>
        <p className="text-muted-foreground mt-1">SACCO groups and their members</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium">No groups yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            You have not been assigned to any SACCO group.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.id} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{group.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {group.members_count} member{group.members_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {group.is_member && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    Member
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Joined {new Date(group.created_at).toLocaleDateString('en-UG', { year: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
