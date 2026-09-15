type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Safely renders structured data for search engines without exposing user content as HTML. */
export function JsonLd({ data }: Readonly<JsonLdProps>) {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");

  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
