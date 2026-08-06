import app from "../src/app.js";
import { close as closeDb } from "../src/lib/db.js";
import { clearUsers } from "../src/lib/usersStore.js";

export function setupTestServer({ before, after, beforeEach }) {
  const ctx = { baseUrl: "" };
  let server;

  before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    ctx.baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await closeDb();
  });

  beforeEach(async () => {
    await clearUsers();
  });

  return ctx;
}
