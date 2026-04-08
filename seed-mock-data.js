import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'database', 'live.db');
const db = new Database(dbPath);

console.log('Seeding 2 months of mock data...');

const linkId = 'fa8c9fb88814ee66';

// 1. Reset
db.prepare('DELETE FROM links WHERE id = ?').run(linkId);
db.prepare('INSERT INTO links (id, original_url, slug, title) VALUES (?, ?, ?, ?)').run(
  linkId, 'https://google.com', 'test-link-slug', 'My 2-Month Premium Link'
);

const ch1Id = 'ch1';
const ch2Id = 'ch2';
db.prepare('INSERT OR IGNORE INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(
  ch1Id, linkId, 'Direct', 'test-link-slug/direct'
);
db.prepare('INSERT OR IGNORE INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)').run(
  ch2Id, linkId, 'QR', 'test-link-slug/qr'
);

const insertClick = db.prepare(`
  INSERT INTO clicks (id, channel_id, device, country, city, referrer, timestamp) 
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const countries = ['United States', 'India', 'United Kingdom', 'Canada', 'Germany', 'Australia'];
const devices = ['Desktop', 'Phone', 'Tablet'];
const cities = ['New York', 'Mumbai', 'London', 'Toronto', 'Berlin', 'Sydney'];

const today = new Date();

for (let i = 0; i < 60; i++) {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  const dayStr = date.toISOString().split('T')[0];
  
  // Randomly skip about 30% of days for zero count gaps
  if (Math.random() < 0.3) {
    console.log(`Skipping data for ${dayStr} (Zero Visits)`);
    continue;
  }

  // Add 5-40 random clicks per day
  const clickCount = Math.floor(Math.random() * 35) + 5;
  for (let j = 0; j < clickCount; j++) {
    const hour = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const min = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const ts = `${dayStr} ${hour}:${min}:00`;
    
    insertClick.run(
      crypto.randomBytes(8).toString('hex'),
      Math.random() > 0.3 ? ch1Id : ch2Id,
      devices[Math.floor(Math.random() * devices.length)],
      countries[Math.floor(Math.random() * countries.length)],
      cities[Math.floor(Math.random() * cities.length)],
      Math.random() > 0.5 ? 'Direct' : 'Social',
      ts
    );
  }
}

console.log('Successfully seeded 60 days of data for fa8c9fb88814ee66 with gaps.');
