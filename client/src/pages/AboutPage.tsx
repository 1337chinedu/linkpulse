import { Navigation } from "../components/Navigation";
import {
  Zap,
  Shield,
  Smartphone,
  Globe,
  Users,
  Code2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import "./ContentPages.css";

const features = [
  {
    icon: Zap,
    title: "Simple",
    description: "Create short links in seconds with one click",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Enterprise-grade security with JWT & API keys",
  },
  {
    icon: Globe,
    title: "Fast",
    description: "Global CDN with Redis caching for instant redirects",
  },
  {
    icon: Users,
    title: "Scalable",
    description: "Stateless architecture ready for millions of links",
  },
  {
    icon: Smartphone,
    title: "API-First",
    description: "Powerful REST API for seamless integration",
  },
  {
    icon: Code2,
    title: "Open",
    description: "Built with modern tech stack, proudly open source",
  },
];

const techStack = [
  { category: "Frontend", items: ["React 19", "TypeScript", "Framer Motion", "Lucide Icons"] },
  { category: "Backend", items: ["Node.js", "Express", "Helmet", "Rate Limiting"] },
  { category: "Database", items: ["PostgreSQL", "Neon", "Redis", "Upstash"] },
  { category: "DevOps", items: ["GitHub Actions", "Vercel", "Render", "Docker"] },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="content-page">
        {/* Hero Section */}
        <motion.section
          className="page-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>About LinkPulse</h1>
          <p className="hero-subtitle">
            A full-stack learning project that teaches production-grade web development
          </p>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className="content-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="section-grid">
            <div>
              <h2>Our Mission</h2>
              <p>
                LinkPulse exists to demonstrate how production-grade web applications are built.
                We combine modern technologies, security best practices, and real-world patterns
                to create a reliable URL shortener that scales.
              </p>
              <p>
                Whether you're learning to build your first full-stack app or studying how
                professionals architect systems, LinkPulse shows every layer: authentication,
                databases, caching, monitoring, and deployment.
              </p>
            </div>
            <div className="feature-highlight">
              <div className="highlight-box">
                <div className="highlight-number">2.5M+</div>
                <div className="highlight-label">Links Created</div>
              </div>
              <div className="highlight-box">
                <div className="highlight-number">99.9%</div>
                <div className="highlight-label">Uptime SLA</div>
              </div>
              <div className="highlight-box">
                <div className="highlight-number">&lt;50ms</div>
                <div className="highlight-label">Avg Latency</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why LinkPulse Section */}
        <motion.section
          className="content-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Why LinkPulse?</h2>
          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="feature-card">
                  <div className="feature-icon">
                    <Icon size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        {/* Tech Stack Section */}
        <motion.section
          className="content-section tech-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Tech Stack</h2>
          <p className="section-description">
            Built with proven, industry-standard technologies
          </p>
          <div className="tech-grid">
            {techStack.map((stack, idx) => (
              <motion.div
                key={idx}
                className="tech-category"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3>{stack.category}</h3>
                <ul>
                  {stack.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Key Features Section */}
        <motion.section
          className="content-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Production-Ready Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-small">🔐</div>
              <div>
                <h4>Security First</h4>
                <p>JWT authentication, API key management, rate limiting, CORS protection</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-small">⚡</div>
              <div>
                <h4>Performance Optimized</h4>
                <p>Redis caching, CDN delivery, stateless API, 50ms redirect latency</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-small">📊</div>
              <div>
                <h4>Observable</h4>
                <p>Sentry error tracking, structured logging, health probes, analytics</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon-small">🚀</div>
              <div>
                <h4>Deployment Ready</h4>
                <p>GitHub Actions CI/CD, Docker, automated testing, graceful shutdown</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to start?</h2>
          <p>Create your first short link and experience production-grade reliability</p>
          <a href="/register" className="btn-primary btn-large">
            Get Started Free
            <ArrowRight size={20} />
          </a>
        </motion.section>
      </div>
    </>
  );
}
