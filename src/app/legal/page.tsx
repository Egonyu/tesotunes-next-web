'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegalPageSummary {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
}

interface LegalPageDetail {
  id: number;
  title: string;
  subtitle: string | null;
  type_display: string;
  version: number;
  published_at: string | null;
  requires_acceptance: boolean;
  content: string;
}

export default function LegalPagesPage() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Fetch all published legal pages
  const { data: legalPages = [], isLoading, error } = useQuery<LegalPageSummary[]>({
    queryKey: ['legal-pages-public'],
    queryFn: async () => {
      const response = await fetch('/api/legal-pages');
      if (!response.ok) throw new Error('Failed to fetch legal pages');
      const data = await response.json();
      return (data.data as LegalPageSummary[]) || [];
    },
  });

  // Fetch selected page content
  const { data: selectedPageContent } = useQuery<LegalPageDetail | null>({
    queryKey: ['legal-page', selectedPage],
    queryFn: async () => {
      if (!selectedPage) return null;
      const response = await fetch(`/api/legal-pages/${selectedPage}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      const data = await response.json();
      return data.data as LegalPageDetail;
    },
    enabled: !!selectedPage,
  });

  // Set default selected page
  useEffect(() => {
    if (legalPages.length > 0 && !selectedPage) {
      setSelectedPage(legalPages[0].slug);
    }
  }, [legalPages]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading legal pages. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Legal Documents</h1>
          <p className="text-lg text-muted-foreground">
            Read our terms of service, privacy policy, and other important legal documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : legalPages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No documents available</div>
                  ) : (
                    legalPages.map((page: LegalPageSummary) => (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPage(page.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedPage === page.slug
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                      >
                        <div className="font-medium text-sm">{page.title}</div>
                        {page.subtitle && <div className="text-xs opacity-75">{page.subtitle}</div>}
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedPageContent ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedPageContent.title}</CardTitle>
                  {selectedPageContent.subtitle && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedPageContent.subtitle}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{selectedPageContent.type_display}</Badge>
                    <Badge variant="outline">Version {selectedPageContent.version}</Badge>
                    {selectedPageContent.published_at && (
                      <span className="text-xs text-muted-foreground">
                        Last updated: {new Date(selectedPageContent.published_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert
                      prose-headings:font-semibold
                      prose-h1:text-2xl prose-h1:mb-4
                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                      prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                      prose-p:mb-4 prose-p:leading-7
                      prose-ul:mb-4 prose-ul:ml-6
                      prose-li:mb-2
                      prose-strong:font-semibold
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: selectedPageContent.content }}
                  />

                  {/* Acceptance Section */}
                  {selectedPageContent.requires_acceptance && (
                    <div className="mt-8 pt-6 border-t">
                      <p className="text-sm text-muted-foreground mb-4">
                        By using TesoTunes, you agree to this {selectedPageContent.title}.
                      </p>
                      <Button className="w-full">Accept {selectedPageContent.title}</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {isLoading ? 'Loading document...' : 'Select a document to view'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
