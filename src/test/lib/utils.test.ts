import { describe, it, expect } from '@jest/globals';
import { formatDuration, formatCurrency, formatNumber, cn, getInitials, slugify } from '@/lib/utils';

describe('Utils - cn (class merging)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('Utils - formatDuration', () => {
  it('formats seconds to mm:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(30)).toBe('0:30');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(185)).toBe('3:05');
  });

  it('formats hours correctly', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});

describe('Utils - formatCurrency', () => {
  it('formats UGX currency', () => {
    expect(formatCurrency(1000)).toContain('1,000');
    expect(formatCurrency(1500000)).toContain('1,500,000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('Utils - formatNumber', () => {
  it('formats thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10K');
  });

  it('formats millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1M');
    expect(formatNumber(2500000)).toBe('2.5M');
  });

  it('keeps small numbers as-is', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(999)).toBe('999');
  });
});

describe('Utils - getInitials', () => {
  it('gets initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane Mary Smith')).toBe('JS');
  });

  it('handles single names', () => {
    expect(getInitials('John')).toBe('J');
  });

  it('handles empty strings', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('Utils - slugify', () => {
  it('creates slug from text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('This Is A Test')).toBe('this-is-a-test');
  });

  it('handles special characters', () => {
    expect(slugify('Hello & World!')).toBe('hello-world');
    expect(slugify('Test@#$%String')).toBe('teststring');
  });

  it('handles multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });
});
