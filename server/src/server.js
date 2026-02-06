
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vleague2026';

app.use(cors());
app.use(express.json());

// NoSQL Schema
const LeagueDataSchema = new mongoose.Schema({
  teams: { type: Array, default: [] },
  matches: { type: Array, default: [] },
  settings: { type: Object, default: {} }
}, { timestamps: true });

const LeagueData = mongoose.model('LeagueData', LeagueDataSchema);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB (NoSQL)'))
  .catch(err => console.error('DB Error:', err));

app.get('/api/data', async (req, res) => {
  let data = await LeagueData.findOne().sort({ createdAt: -1 });
  if (!data) data = await LeagueData.create({ teams: [], matches: [], settings: {} });
  res.json(data);
});

app.post('/api/data', async (req, res) => {
  await LeagueData.findOneAndUpdate({}, req.body, { upsert: true });
  res.json({ success: true });
});

app.listen(PORT, () => console.log(` API running on http://localhost:${PORT}`));
