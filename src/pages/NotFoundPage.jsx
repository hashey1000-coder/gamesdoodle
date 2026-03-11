import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found – Games Doodle</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you're looking for doesn't exist. Return to Games Doodle to play free online games." />
      </Helmet>
      <div className="page-content not-found-page">
        <div className="not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">← Back to Games</Link>
      </div>
    </>
  );
}
