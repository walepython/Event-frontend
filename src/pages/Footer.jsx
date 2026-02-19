import { NavLink } from "react-router-dom";


const Footer = () => {
  return (
    <footer className="footer mt-5">
      <div className="container py-5">
        <div className="row footerbrand">

          {/* Brand */}
          <div className="col-md-4 mb-4">
            <h4 className="footer-brand">
              <span className="brand-highlight">Event</span>Sphere
            </h4>
            <p className="footer-text">
              Your hub for discovering, organizing, and reliving unforgettable
              events.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="footer-title">Quick Links</h6>
            <ul className="footer-links">
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/events">Events</NavLink></li>
              <li><NavLink to="/gallery">Gallery</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-md-3 mb-4">
            <h6 className="footer-title">Resources</h6>
            <ul className="footer-links">
              <li><NavLink to="/organizer">Become an Organizer</NavLink></li>
              <li><NavLink to="/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/feedback">Feedback</NavLink></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3 mb-4">
            <h6 className="footer-title">Contact</h6>
            <p className="footer-text mb-1">📧 support@eventsphere.com</p>
            <p className="footer-text mb-1">📍 Nigeria</p>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom text-center py-3">
        © {new Date().getFullYear()} EventSphere. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
