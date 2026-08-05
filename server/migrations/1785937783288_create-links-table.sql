-- Up Migration

CREATE TABLE links (
  code TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_clicked_at TIMESTAMPTZ
);

-- Down Migration

DROP TABLE links;
