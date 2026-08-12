import { useState, type FormEvent } from "react";
import { Navigation } from "../components/Navigation";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  return (
    <>
      <Navigation />
      <div className="page-container">
        <article className="page-content contact-page">
          <h1>Get in touch</h1>
          <p>Have a question or feedback? We'd love to hear from you.</p>

          {submitted ? (
            <div className="success-message">
              <h2>Thanks for reaching out!</h2>
              <p>We've received your message and will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                />
              </label>

              {error && <p className="error-message">{error}</p>}

              <button type="submit">Send message</button>
            </form>
          )}
        </article>
      </div>
    </>
  );
}
