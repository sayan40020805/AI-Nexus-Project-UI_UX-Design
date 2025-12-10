import { Mail, Twitter, Linkedin, Github, Facebook } from 'lucide-react';
import '../styles/Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-h3">AI Nexus</h3>
            <p className="footer-p">
              Your comprehensive platform for AI industry news, tools, career opportunities, and community networking.
            </p>
          </div>

          <div>
            <h4 className="footer-h3">Platform</h4>
            <ul className="footer-ul">
              <li><a href="#" className="footer-a">AI News</a></li>
              <li><a href="#" className="footer-a">Model Directory</a></li>
              <li><a href="#" className="footer-a">Job Board</a></li>
              <li><a href="#" className="footer-a">Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h3">Resources</h4>
            <ul className="footer-ul">
              <li><a href="#" className="footer-a">About Us</a></li>
              <li><a href="#" className="footer-a">Blog</a></li>
              <li><a href="#" className="footer-a">Documentation</a></li>
              <li><a href="#" className="footer-a">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h3">Stay Connected</h4>
            <p className="footer-p">Subscribe to our newsletter for the latest AI updates.</p>
            <div className="footer-input-container">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-input"
              />
              <button className="footer-button">
                <Mail className="footer-icon" />
              </button>
            </div>
            <div className="footer-social-links">
              <a href="#" className="footer-a">
                <Twitter className="footer-icon" />
              </a>
              <a href="#" className="footer-a">
                <Linkedin className="footer-icon" />
              </a>
              <a href="#" className="footer-a">
                <Github className="footer-icon" />
              </a>
              <a href="#" className="footer-a">
                <Facebook className="footer-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 AI Nexus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
