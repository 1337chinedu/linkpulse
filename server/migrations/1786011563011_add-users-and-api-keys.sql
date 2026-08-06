-- Up Migration

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);

-- Links predate auth; there's no owner to assign existing rows to, so this
-- is a clean-slate migration rather than a backfill.
DELETE FROM links;

ALTER TABLE links
  ADD COLUMN user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX links_user_id_idx ON links(user_id);

-- Down Migration

DROP INDEX links_user_id_idx;
ALTER TABLE links DROP COLUMN user_id;
DROP INDEX api_keys_user_id_idx;
DROP TABLE api_keys;
DROP TABLE users;
