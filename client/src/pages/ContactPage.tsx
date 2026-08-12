import { useState } from "react";
import { Navigation } from "../components/Navigation";
import { Mail, Send, MessageSquare, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ContactPage.css";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mwpjbeej", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  }

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
          <h1>Get in touch</h1>
          <p className="hero-subtitle">
            Have a question? We'd love to hear from you. Send us a message.
          </p>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="contact-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="contact-container">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Let's connect</h2>
              <div className="info-cards">
                <motion.div
                  className="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="info-icon">
                    <Mail size={24} />
                  </div>
                  <h3>Email</h3>
                  <p>hello@linkpulse.dev</p>
                </motion.div>

                <motion.div
                  className="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="info-icon">
                    <MessageSquare size={24} />
                  </div>
                  <h3>Response Time</h3>
                  <p>Within 24 hours</p>
                </motion.div>

                <motion.div
                  className="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="info-icon">
                    <MessageSquare size={24} />
                  </div>
                  <h3>Support</h3>
                  <p>GitHub Discussions</p>
                </motion.div>
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              className="contact-form-container"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    className="success-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <CheckCircle size={64} className="success-icon" />
                    <h3>Message sent!</h3>
                    <p>Thanks for reaching out. We'll get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">Your Name *</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        placeholder="Tell us what's on your mind..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        disabled={submitting}
                        rows={6}
                      />
                    </div>

                    {error && (
                      <motion.div
                        className="error-alert"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary btn-large"
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Send Message"}
                      <Send size={20} />
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
