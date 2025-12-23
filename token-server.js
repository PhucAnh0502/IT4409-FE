// Token Server cho GetStream
// Micro backend đơn giản để generate token từ Secret Key
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { StreamClient } from '@stream-io/node-sdk';

const app = express();
const PORT = 3001;
const API_KEY = process.env.VITE_GETSTREAM_API_KEY;
const SECRET_KEY = process.env.GETSTREAM_SECRET_KEY;

// Validate API keys on startup
if (!API_KEY || !SECRET_KEY) {
  console.error('❌ FATAL: Missing GetStream API credentials!');
  console.error('   VITE_GETSTREAM_API_KEY:', API_KEY ? 'Present' : 'MISSING');
  console.error('   GETSTREAM_SECRET_KEY:', SECRET_KEY ? 'Present' : 'MISSING');
  console.error('   Please check your .env file');
  process.exit(1);
}

console.log('✅ GetStream credentials loaded');
console.log('   API_KEY:', API_KEY.substring(0, 10) + '...');

const streamClient = new StreamClient(API_KEY, SECRET_KEY);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GetStream Token Server is running' });
});

// Endpoint tạo token cho user
app.post('/api/getstream/token', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('Generating token for user:', userId);

    // Generate token với user_id
    const token = streamClient.generateUserToken({ user_id: userId });

    res.json({
      token,
      userId,
      apiKey: API_KEY
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`GetStream Token Server is running on http://localhost:${PORT}`);
});