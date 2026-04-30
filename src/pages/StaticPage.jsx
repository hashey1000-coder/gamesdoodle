import SEO from '../components/SEO';
import { LazyAd } from '../components/AdSlot';
import { staticPages } from '../data/staticPages';

export default function StaticPage({ slug }) {
  const page = staticPages[slug];

  return (
    <>
      <SEO
        title={page.metaTitle}
        description={page.metaDescription}
        canonical={`/${slug}/`}
        schemaType="static"
        schemaData={{
          slug: slug,
        }}
      />
      <div className="page-content static-page">
        <h1 className="page-title">{page.title}</h1>
        <LazyAd className="page-ad-slot" />
        <div
          className="static-page-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
        <LazyAd className="page-ad-slot" />
      </div>
    </>
  );
}
