import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Navigation } from "../components/Navigation";
import * as api from "../api/client";
import { ApiError } from "../api/client";
import type { ApiKey } from "../api/types";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Key,
  User,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./SettingsPage.css";

export function SettingsPage() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    setCreatingKey(true);

    try {
      const newKey = await api.createApiKey(token);
      setKeys((prev) => [newKey, ...prev]);
      setSuccess("API key created successfully");
      setKeyName("");
      setShowCreateModal(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create API key");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!token || !confirm("Are you sure? This API key will be revoked permanently."))
      return;
    setError(null);
    setSuccess(null);

    try {
      await api.revokeApiKey(token, keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      setSuccess("API key revoked");
      setTimeout(() => setSuccess(null), 3000);
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
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account and API keys</p>
        </div>

        {/* Account Section */}
        <motion.section
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="section-header">
            <User size={24} />
            <h2>Account</h2>
          </div>

          <div className="setting-item">
            <div>
              <label>Email Address</label>
              <p className="setting-value">{user?.email}</p>
            </div>
          </div>
        </motion.section>

        {/* API Keys Section */}
        <motion.section
          className="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="section-header">
            <Key size={24} />
            <h2>API Keys</h2>
          </div>

          <p className="section-description">
            Create API keys to programmatically manage your short links. Keep these secret!
          </p>

          {error && (
            <motion.div
              className="error-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle size={18} />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="success-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Check size={18} />
              {success}
            </motion.div>
          )}

          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={creatingKey || loadingKeys}
          >
            <Plus size={20} />
            Create New API Key
          </button>

          {loadingKeys ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Key size={48} />
              <h3>No API keys yet</h3>
              <p>Create your first API key to get started</p>
            </motion.div>
          ) : (
            <div className="api-keys-list">
              <AnimatePresence>
                {keys.map((key, idx) => (
                  <motion.div
                    key={key.id}
                    className="api-key-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="key-info">
                      <div className="key-label">Key #{keys.indexOf(key) + 1}</div>
                      <div className="key-created">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </div>
                      {key.secret && (
                        <div className="key-secret">
                          <code>{key.secret.substring(0, 20)}...</code>
                          <button
                            className="copy-btn"
                            onClick={() => handleCopyKey(key.secret!)}
                            title={
                              copiedKey === key.secret ? "Copied!" : "Copy secret"
                            }
                          >
                            {copiedKey === key.secret ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      className="btn-danger-small"
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 size={16} />
                      Revoke
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          className="settings-section danger-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="section-header">
            <AlertTriangle size={24} />
            <h2>Danger Zone</h2>
          </div>

          <button
            className="btn-danger"
            onClick={() => {
              if (confirm("You will be logged out.")) {
                logout();
                navigate("/login");
              }
            }}
          >
            <LogOut size={20} />
            Log out
          </button>
        </motion.section>

        {/* Create API Key Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !creatingKey && setShowCreateModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Create New API Key</h2>
                  <button
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creatingKey}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateKey} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="keyName">API Key Name *</label>
                    <input
                      id="keyName"
                      type="text"
                      placeholder="e.g., Mobile App, Dashboard"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      required
                      disabled={creatingKey}
                    />
                    <small>A friendly name to identify this key</small>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                      disabled={creatingKey}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={creatingKey}
                    >
                      {creatingKey ? "Creating..." : "Create Key"}
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
