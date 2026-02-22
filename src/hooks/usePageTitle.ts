import { useEffect } from 'react';

/**
 * Sets the document title for client-side pages.
 * Works with the root layout's `template: "%s | TesoTunes"` pattern.
 *
 * @example
 * usePageTitle('My Songs');
 * // → document.title = "My Songs | TesoTunes"
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const suffix = ' | TesoTunes';
    document.title = title.endsWith(suffix) ? title : `${title}${suffix}`;
  }, [title]);
}
