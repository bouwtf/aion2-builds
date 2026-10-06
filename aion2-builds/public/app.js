const API = '/api/builds';

// ---------- index page ----------
const buildList = document.getElementById('buildList');
const classFilter = document.getElementById('classFilter');

async function loadBuilds() {
  if (!buildList) return;
  const cls = classFilter?.value || '';
  const res = await fetch(API + (cls ? `?class=${encodeURIComponent(cls)}` : ''));
  const builds = await res.json();

  if (!builds.length) {
    buildList.innerHTML = '<p>No builds yet. Be the first to create one!</p>';
    return;
  }

  buildList.innerHTML = builds.map(b => `
    <a class="card build-card" href="build.html?id=${b.id}">
      <h3>${b.title}</h3>
      <span class="tag">${b.class}</span>
      <p class="author">by ${b.author}</p>
    </a>
  `).join('');
}

classFilter?.addEventListener('change', loadBuilds);
loadBuilds();

// ---------- create page ----------
const form = document.getElementById('buildForm');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = {
    title: fd.get('title'),
    className: fd.get('className'),
    author: fd.get('author'),
    description: fd.get('description'),
    gear: fd.get('gear'),
    skills: (fd.get('skills') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  };
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    const build = await res.json();
    window.location.href = `build.html?id=${build.id}`;
  } else {
    alert('Something went wrong.');
  }
});

// ---------- detail page ----------
const detail = document.getElementById('buildDetail');
if (detail) {
  const id = new URLSearchParams(location.search).get('id');
  fetch(`${API}/${id}`).then(r => r.json()).then(b => {
    document.getElementById('buildTitle').textContent = b.title;
    detail.innerHTML = `
      <span class="tag">${b.class}</span>
      <p class="author">by ${b.author}</p>
      <h3>Description</h3>
      <p>${b.description || '—'}</p>
      <h3>Skills</h3>
      <ul>${b.skills.map(s => `<li>${s}</li>`).join('') || '<li>—</li>'}</ul>
      <h3>Gear Notes</h3>
      <p>${b.gear || '—'}</p>
    `;
  });
}