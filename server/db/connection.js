const mongoose = require('mongoose');

const DEFAULT_RETRY_ATTEMPTS = Number(process.env.DB_RETRY_ATTEMPTS) || 5;
const INITIAL_RETRY_DELAY_MS = 1000;

mongoose.set('strictQuery', true);

function log(...args) {
  console.log('[db]', ...args);
}

async function connectDB(uri = process.env.DB_URL, attempts = DEFAULT_RETRY_ATTEMPTS, delay = INITIAL_RETRY_DELAY_MS) {
  if (!uri) throw new Error('Missing DB_URL environment variable');

  try {
    log('Connecting to DB:', uri);
    await mongoose.connect(uri);
    log('Database connected');
    attachListeners();
    return mongoose.connection;
  } catch (err) {
    log(`DB connection failed (${attempts} attempts left):`, err.message || err);
    if (attempts <= 1) {
      log('Exhausted DB reconnection attempts');
      throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return connectDB(uri, attempts - 1, Math.min(delay * 2, 30000));
  }
}

function attachListeners() {
  const c = mongoose.connection;
  c.on('connecting', () => log('connecting'));
  c.on('connected', () => log('connected'));
  c.on('reconnected', () => log('reconnected'));
  c.on('error', (err) => log('connection error:', err.message || err));
  c.on('disconnected', () => {
    log('disconnected');
    // Mongoose handles auto-reconnect by default, but we log it here.
  });
}

async function closeDB() {
  await mongoose.disconnect();
  log('Database connection closed');
}

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, closeDB };