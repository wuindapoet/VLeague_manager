import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vleague2026';

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB Error:', err));

app.get('/health', (_req, res) => res.send('Server is running'));

// Auth & Users
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// ===== Existing data endpoints (giữ lại) =====
const LeagueDataSchema = new mongoose.Schema(
  {
    teams: { type: Array, default: [] },
    matches: { type: Array, default: [] },
    settings: { type: Object, default: {} }
  },
  { timestamps: true }
);

const LeagueData = mongoose.model('LeagueData', LeagueDataSchema);

app.get('/api/data', async (_req, res) => {
  let data = await LeagueData.findOne().sort({ createdAt: -1 });
  if (!data) data = await LeagueData.create({ teams: [], matches: [], settings: {} });
  res.json(data);
});

app.post('/api/data', async (req, res) => {
  await LeagueData.findOneAndUpdate({}, req.body, { upsert: true });
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));