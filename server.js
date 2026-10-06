const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'builds.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function readBuilds() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
}
function writeBuilds(builds) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(builds, null, 2));
}

// API: list all builds (optional ?class=Sorcerer)
app.get('/api/builds', (req, res) => {
  let builds = readBuilds();
  if (req.query.class) {
    builds = builds.filter(b => b.class === req.query.class);
  }
  res.json(builds);
});

// API: get one build
app.get('/api/builds/:id', (req, res) => {
  const build = readBuilds().find(b => b.id === req.params.id);
  if (!build) return res.status(404).json({ error: 'Not found' });
  res.json(build);
});

// API: create build
app.post('/api/builds', (req, res) => {
  const { title, className, author, description, skills, gear } = req.body;
  if (!title || !className || !author) {
    return res.status(400).json({ error: 'title, className, author required' });
  }
  const builds = readBuilds();
  const build = {
    id: nanoid(8),
    title,
    class: className,
    author,
    description: description || '',
    skills: Array.isArray(skills) ? skills : [],
    gear: gear || '',
    createdAt: new Date().toISOString()
  };
  builds.push(build);
  writeBuilds(builds);
  res.status(201).json(build);
});

app.listen(PORT, () => console.log(`Aion 2 Builds running on http://localhost:${PORT}`));