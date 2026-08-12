import { Navigation } from "../components/Navigation";

export function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="page-container">
        <article className="page-content">
          <h1>About LinkPulse</h1>

          <section>
            <h2>Our mission</h2>
            <p>
              LinkPulse exists to make URL shortening simple, reliable, and
              insightful. We believe everyone should be able to create short,
              memorable links without compromising on control or privacy.
            </p>
          </section>

          <section>
            <h2>Why LinkPulse?</h2>
            <ul>
              <li>
                <strong>Simple:</strong> No complicated setup or learning curve.
                Shorten a URL in seconds.
              </li>
              <li>
                <strong>Fast:</strong> Built with modern technology for
                lightning-quick redirects.
              </li>
              <li>
                <strong>Reliable:</strong> Your links are stored in a robust
                database and available 24/7.
              </li>
              <li>
                <strong>Transparent:</strong> Full control over your API keys
                and link analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2>Tech stack</h2>
            <p>
              LinkPulse is built with modern, proven technologies to ensure
              speed and reliability:
            </p>
            <div className="tech-grid">
              <div className="tech-item">
                <h3>Frontend</h3>
                <p>React + Vite + TypeScript</p>
              </div>
              <div className="tech-item">
                <h3>Backend</h3>
                <p>Node.js + Express</p>
              </div>
              <div className="tech-item">
                <h3>Database</h3>
                <p>PostgreSQL (Neon)</p>
              </div>
              <div className="tech-item">
                <h3>Hosting</h3>
                <p>Vercel + Render</p>
              </div>
              <div className="tech-item">
                <h3>Auth</h3>
                <p>JWT + API Keys</p>
              </div>
              <div className="tech-item">
                <h3>Monitoring</h3>
                <p>Sentry error tracking</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Open source learning</h2>
            <p>
              LinkPulse is a full-stack learning project demonstrating
              production-grade practices including authentication, rate
              limiting, error tracking, and more.
            </p>
          </section>
        </article>
      </div>
    </>
  );
}
