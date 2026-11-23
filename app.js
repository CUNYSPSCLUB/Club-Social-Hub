/* SPS Club Hub — plain JavaScript, no build step.
   Club data lives in clubs.json. Edit that file to add or change clubs. */

const app = document.getElementById("app");
const state = { clubs: [], categories: [], catById: {}, query: "", cat: "all" };

/* ---------- Helpers ---------- */
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tint = (hex, alpha) => hex + Math.round(alpha * 255).toString(16).padStart(2, "0");

function getSaved() {
  try { return JSON.parse(localStorage.getItem("savedClubs") || "[]"); } catch { return []; }
}
function setSaved(ids) {
  try { localStorage.setItem("savedClubs", JSON.stringify(ids)); } catch { /* storage unavailable */ }
}
function toggleSaved(id) {
  const s = getSaved();
  setSaved(s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
}

/* ---------- Components ---------- */
function clubCard(c) {
  const cat = state.catById[c.category];
  const saved = getSaved().includes(c.id);
  return `
  <a class="card" href="#club/${esc(c.id)}">
    <div class="avatar" style="background:${tint(cat.color, .14)}">${c.emoji}</div>
    <div class="card-body">
      <h3>${esc(c.name)}</h3>
      <span class="tag" style="background:${tint(cat.color, .12)};color:${cat.color}">${esc(cat.name)}</span>
      ${c.status === "offline" ? '<span class="badge-off">Paused</span>' : ""}
    </div>
    <button class="save" data-save="${esc(c.id)}" aria-label="${saved ? "Remove from" : "Add to"} saved clubs" aria-pressed="${saved}">${saved ? "💛" : "🤍"}</button>
  </a>`;
}

function filteredClubs() {
  const q = state.query.trim().toLowerCase();
  return state.clubs.filter(c =>
    (state.cat === "all" || c.category === state.cat) &&
    (!q || (c.name + " " + c.about).toLowerCase().includes(q))
  );
}

/* ---------- Pages ---------- */
function pageHome() {
  const active = state.clubs.filter(c => c.status !== "offline");
  const featured = [...active].sort(() => Math.random() - .5).slice(0, 4);
  return `
  <section class="hero">
    <h1>Find your <em>people</em> at SPS.</h1>
    <p>Every CUNY SPS student club, in one place.</p>
    <label class="search">🔎<input id="homeSearch" type="search" placeholder="Search clubs…" aria-label="Search clubs"></label>
    <div class="stats">
      <div class="stat"><b>${active.length}</b><span>active clubs</span></div>
      <div class="stat"><b>${state.categories.length}</b><span>categories</span></div>
      <div class="stat"><b>100%</b><span>online friendly</span></div>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Browse by interest</h2></div>
    <div class="tiles">
      ${state.categories.map(cat => {
        const n = state.clubs.filter(c => c.category === cat.id).length;
        return `<button class="tile" style="background:${cat.color}" data-cat="${cat.id}"><b>${esc(cat.name)}</b><span>${n} clubs</span></button>`;
      }).join("")}
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Discover</h2><a href="#clubs">See all →</a></div>
    <div class="grid">${featured.map(clubCard).join("")}</div>
  </section>

  <section class="cta">
    <div><h2>Have an idea for a club?</h2><p>Student Life can help you start one.</p></div>
    <a class="btn btn-blue" href="#about">Start a club</a>
  </section>`;
}

function pageClubs() {
  const list = filteredClubs();
  return `
  <h1 class="page-title">Clubs</h1>
  <label class="search">🔎<input id="clubSearch" type="search" placeholder="Search by name or topic" value="${esc(state.query)}" aria-label="Search clubs"></label>
  <div class="chips" role="group" aria-label="Filter by category">
    <button class="chip" data-chip="all" aria-pressed="${state.cat === "all"}">All</button>
    ${state.categories.map(c => `<button class="chip" data-chip="${c.id}" aria-pressed="${state.cat === c.id}">${esc(c.name)}</button>`).join("")}
  </div>
  <p class="count">${list.length} club${list.length === 1 ? "" : "s"}</p>
  <div class="grid" id="clubGrid">
    ${list.length ? list.map(clubCard).join("") : `<div class="empty"><div class="big">🔍</div>No clubs match. Try another word.</div>`}
  </div>`;
}

function pageClub(id) {
  const c = state.clubs.find(x => x.id === id);
  if (!c) return `<div class="empty"><div class="big">🤷</div>Club not found. <a href="#clubs">Back to clubs</a></div>`;
  const cat = state.catById[c.category];
  const saved = getSaved().includes(c.id);
  return `
  <a class="back" href="#clubs">← All clubs</a>
  <section class="detail-hero" style="background:linear-gradient(150deg, ${cat.color}, ${tint(cat.color, .8)})">
    <div class="avatar">${c.emoji}</div>
    <h1>${esc(c.name)}</h1>
    <span class="tag">${esc(cat.name)}</span>
    ${c.status === "offline" ? '<span class="tag" style="margin-left:6px">Temporarily paused</span>' : ""}
  </section>

  <section class="panel">
    <h2>About</h2>
    <p>${esc(c.about)}</p>
    <div class="actions">
      ${c.join ? `<a class="btn btn-primary" href="${esc(c.join)}" target="_blank" rel="noopener">Join this club ↗</a>` : ""}
      <button class="btn btn-ghost" data-save="${esc(c.id)}">${saved ? "💛 Saved" : "🤍 Save"}</button>
      ${c.website ? `<a class="btn btn-ghost" href="${esc(c.website)}" target="_blank" rel="noopener">Website ↗</a>` : ""}
      ${c.email ? `<a class="btn btn-ghost" href="mailto:${esc(c.email)}">Email</a>` : ""}
    </div>
    ${!c.join ? `<p class="note">No sign-up form is listed yet. Contact Student Life to get involved.</p>` : ""}
  </section>

  <section class="panel">
    <h2>Events & posts</h2>
    <p class="note" style="margin:0">Club events and posts are coming in the next version.</p>
  </section>`;
}

function pageEvents() {
  return `
  <h1 class="page-title">Events</h1>
  <section class="panel">
    <h2>📅 Student Life Calendar</h2>
    <p>Club meetings and campus events are listed on the Student Life calendar for now.</p>
    <div class="actions"><a class="btn btn-primary" href="https://openlab.sps.cuny.edu/groups/cuny-sps-student-life/events/" target="_blank" rel="noopener">Open calendar ↗</a></div>
  </section>
  <section class="panel">
    <h2>Coming next</h2>
    <ul class="list"><li>Events posted by club leads</li><li>RSVP with your CUNY login</li><li>Reminders on your phone</li></ul>
  </section>`;
}

function pageSaved() {
  const ids = getSaved();
  const list = state.clubs.filter(c => ids.includes(c.id));
  return `
  <h1 class="page-title">Saved clubs</h1>
  ${list.length
    ? `<div class="grid">${list.map(clubCard).join("")}</div>`
    : `<div class="empty"><div class="big">💛</div>Tap the heart on any club to save it here.<div class="actions" style="justify-content:center"><a class="btn btn-blue" href="#clubs">Browse clubs</a></div></div>`}`;
}

function pageAbout() {
  return `
  <h1 class="page-title">About</h1>
  <section class="panel">
    <h2>Start a club</h2>
    <p>Have an idea for a new club or activity? Share it with Student Life.</p>
    <div class="actions"><a class="btn btn-primary" href="mailto:anthony.sweeney@cuny.edu?subject=New%20club%20idea">Email Student Life</a></div>
  </section>
  <section class="panel">
    <h2>Office of Student Life</h2>
    <ul class="list">
      <li>Monday–Friday, remote hours by appointment</li>
      <li>(212) 652-CUNY</li>
      <li>119 W. 31st Street, New York, NY 10001</li>
    </ul>
  </section>
  <section class="panel">
    <h2>About this app</h2>
    <p>A student project to bring every CUNY SPS club into one place. Club info comes from the
      <a href="https://sps.cuny.edu/student-success/student-life/student-clubs-and-organizations" target="_blank" rel="noopener">official clubs page</a>.</p>
    <p class="note">You can install this site like an app: use “Add to Home Screen” on your phone.</p>
  </section>`;
}

/* ---------- Router ---------- */
function render() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const [route, param] = hash.split("/");
  const pages = { home: pageHome, clubs: pageClubs, events: pageEvents, saved: pageSaved, about: pageAbout };
  app.innerHTML = route === "club" ? pageClub(param) : (pages[route] || pageHome)();

  const tab = route === "club" ? "clubs" : (pages[route] ? route : "home");
  document.querySelectorAll(".tabbar a").forEach(a => a.classList.toggle("active", a.dataset.tab === tab));
  document.title = route === "club"
    ? `${(state.clubs.find(c => c.id === param) || {}).name || "Club"} · SPS Club Hub`
    : "SPS Club Hub";
}

function rerenderGrid() {
  const grid = document.getElementById("clubGrid");
  if (!grid) return render();
  const scroll = window.scrollY;
  render();
  const input = document.getElementById("clubSearch");
  if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  window.scrollTo(0, scroll);
}

/* ---------- Events ---------- */
app.addEventListener("click", e => {
  const save = e.target.closest("[data-save]");
  if (save) { e.preventDefault(); e.stopPropagation(); toggleSaved(save.dataset.save); const y = scrollY; render(); scrollTo(0, y); return; }
  const tile = e.target.closest("[data-cat]");
  if (tile) { state.cat = tile.dataset.cat; state.query = ""; location.hash = "clubs"; return; }
  const chip = e.target.closest("[data-chip]");
  if (chip) { state.cat = chip.dataset.chip; render(); }
});

app.addEventListener("input", e => {
  if (e.target.id === "clubSearch") { state.query = e.target.value; rerenderGrid(); }
});

app.addEventListener("keydown", e => {
  if (e.target.id === "homeSearch" && e.key === "Enter") {
    state.query = e.target.value; state.cat = "all"; location.hash = "clubs";
  }
});

window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

/* ---------- Install as app (PWA) ---------- */
let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; installBtn.hidden = false; });
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installBtn.hidden = true;
});
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* ---------- Start ---------- */
fetch("clubs.json")
  .then(r => r.json())
  .then(data => {
    state.clubs = data.clubs.sort((a, b) => a.name.localeCompare(b.name));
    state.categories = data.categories;
    state.catById = Object.fromEntries(data.categories.map(c => [c.id, c]));
    render();
  })
  .catch(() => { app.innerHTML = `<div class="empty"><div class="big">⚠️</div>Couldn't load clubs. Please refresh.</div>`; });
