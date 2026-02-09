'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  actions?: ReactNode;
  createHref?: string;
  createLabel?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  actions,
  createHref,
  createLabel = 'Create New',
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {backHref && (
            <Link 
              href={backHref}
              className="p-2 border rounded-lg hover:bg-muted mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {actions}
          {createHref && (
            <Link
              href={createHref}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {createLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
