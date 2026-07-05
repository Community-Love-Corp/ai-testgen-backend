import Database from "better-sqlite3";

const db = new Database("ai-testgen.db");

//Create table if not exists

db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userStory TEXT,
    resultJson TEXT,
    createdAt TEXT
  );
`);

export default db;