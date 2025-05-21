import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  image: string;
  canonical: string;
  schemaMarkup?: Record<string, any>;
}

export default function Seo({
  title,
  description,
  image,
  canonical,
  schemaMarkup,
}: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:card" content="summary_large_image" />
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
}
