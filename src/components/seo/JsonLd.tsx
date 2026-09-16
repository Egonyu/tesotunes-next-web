interface JsonLdProps {
  data: Record<string, unknown>
}

/**
 * Structured data carries user-written text (bios, service descriptions), so
 * `<` is escaped: a literal "</script>" in a bio must not end the tag.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
