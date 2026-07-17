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

db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		createdAt TEXT NOT NULL
	);
`);

//db.exec(`
//	ALTER TABLE generations ADD COLUMN userId INTEGER;	
//`);

const tableInfo = db.pragma("table_info(generations)");
const columnExists = tableInfo.some(col => col.name === 'userId');

if (!columnExists) {
  db.exec("ALTER TABLE generations ADD COLUMN userId INTEGER NO NULL;"); 
}


export default db;