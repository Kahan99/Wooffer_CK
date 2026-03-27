const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db/connection');
const indexRoutes = require('./routes/index.routes');
const { redisCacheClient, redisStreamClient } = require('./utilities/redis.clients');
const { setSocketIo } = require('./utilities/socket.utility');
const Notification = require('./models/Notification');

app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://127.0.0.1:5173', 'http://app.localhost:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174', 'http://app.localhost:5174'
  ],
  credentials: true
}));
app.use(cookieParser());
// Raise body size limit to 5 MB so base64 profile images (≤ 2 MB file = ~2.7 MB base64) pass through
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/api/v1', indexRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
app.set('io', io);
setSocketIo(io);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

function startNotificationRealtimeBridge() {
  let stream;
  try {
    stream = Notification.watch([], { fullDocument: 'updateLookup' });

    stream.on('change', (change) => {
      if (change?.operationType !== 'insert') return;
      const notification = change.fullDocument;
      const userId = notification?.userId ? String(notification.userId) : null;
      if (!userId) return;

      io.emit(`notifications_${userId}`, {
        action: 'created',
        notification,
      });
    });

    stream.on('error', (err) => {
      const msg = String(err?.message || 'Unknown change stream error');
      if (msg.includes('only supported on replica sets')) {
        console.warn('ℹ️ Notification realtime bridge disabled: MongoDB is running in standalone mode (no replica set).');
        if (stream) {
          stream.removeAllListeners();
          stream.close().catch(() => {});
        }
        return;
      }
      console.warn(`⚠️ Notification realtime bridge error: ${msg}`);
    });
  } catch (err) {
    console.warn(`⚠️ Notification realtime bridge unavailable: ${err.message}`);
  }
}

const errorMiddleware = require('./middlewares/error.middlware.js');
app.use(errorMiddleware);

connectDB()
  .then(async () => {
    // Connect both Redis clients — fail fast if Docker Redis is not available.
    // No fallback. No graceful degradation at startup.
    try {
      await redisCacheClient.connect();
      await redisStreamClient.connect();
    } catch (err) {
      console.error('❌ Failed to connect to Docker Redis (wooffer-redis):', err.message);
      console.error('💡 Make sure the container is running: docker compose up -d');
      process.exit(1);
    }

    server.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port} with WebSockets`);
    });

    startNotificationRealtimeBridge();
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
