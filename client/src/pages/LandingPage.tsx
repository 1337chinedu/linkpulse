import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";

export function LandingPage() {
  return (
    <>
      <Navigation />
      <div className="landing">
        <section className="hero">
          <div className="hero-content">
            <h1>Shorten your URLs, track your clicks</h1>
            <p>
              LinkPulse makes it easy to create short, memorable links and
              understand where your traffic comes from.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn-primary">
                Get started free
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn more
              </Link>
            </div>
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <h2>How it works</h2>
          <div className="features">
            <div className="feature-card">
              <h3>1. Paste your URL</h3>
              <p>
                Enter any long URL you want to shorten. You can optionally
                customize the short code.
              </p>
            </div>
            <div className="feature-card">
              <h3>2. Get a short link</h3>
              <p>
                Instantly receive a clean, memorable short link that's easy to
                share across any platform.
              </p>
            </div>
            <div className="feature-card">
              <h3>3. Track clicks</h3>
              <p>
                Watch your analytics dashboard to see how many times your links
                are used and from where.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to get started?</h2>
          <p>Create your first short link in seconds</p>
          <Link to="/register" className="btn-primary">
            Sign up now
          </Link>
        </section>
      </div>
    </>
  );
}
