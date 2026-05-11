const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

async function seed() {
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const db = {
    users: [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@swtechnologies.in',
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date().toISOString()
      }
    ],
    contacts: [],
    newsletter: [],
    quotes: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  console.log('✅ Database seeded!');
  console.log('👤 Admin email:    admin@swtechnologies.in');
  console.log('🔑 Admin password: Admin@123');
}

seed();
