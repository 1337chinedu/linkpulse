import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Lock,
  Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";
import "./LandingPage.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.8,
    },
  } as any,
};

export function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: "Instant Links",
      description: "Create short links in seconds with one click",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track clicks and monitor link performance in real-time",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Enterprise-grade security with JWT authentication",
    },
    {
      icon: Globe,
      title: "Global",
      description: "Works worldwide with ultra-fast CDN delivery",
    },
    {
      icon: Lock,
      title: "Private",
      description: "Your data stays yours with zero tracking",
    },
    {
      icon: Smartphone,
      title: "API Ready",
      description: "Integrate with your apps via powerful REST API",
    },
  ];

  return (
    <>
      <Navigation />
      <div className="landing-page">
        {/* Hero Section */}
        <section className="hero">
          <motion.div
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants} className="hero-title">
              Shorten URLs,{" "}
              <span className="gradient-text">Scale Insights</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="hero-subtitle">
              Create beautiful short links, track every click, and grow your
              business with real-time analytics. Fast, secure, and built for
              growth.
            </motion.p>
            <motion.div variants={itemVariants} className="hero-cta">
              <Link to="/register" className="btn-primary btn-large">
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn-secondary btn-large">
                Learn More
              </Link>
            </motion.div>

            {/* Floating Cards Animation */}
            <motion.div
              className="floating-cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 } as any}
            >
              <motion.div
                className="floating-card"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="card-icon">📊</div>
                <div>
                  <div className="card-value">2.5M</div>
                  <div className="card-label">Links Created</div>
                </div>
              </motion.div>
              <motion.div
                className="floating-card"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 0.2 }}
              >
                <div className="card-icon">⚡</div>
                <div>
                  <div className="card-value">99.9%</div>
                  <div className="card-label">Uptime</div>
                </div>
              </motion.div>
              <motion.div
                className="floating-card"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.4 }}
              >
                <div className="card-icon">🚀</div>
                <div>
                  <div className="card-value">&lt;50ms</div>
                  <div className="card-label">Latency</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Background Gradient */}
          <div className="hero-gradient"></div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Everything you need</h2>
            <p>Powerful features designed for growth and reliability</p>
          </motion.div>

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
                  <div className="feature-icon-wrapper">
                    <Icon size={32} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>Ready to get started?</h2>
          <p>Join thousands of users who trust LinkPulse with their links</p>
          <Link to="/register" className="btn-primary btn-large">
            Create Your First Link
            <ArrowRight size={20} />
          </Link>
        </motion.section>
      </div>
    </>
  );
}
