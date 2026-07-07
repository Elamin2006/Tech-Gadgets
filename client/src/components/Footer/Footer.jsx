import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="tech-elite-footer"
      aria-label="Platform Architecture Footer"
    >
      <div className="footer-status-bar">
        <Container>
          <div className="status-flex-wrapper">
            <div className="system-status">
              <span className="status-indicator-pulse"></span>
              <span className="status-text">ALL CORE SYSTEMS OPERATIONAL</span>
            </div>
            <div className="security-clearance">
              <span className="clearance-text">
                SECURE 256-BIT ENCRYPTION ACTIVE
              </span>
            </div>
          </div>
        </Container>
      </div>

      <div className="footer-directory">
        <Container>
          <Row className="g-4 justify-content-between">
            <Col lg={4} md={12} className="pe-lg-5">
              <div className="footer-brand-meta">
                <h4 className="footer-brand-title">TECH_ELITE</h4>
                <p className="footer-brand-desc">
                  Architecting next-generation deployment environments,
                  high-throughput computing rigs, and tactical engineering gear
                  for the modern developer.
                </p>
              </div>
            </Col>

            <Col lg={2} md={4} sm={6} xs={6}>
              <h6 className="directory-header">HARDWARE</h6>
              <ul className="directory-links">
                <li>
                  <Link to="/shop?cat=rigs">Custom Rigs</Link>
                </li>
                <li>
                  <Link to="/shop?cat=processors">Neural Units</Link>
                </li>
                <li>
                  <Link to="/shop?cat=peripherals">Peripherals</Link>
                </li>
                <li>
                  <Link to="/shop?cat=storage">Flash Array</Link>
                </li>
              </ul>
            </Col>

            <Col lg={2} md={4} sm={6} xs={6}>
              <h6 className="directory-header">RESOURCES</h6>
              <ul className="directory-links">
                <li>
                  <Link to="/docs">Documentation</Link>
                </li>
                <li>
                  <Link to="/api-status">System Status</Link>
                </li>
                <li>
                  <Link to="/warranty">Hardware Warranty</Link>
                </li>
                <li>
                  <Link to="/support">Secure Ticket</Link>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={4} sm={12}>
              <h6 className="directory-header">PATCH NOTES</h6>
              <p className="newsletter-microcopy">
                Sign up for production drops, hardware restocks, and direct
                hardware pricing updates.
              </p>
              <form
                className="footer-secure-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="node@domain.com"
                  className="secure-input"
                  required
                />
                <button
                  type="submit"
                  className="secure-submit-btn"
                  aria-label="Subscribe 
                to updates"
                >
                  →
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="footer-ledger-bar">
        <Container>
          <div className="ledger-flex-wrapper">
            <p className="ledger-copyright">
              &copy; {currentYear}
              TECH_ELITE SYSTEM LABS. INC. ALL RIGHTS RESERVED.
            </p>
            <div className="ledger-legal-links">
              <Link to="/privacy">PRIVACY_VAULT</Link>
              <span className="ledger-separator">/</span>
              <Link to="/terms">TERMS_OF_SERVICE</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
