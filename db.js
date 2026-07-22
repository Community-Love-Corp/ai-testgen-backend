import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Get the absolute path of the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Lock down the exact path to your database file. In Production,
// Change your database path resolver to use the persistent mount path
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/data/database.sqlite' 
  : path.resolve(__dirname, 'database.sqlite');

console.log(`[Database] Connecting to absolute path: ${dbPath}`);

// 3. Initialize the database using the absolute path
const db = new Database(dbPath, { verbose: console.log });
//Create table if not exists

db.exec(`
  CREATE TABLE IF NOT EXISTS generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userStory TEXT,
    resultJson TEXT,
    createdAt TEXT
  );
`);

// Inside your db.js table initialization block:
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL CHECK(length(email) <= 50),
    password TEXT NOT NULL CHECK(length(password) <= 255), /* Hashing procedure requires extended length */
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Added auto-timestamp fallback
    isVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    verificationTokenExpires TEXT
  );
`);


//db.exec(`
//	ALTER TABLE generations ADD COLUMN userId INTEGER;	
//`);

const tableInfo = db.pragma("table_info(generations)");
const columnExists = tableInfo.some(col => col.name === 'userId');

if (!columnExists) {
  db.exec(`ALTER TABLE generations ADD COLUMN userId INTEGER;`); 
}

const mfaTableInfo = db.pragma("table_info(users)");
const mfaCodeColumnExists = tableInfo.some(col => col.name === 'mfaCode');
const mfaExpiresColumnExists = tableInfo.some(col => col.name === 'mfaExpires');

if (!columnExists) {
  db.exec(`ALTER TABLE generations ADD COLUMN userId INTEGER;`); 
}
if (!mfaCodeColumnExists) {
  db.exec(`ALTER TABLE users ADD COLUMN mfaCode TEXT;`); 
}
if (!mfaExpiresColumnExists) {
  db.exec(`ALTER TABLE users ADD COLUMN mfaExpires TEXT;`); 
}



export default db;