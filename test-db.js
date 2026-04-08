import Database from 'better-sqlite3';
try {
  const db = new Database('test.db');
  console.log('Success');
} catch (e) {
  console.error(e);
}
