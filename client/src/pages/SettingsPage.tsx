import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navigation } from "../components/Navigation";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { ApiKey } from "../api/types";

export function SettingsPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadKeys();
  }, [token]);

  async function loadKeys() {
    if (!token) return;
    try {
      setLoadingKeys(true);
      const result = await api.listApiKeys(token);
      setKeys(result.keys);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load API keys");
    } finally {
      setLoadingKeys(false);
    }
  }

  async function handleCreateKey(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    setCreatingKey(true);

    try {
      const newKey = await api.createApiKey(token);
      setKeys((prev) => [newKey, ...prev]);
      setSuccess("API key created successfully");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create API key");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!token || !confirm("Are you sure? This API key will be revoked permanently.")) return;
    setError(null);
    setSuccess(null);

    try {
      await api.revokeApiKey(token, keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      setSuccess("API key revoked");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke API key");
    }
  }

  async function handleCopyKey(secret: string) {
    await navigator.clipboard.writeText(secret);
    setCopiedKey(secret);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="settings-page">
          <h1>Settings</h1>

          <section className="settings-section">
            <h2>Account</h2>
            <div className="setting-item">
              <label>Email</label>
              <p className="setting-value">{user?.email}</p>
            </div>
          </section>

          <section className="settings-section">
            <h2>API Keys</h2>
            <p className="section-description">
              API keys allow you to programmatically create and manage your short
              links. Keep these secret — don't share them in public repositories.
            </p>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleCreateKey} className="api-key-form">
              <button type="submit" disabled={creatingKey || loadingKeys}>
                {creatingKey ? "Creating…" : "Create new API key"}
              </button>
            </form>

            {loadingKeys ? (
              <p className="status-message">Loading API keys…</p>
            ) : keys.length === 0 ? (
              <p className="status-message">No API keys yet. Create one to get started.</p>
            ) : (
              <div className="api-keys-list">
                {keys.map((key) => (
                  <div key={key.id} className="api-key-item">
                    <div className="api-key-info">
                      <div className="api-key-name">Key #{keys.indexOf(key) + 1}</div>
                      <div className="api-key-created">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                      {key.secret && (() => {
                        const secret = key.secret;
                        return (
                          <div className="api-key-secret">
                            <code>{secret.substring(0, 20)}...</code>
                            <button
                              className="link-button"
                              onClick={() => handleCopyKey(secret)}
                            >
                              {copiedKey === secret ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                    <button
                      className="link-button danger"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="settings-section">
            <h2>Danger zone</h2>
            <div className="danger-zone">
              <button
                className="btn-danger"
                onClick={() => {
                  if (confirm("You will be logged out.")) {
                    logout();
                    navigate("/login");
                  }
                }}
              >
                Log out
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
