import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { Link } from "../api/types";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./DashboardPage.css";

export function DashboardPage() {
  const { user } = useAuth();
  const { token } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    api
      .listLinks(token)
      .then(({ links }) => setLinks(links))
      .catch(() => setError("Couldn't load your links"))
      .finally(() => setLoadingLinks(false));
  }, [token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      const link = await api.createLink(token, url, code || undefined);
      setLinks((prev) => [link, ...prev]);
      setUrl("");
      setCode("");
      setShowModal(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create link");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy(shortUrl: string, linkCode: string) {
    await navigator.clipboard.writeText(shortUrl);
    setCopiedCode(linkCode);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  const stats = [
    {
      label: "Total Links",
      value: links.length,
      icon: TrendingUp,
      color: "primary",
    },
    {
      label: "Total Clicks",
      value: links.reduce((sum, link) => sum + link.clicks, 0),
      icon: BarChart3,
      color: "success",
    },
    {
      label: "Avg. Clicks",
      value:
        links.length > 0
          ? Math.round(links.reduce((sum, link) => sum + link.clicks, 0) / links.length)
          : 0,
      icon: TrendingUp,
      color: "warning",
    },
  ];

  return (
    <>
      <Navigation />
      <div className="dashboard-page">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="welcome-text">Welcome back, {user?.email}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Create Link
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                className={`stat-card stat-${stat.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Links Section */}
        <div className="links-section">
          <div className="section-title">
            <h2>Your Links</h2>
            {links.length > 0 && <span className="badge badge-primary">{links.length}</span>}
          </div>

          {error && <div className="error-alert">{error}</div>}

          {loadingLinks ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your links...</p>
            </div>
          ) : links.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="empty-icon">✨</div>
              <h3>No links yet</h3>
              <p>Create your first short link to get started</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={20} />
                Create Link
              </button>
            </motion.div>
          ) : (
            <div className="table-wrapper">
              <table className="links-table">
                <thead>
                  <tr>
                    <th>Short Link</th>
                    <th>Target URL</th>
                    <th className="text-right">Clicks</th>
                    <th className="text-right">Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {links.map((link, idx) => (
                      <motion.tr
                        key={link.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td>
                          <div className="link-cell">
                            <a href={link.shortUrl} target="_blank" rel="noreferrer">
                              {link.shortUrl.replace(/^https?:\/\//, "")}
                              <ExternalLink size={14} />
                            </a>
                            <button
                              className="copy-btn"
                              onClick={() => handleCopy(link.shortUrl, link.code)}
                              title={copiedCode === link.code ? "Copied!" : "Copy"}
                            >
                              {copiedCode === link.code ? (
                                <Check size={16} className="text-success" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="target-url" title={link.url}>
                            {link.url}
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="clicks-badge">{link.clicks}</span>
                        </td>
                        <td className="text-right text-secondary">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-right">
                          <button className="btn-icon" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Link Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Create New Link</h2>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreate} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="url">Target URL *</label>
                    <input
                      id="url"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">Custom Code (Optional)</label>
                    <input
                      id="code"
                      type="text"
                      placeholder="mylink (leave empty for auto)"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Link"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
