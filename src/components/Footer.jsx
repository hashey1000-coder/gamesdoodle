import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="Games Doodle" className="footer-brand-icon" />
          <span className="footer-brand-text">Games Doodle</span>
        </div>
        <div className="footer-links">
          <Link to="/about-us/">About Us</Link>
          <Link to="/privacy-policy/">Privacy Policy</Link>
          <Link to="/terms-of-service/">Terms of Service</Link>
          <Link to="/dmca/">DMCA</Link>
          <Link to="/contact-us/">Contact Us</Link>
          <Link to="/editorial-policy/">Editorial Policy</Link>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} Games Doodle. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
