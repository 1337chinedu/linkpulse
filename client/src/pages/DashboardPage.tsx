import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { Link } from "../api/types";

export function DashboardPage() {
  const { token, user } = useAuth();
  const [links, setLinks] = useState<Link[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  return (
    <>
      <Navigation />
      <div className="dashboard">
        <p className="dashboard-subtitle">Welcome, {user?.email}</p>

        <form className="link-form" onSubmit={handleCreate}>
          <input
            type="url"
            placeholder="https://example.com/some/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="custom code (optional)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Shortening…" : "Shorten"}
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}

        {loadingLinks ? (
          <p className="status-message">Loading your links…</p>
        ) : links.length === 0 ? (
          <p className="status-message">No links yet — create your first one above.</p>
        ) : (
          <table className="link-table">
            <thead>
              <tr>
                <th>Short link</th>
                <th>Target</th>
                <th>Clicks</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.code}>
                  <td>
                    <a href={link.shortUrl} target="_blank" rel="noreferrer">
                      {link.shortUrl.replace(/^https?:\/\//, "")}
                    </a>
                    <button
                      className="link-button"
                      onClick={() => handleCopy(link.shortUrl, link.code)}
                    >
                      {copiedCode === link.code ? "Copied!" : "Copy"}
                    </button>
                  </td>
                  <td className="target-url" title={link.url}>
                    {link.url}
                  </td>
                  <td>{link.clicks}</td>
                  <td>{new Date(link.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
