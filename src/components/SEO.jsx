import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://gamesdoodle.org';
const SITE_NAME = 'Games Doodle';
const LOGO_URL = `${SITE_URL}/logo.png`;

// Shared Organization + WebSite entities
function baseGraph(includeSearch = false) {
  const org = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: LOGO_URL,
      contentUrl: LOGO_URL,
      caption: SITE_NAME,
      inLanguage: 'en-US',
      width: '512',
      height: '512',
    },
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
  };

  if (includeSearch) {
    website.potentialAction = {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?s={search_term_string}`,
      'query-input': 'required name=search_term_string',
    };
  }

  return [org, website];
}

// Homepage schema: Organization + WebSite (with SearchAction) + WebPage
function homepageSchema({ title }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...baseGraph(true),
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: title,
        datePublished: '2025-12-17T11:48:33+00:00',
        dateModified: '2026-01-20T09:32:54+00:00',
        about: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-US',
      },
    ],
  };
}

// Game page schema: Organization + WebSite + ImageObject + BreadcrumbList + WebPage + Person + BlogPosting
function gamePageSchema({ title, description, slug, category, image, datePublished, dateModified, wordCount }) {
  const pageUrl = `${SITE_URL}/${slug}/`;
  const imageUrl = image ? `${SITE_URL}${image}` : '';
  const graph = [...baseGraph(false)];

  if (imageUrl) {
    graph.push({
      '@type': 'ImageObject',
      '@id': imageUrl,
      url: imageUrl,
      width: '800',
      height: '400',
      caption: title.split(/[–\-]/)[0].trim(),
      inLanguage: 'en-US',
    });
  }

  const breadcrumbItems = [
    { '@type': 'ListItem', position: '1', item: { '@id': SITE_URL, name: 'Home' } },
  ];

  if (category) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: '2',
      item: { '@id': `${SITE_URL}/${category.slug}/`, name: category.name },
    });
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: '3',
      item: { '@id': pageUrl, name: title },
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: '2',
      item: { '@id': pageUrl, name: title },
    });
  }

  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: breadcrumbItems,
  });

  const webPage = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    inLanguage: 'en-US',
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
  };

  if (datePublished) webPage.datePublished = datePublished;
  if (dateModified) webPage.dateModified = dateModified;

  if (imageUrl) {
    webPage.primaryImageOfPage = { '@id': imageUrl };
  }

  graph.push(webPage);

  graph.push({
    '@type': 'Person',
    '@id': `${SITE_URL}/author/admin/`,
    name: 'Hakim Saied',
    url: `${SITE_URL}/author/admin/`,
    sameAs: [SITE_URL],
    worksFor: { '@id': `${SITE_URL}/#organization` },
  });

  const blogPosting = {
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#richSnippet`,
    headline: title,
    description: description,
    name: title,
    articleSection: category ? category.name : '',
    author: { '@id': `${SITE_URL}/author/admin/`, name: 'Hakim Saied' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${pageUrl}#webpage` },
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    inLanguage: 'en-US',
  };

  if (datePublished) blogPosting.datePublished = datePublished;
  if (dateModified) blogPosting.dateModified = dateModified;
  if (wordCount) blogPosting.wordCount = wordCount;

  if (imageUrl) {
    blogPosting.image = { '@id': imageUrl };
  }

  graph.push(blogPosting);

  return { '@context': 'https://schema.org', '@graph': graph };
}

// Category page schema: Organization + WebSite + BreadcrumbList + CollectionPage
function categoryPageSchema({ title, slug }) {
  const pageUrl = `${SITE_URL}/${slug}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...baseGraph(false),
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: '1', item: { '@id': SITE_URL, name: 'Home' } },
          { '@type': 'ListItem', position: '2', item: { '@id': pageUrl, name: title } },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${title} - ${SITE_NAME}`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en-US',
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
    ],
  };
}

// Static page schema: BreadcrumbList only
function staticPageSchema({ title, slug }) {
  const pageUrl = `${SITE_URL}/${slug}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: '1', item: { '@id': SITE_URL, name: 'Home' } },
          { '@type': 'ListItem', position: '2', item: { '@id': pageUrl, name: title } },
        ],
      },
    ],
  };
}

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  image,
  schemaType = 'default',
  schemaData = {},
}) {
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const ogImage = image ? `${SITE_URL}${image}` : '';

  // Determine robots — match live site's Rank Math directives
  const isStaticPage = schemaType === 'static';
  const robotsContent = isStaticPage
    ? 'follow, noindex, max-snippet:-1, max-video-preview:-1, max-image-preview:large'
    : 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';

  // Article meta tags for game pages
  const isArticle = ogType === 'article';
  const datePublished = schemaData.datePublished || null;
  const dateModified = schemaData.dateModified || null;
  const categoryName = schemaData.category?.name || '';

  // og:updated_time — homepage uses hardcoded value, game pages use their own
  const ogUpdatedTime = dateModified
    || (schemaType === 'homepage' ? '2026-01-20T09:32:54+00:00' : null);

  // Build schema
  let schema = null;
  switch (schemaType) {
    case 'homepage':
      schema = homepageSchema({ title, ...schemaData });
      break;
    case 'game':
      schema = gamePageSchema({ title, description, ...schemaData });
      break;
    case 'category':
      schema = categoryPageSchema({ title: schemaData.categoryName || title, ...schemaData });
      break;
    case 'static':
      schema = staticPageSchema({ title, ...schemaData });
      break;
    default:
      break;
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {ogUpdatedTime && <meta property="og:updated_time" content={ogUpdatedTime} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:secure_url" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="800" />}
      {ogImage && <meta property="og:image:height" content="400" />}
      {ogImage && <meta property="og:image:type" content={ogImage.endsWith('.webp') ? 'image/webp' : ogImage.endsWith('.png') ? 'image/png' : 'image/jpeg'} />}
      {ogImage && <meta property="og:image:alt" content={title} />}

      {/* Article meta tags (game pages) */}
      {isArticle && datePublished && <meta property="article:published_time" content={datePublished} />}
      {isArticle && dateModified && <meta property="article:modified_time" content={dateModified} />}
      {isArticle && <meta property="article:author" content="Hakim Saied" />}
      {isArticle && categoryName && <meta property="article:section" content={categoryName} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      <meta name="robots" content={robotsContent} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
