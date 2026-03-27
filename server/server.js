const express = require('express');
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

app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://app.localhost:5173'],
  credentials: true
}));
app.use(cookieParser());
// Raise body size limit to 5 MB so base64 profile images (≤ 2 MB file = ~2.7 MB base64) pass through
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/api/v1', indexRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

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

    app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
