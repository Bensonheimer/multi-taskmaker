(() => {
  "use strict";
  const STORAGE_KEY = "multitaskmaker_v1";
  const defaults = {
    favorites: ["tools", "gaming", "timers"],
    theme: "purple",
    compact: false,
    timers: [],
    notes: { roblox: "", minecraft: "" },
    customLinks: [],
    automationItems: [
      { id: "open-roblox", title: "Roblox öffnen", detail: "Öffnet Roblox, falls installiert.", kind: "app", target: "roblox" },
      { id: "open-minecraft", title: "Minecraft-Notiz öffnen", detail: "Zeigt deine gespeicherten Minecraft-Notizen.", kind: "note", target: "minecraft" }
    ]
  };
  let state = loadState();
  let currentView = "home";
  let toastTimer;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const viewPanel = $("#view-panel");
  const viewContent = $("#view-content");
  const viewLabel = $("#view-label");
  const homeSections = [$(".hero"), $(".section-heading"), $("#mode-grid")];

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...structuredClone(defaults), ...saved,
        favorites: Array.isArray(saved.favorites) ? saved.favorites : [...defaults.favorites],
        timers: Array.isArray(saved.timers) ? saved.timers : [],
        notes: { ...defaults.notes, ...(saved.notes || {}) },
        customLinks: Array.isArray(saved.customLinks) ? saved.customLinks : [],
        automationItems: Array.isArray(saved.automationItems) ? saved.automationItems : [...defaults.automationItems]
      };
    } catch { return structuredClone(defaults); }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { showToast("Speichern ist in diesem Browser nicht verfügbar."); }
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function showToast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  const viewNames = {
    home: "START", tools: "QUICK TOOLS", gaming: "GAMING TOOLS", timers: "MULTI TIMER",
    automation: "AUTOMATION CENTER", appearance: "DESIGN STUDIO", favorites: "FAVORITEN", settings: "EINSTELLUNGEN"
  };
  function setView(view) {
    currentView = view;
    const isHome = view === "home";
    homeSections.forEach(el => el.classList.toggle("hidden", !isHome));
    viewPanel.classList.toggle("hidden", isHome);
    $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view || (view === "settings" && btn.dataset.view === "home")));
    if (!isHome) {
      viewLabel.textContent = viewNames[view] || "BEREICH";
      renderView(view);
      viewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    } else window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function header(title, subtitle) {
    return `<h2 class="view-title">${escapeHTML(title)}</h2><p class="view-subtitle">${escapeHTML(subtitle)}</p>`;
  }
  function favoriteButton(id) {
    const isFav = state.favorites.includes(id);
    return `<button class="mini-button fav" data-favorite="${escapeHTML(id)}" aria-label="${isFav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}">${isFav ? "★" : "☆"}</button>`;
  }
  function renderView(view) {
    const renderers = { tools: renderTools, gaming: renderGaming, timers: renderTimers, automation: renderAutomation, appearance: renderAppearance, favorites: renderFavorites, settings: renderSettings };
    viewContent.innerHTML = (renderers[view] || renderTools)();
  }
  function renderTools() {
    const custom = state.customLinks.map(link => `
      <div class="tool-row"><span class="tool-symbol">↗</span><div class="tool-main"><strong>${escapeHTML(link.title)}</strong><small>${escapeHTML(link.url)}</small></div><div class="tool-actions"><button class="mini-button" data-open-url="${escapeHTML(link.url)}">Öffnen</button><button class="mini-button" data-delete-link="${escapeHTML(link.id)}">×</button></div></div>`).join("");
    return `${header("Quick Tools", "Schnellzugriffe auf häufig genutzte Seiten und Apps. Eigene Links kannst du unten hinzufügen.")}
      <div class="tool-list">
        <div class="tool-row"><span class="tool-symbol">🎮</span><div class="tool-main"><strong>Roblox</strong><small>Spiel oder Roblox-Webseite öffnen</small></div><div class="tool-actions"><button class="mini-button" data-action="roblox">Öffnen</button>${favoriteButton("gaming")}</div></div>
        <div class="tool-row"><span class="tool-symbol">⛏️</span><div class="tool-main"><strong>Minecraft</strong><small>Minecraft-Webseite öffnen</small></div><div class="tool-actions"><button class="mini-button" data-action="minecraft">Öffnen</button>${favoriteButton("gaming")}</div></div>
        <div class="tool-row"><span class="tool-symbol">⏱️</span><div class="tool-main"><strong>Multi Timer</strong><small>Eigene Timer starten und verwalten</small></div><div class="tool-actions"><button class="mini-button" data-view="timers">Öffnen</button>${favoriteButton("timers")}</div></div>
        ${custom}
      </div>
      <h3 class="subhead">Eigenen Schnellzugriff hinzufügen</h3>
      <form id="link-form">
        <div class="form-row"><div class="field"><label for="link-title">Name</label><input id="link-title" maxlength="40" required placeholder="Zum Beispiel Wiki"></div><div class="field"><label for="link-url">Webadresse</label><input id="link-url" required placeholder="https://…" inputmode="url"></div></div>
        <button class="primary-button" type="submit">＋ Schnellzugriff speichern</button>
      </form>
      <p class="view-subtitle" style="margin-top:13px">Hinweis: Diese Buttons öffnen unterstützte Apps oder Webseiten. Sie simulieren keine Berührungen in anderen Apps.</p>`;
  }
  function renderGaming() {
    return `${header("Gaming Tools", "Deine Spielprofile, Notizen und hilfreiche Schnellzugriffe an einem Ort.")}
      <div class="tool-list">
        <div class="tool-row"><span class="tool-symbol">🎮</span><div class="tool-main"><strong>Roblox</strong><small>Webseite öffnen und persönliche Notizen speichern</small></div><div class="tool-actions"><button class="mini-button" data-action="roblox">Öffnen</button>${favoriteButton("gaming")}</div></div>
        <div class="tool-row"><span class="tool-symbol">⛏️</span><div class="tool-main"><strong>Minecraft</strong><small>Webseite und Profilnotizen</small></div><div class="tool-actions"><button class="mini-button" data-action="minecraft">Öffnen</button>${favoriteButton("gaming")}</div></div>
      </div>
      <div class="field"><label for="roblox-note">Roblox-Notizen</label><textarea id="roblox-note" rows="3" placeholder="Deine Spielnotizen, Ziele oder Erinnerungen…">${escapeHTML(state.notes.roblox)}</textarea></div>
      <div class="field"><label for="minecraft-note">Minecraft-Notizen</label><textarea id="minecraft-note" rows="3" placeholder="Mods, Shader, Version oder Ideen…">${escapeHTML(state.notes.minecraft)}</textarea></div>
      <div class="inline-actions"><button class="primary-button" data-action="save-notes">Notizen speichern</button></div>
      <div class="note-box">iOS lässt eine normale Web-App nicht beliebig in Roblox oder Minecraft hineinklicken. Diese Seite organisiert deine Links und Notizen.</div>`;
  }
  function fmt(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    return h ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
  function timerRemaining(t) {
    if (t.running && t.endsAt) return Math.max(0, t.endsAt - Date.now());
    return Math.max(0, t.remaining || 0);
  }
  function renderTimers() {
    const cards = state.timers.map(t => {
      const rem = timerRemaining(t);
      const status = t.running ? "Läuft" : rem === 0 ? "Fertig" : "Pausiert";
      return `<div class="timer-card" data-timer-card="${escapeHTML(t.id)}"><div class="timer-top"><div><div class="timer-name">${escapeHTML(t.name)}</div><small style="color:var(--muted);font-size:10px">${status}</small></div><div class="timer-display" data-timer-display="${escapeHTML(t.id)}">${fmt(rem)}</div></div><div class="timer-controls">${t.running ? `<button class="mini-button" data-timer-pause="${escapeHTML(t.id)}">Pause</button>` : `<button class="mini-button" data-timer-start="${escapeHTML(t.id)}">${rem === 0 ? "Neu starten" : "Start"}</button>`}<button class="mini-button" data-timer-reset="${escapeHTML(t.id)}">Zurücksetzen</button><button class="mini-button" data-timer-delete="${escapeHTML(t.id)}">Löschen</button></div></div>`;
    }).join("");
    return `${header("Multi Timer", "Erstelle mehrere Timer mit eigenen Namen und Zeiten. Timer laufen weiter, solange die Seite geöffnet ist; iOS kann Hintergrundaktivität begrenzen.")}
      <form id="timer-form">
        <div class="field"><label for="timer-name">Timer-Name</label><input id="timer-name" maxlength="40" required placeholder="Zum Beispiel Pause"></div>
        <div class="form-row"><div class="field"><label for="timer-minutes">Minuten</label><input id="timer-minutes" type="number" min="0" max="5999" value="5" required></div><div class="field"><label for="timer-seconds">Sekunden</label><input id="timer-seconds" type="number" min="0" max="59" value="0" required></div></div>
        <button class="primary-button" type="submit">＋ Timer hinzufügen</button>
      </form>
      <h3 class="subhead">Deine Timer</h3>
      <div class="tool-list">${cards || '<div class="empty-state">Noch keine Timer vorhanden.<br>Erstelle oben deinen ersten Timer.</div>'}</div>`;
  }
  function renderAutomation() {
    const items = state.automationItems.map(item => `<div class="tool-row"><span class="tool-symbol">⤴</span><div class="tool-main"><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.detail)}</small></div><div class="tool-actions"><button class="mini-button" data-run-automation="${escapeHTML(item.id)}">Start</button>${favoriteButton("automation")}</div></div>`).join("");
    return `${header("Automation Center", "Organisiere unterstützte Aktionen. Diese Web-App kann keine beliebigen Systemaktionen oder Touches in anderen Apps ausführen.")}
      <div class="note-box">Abläufe in dieser Web-App sind sichere Schnellaktionen. Für systemweite iPhone-Automationen kannst du Apples App „Kurzbefehle“ verwenden.</div>
      <div class="tool-list">${items}</div>
      <h3 class="subhead">Eigene Ablauf-Notiz</h3>
      <form id="automation-form">
        <div class="field"><label for="automation-title">Name des Ablaufs</label><input id="automation-title" maxlength="50" required placeholder="Zum Beispiel Vor dem Spielen"></div>
        <div class="field"><label for="automation-detail">Was soll der Ablauf enthalten?</label><textarea id="automation-detail" maxlength="220" rows="2" required placeholder="Beschreibe die Schritte als Erinnerung…"></textarea></div>
        <button class="primary-button" type="submit">＋ Ablauf-Notiz speichern</button>
      </form>`;
  }
  function renderAppearance() {
    return `${header("Design Studio", "Passe das Aussehen von Multi TaskMaker an. Änderungen werden auf diesem Gerät gespeichert.")}
      <h3 class="subhead">Akzentfarbe</h3>
      <div class="tool-list">
        <button class="tool-row" data-theme="purple"><span class="mode-icon purple">✦</span><span class="tool-main"><strong>Lila & Dunkelblau</strong><small>Klassisches Multi TaskMaker Design</small></span><span>${state.theme === "purple" ? "✓" : ""}</span></button>
        <button class="tool-row" data-theme="blue"><span class="mode-icon blue">✦</span><span class="tool-main"><strong>Neonblau</strong><small>Kühler Gaming-Look</small></span><span>${state.theme === "blue" ? "✓" : ""}</span></button>
        <button class="tool-row" data-theme="neon"><span class="mode-icon teal">✦</span><span class="tool-main"><strong>Neon-Cyan</strong><small>Heller Akzent auf dunklem Hintergrund</small></span><span>${state.theme === "neon" ? "✓" : ""}</span></button>
      </div>
      <h3 class="subhead">Darstellung</h3>
      <label class="switch-row"><span>Kompaktere Kacheln</span><input type="checkbox" id="compact-toggle" ${state.compact ? "checked" : ""}></label>
      <div class="inline-actions"><button class="secondary-button" data-action="reset-settings">Einstellungen zurücksetzen</button></div>
      <p class="view-subtitle">Eigene App-Icons auf dem iPhone hängen davon ab, wie die Web-App zum Home-Bildschirm hinzugefügt wird. Das App-Icon dieser Web-App ist enthalten.</p>`;
  }
  function renderFavorites() {
    const map = [
      ["tools","⚡","Quick Tools","Schnellzugriffe"],["gaming","🎮","Gaming Tools","Spielprofile und Notizen"],
      ["timers","◷","Multi Timer","Timer verwalten"],["automation","⤴","Automation Center","Ablauf-Notizen"],
      ["appearance","✦","Design Studio","Farben und Darstellung"]
    ];
    const favs = map.filter(x => state.favorites.includes(x[0]));
    return `${header("Favoriten", "Lege die Bereiche, die du oft verwendest, hier ab. Über den Stern in den Bereichen kannst du Favoriten ändern.")}
      <div class="favorite-grid">${favs.map(x => `<button class="favorite-tile" data-view="${x[0]}"><span>${x[1]}</span><strong>${x[2]}</strong><small>${x[3]}</small></button>`).join("") || '<div class="empty-state" style="grid-column:1/-1">Noch keine Favoriten. Öffne einen Bereich und tippe auf ☆.</div>'}</div>
      <h3 class="subhead">Favoriten verwalten</h3>
      <div class="tool-list">${map.map(x => `<div class="tool-row"><span class="tool-symbol">${x[1]}</span><div class="tool-main"><strong>${x[2]}</strong><small>${x[3]}</small></div><button class="mini-button fav" data-favorite="${x[0]}">${state.favorites.includes(x[0]) ? "★ Entfernen" : "☆ Hinzufügen"}</button></div>`).join("")}</div>`;
  }
  function renderSettings() {
    return `${header("Einstellungen", "Verwalte deine lokalen Daten und die App-Darstellung.")}
      <div class="tool-list">
        <div class="tool-row"><span class="tool-symbol">💾</span><div class="tool-main"><strong>Lokale Speicherung</strong><small>Favoriten, Notizen und Timer-Listen bleiben in diesem Browser gespeichert.</small></div></div>
        <div class="tool-row"><span class="tool-symbol">📱</span><div class="tool-main"><strong>Zum Home-Bildschirm</strong><small>Nach Veröffentlichung über HTTPS in Safari öffnen → Teilen → „Zum Home-Bildschirm“.</small></div></div>
      </div>
      <div class="inline-actions"><button class="secondary-button" data-action="export-data">Daten exportieren</button><button class="secondary-button" data-action="reset-all">Alle lokalen Daten löschen</button></div>
      <div class="note-box">Die Web-App ist eine lokale Projektversion. Für Installation wie eine Web-App auf dem Home-Bildschirm muss sie über HTTPS veröffentlicht werden.</div>`;
  }
  function applyTheme() {
    document.body.classList.remove("theme-purple","theme-blue","theme-neon");
    document.body.classList.add(`theme-${state.theme || "purple"}`);
    if (state.compact) document.body.classList.add("compact-mode"); else document.body.classList.remove("compact-mode");
  }
  function toggleFavorite(id) {
    if (state.favorites.includes(id)) state.favorites = state.favorites.filter(x => x !== id);
    else state.favorites.push(id);
    saveState(); showToast(state.favorites.includes(id) ? "Zu Favoriten hinzugefügt" : "Aus Favoriten entfernt");
    renderView(currentView);
  }
  function openTarget(target) {
    const urls = { roblox: "https://www.roblox.com/", minecraft: "https://www.minecraft.net/" };
    const url = urls[target];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }
  function runAutomation(id) {
    const item = state.automationItems.find(x => x.id === id);
    if (!item) return;
    if (item.kind === "app") openTarget(item.target);
    else if (item.kind === "note" && item.target === "minecraft") {
      setView("gaming");
      setTimeout(() => $("#minecraft-note")?.focus(), 100);
    } else {
      showToast(`Ablauf-Notiz: ${item.title}`);
    }
  }
  function createTimer(name, seconds) {
    const t = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), name, duration: seconds * 1000, remaining: seconds * 1000, running: false, endsAt: null };
    state.timers.push(t); saveState(); renderView("timers"); showToast("Timer hinzugefügt");
  }
  function updateTimer(id, action) {
    const t = state.timers.find(x => x.id === id);
    if (!t) return;
    if (action === "start") {
      if (timerRemaining(t) <= 0) t.remaining = t.duration;
      t.running = true; t.endsAt = Date.now() + timerRemaining(t);
    } else if (action === "pause") {
      t.remaining = timerRemaining(t); t.running = false; t.endsAt = null;
    } else if (action === "reset") {
      t.running = false; t.endsAt = null; t.remaining = t.duration;
    } else if (action === "delete") {
      state.timers = state.timers.filter(x => x.id !== id);
    }
    saveState(); renderView("timers");
  }
  function tickTimers() {
    if (currentView !== "timers") return;
    state.timers.forEach(t => {
      if (t.running && timerRemaining(t) <= 0) {
        t.running = false; t.remaining = 0; t.endsAt = null; saveState();
        showToast(`Timer fertig: ${t.name}`);
      }
      const display = $(`[data-timer-display="${CSS.escape(t.id)}"]`);
      if (display) display.textContent = fmt(timerRemaining(t));
    });
  }
  document.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.view) { setView(target.dataset.view); return; }
    if (target.dataset.favorite) { toggleFavorite(target.dataset.favorite); return; }
    if (target.dataset.action) {
      const action = target.dataset.action;
      if (action === "roblox" || action === "minecraft") openTarget(action);
      else if (action === "save-notes") {
        state.notes.roblox = $("#roblox-note")?.value || "";
        state.notes.minecraft = $("#minecraft-note")?.value || "";
        saveState(); showToast("Notizen gespeichert");
      } else if (action === "reset-settings") {
        state.theme = "purple"; state.compact = false; saveState(); applyTheme(); renderView("appearance"); showToast("Design zurückgesetzt");
      } else if (action === "export-data") {
        const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
        const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "multitaskmaker-daten.json"; a.click(); URL.revokeObjectURL(url); showToast("Export vorbereitet");
      } else if (action === "reset-all") {
        if (confirm("Alle lokal gespeicherten Multi TaskMaker-Daten löschen?")) {
          localStorage.removeItem(STORAGE_KEY); state = structuredClone(defaults); applyTheme(); setView("home"); showToast("Lokale Daten gelöscht");
        }
      }
      return;
    }
    if (target.dataset.openUrl) { const url = safeURL(target.dataset.openUrl); if (url) window.open(url, "_blank", "noopener,noreferrer"); return; }
    if (target.dataset.deleteLink) { state.customLinks = state.customLinks.filter(x => x.id !== target.dataset.deleteLink); saveState(); renderView("tools"); showToast("Schnellzugriff gelöscht"); return; }
    if (target.dataset.theme) { state.theme = target.dataset.theme; saveState(); applyTheme(); renderView("appearance"); showToast("Design geändert"); return; }
    if (target.dataset.runAutomation) { runAutomation(target.dataset.runAutomation); return; }
    for (const action of ["start","pause","reset","delete"]) {
      const key = `timer${action[0].toUpperCase()}${action.slice(1)}`;
      if (target.dataset[key]) { updateTimer(target.dataset[key], action); return; }
    }
  });
  document.addEventListener("submit", event => {
    event.preventDefault();
    if (event.target.id === "link-form") {
      const title = $("#link-title").value.trim();
      const url = safeURL($("#link-url").value.trim());
      if (!title || !url) { showToast("Bitte Name und gültige Webadresse eingeben."); return; }
      state.customLinks.push({id: String(Date.now()), title, url}); saveState(); renderView("tools"); showToast("Schnellzugriff gespeichert");
    } else if (event.target.id === "timer-form") {
      const name = $("#timer-name").value.trim();
      const minutes = Number($("#timer-minutes").value), seconds = Number($("#timer-seconds").value);
      if (!name || !Number.isFinite(minutes) || !Number.isFinite(seconds) || minutes < 0 || seconds < 0 || seconds > 59 || minutes > 5999 || minutes * 60 + seconds <= 0) { showToast("Gib einen Namen und eine Zeit größer als 0 ein."); return; }
      createTimer(name, Math.floor(minutes * 60 + seconds));
    } else if (event.target.id === "automation-form") {
      const title = $("#automation-title").value.trim(), detail = $("#automation-detail").value.trim();
      if (!title || !detail) return;
      state.automationItems.push({id:String(Date.now()), title, detail, kind:"note"});
      saveState(); renderView("automation"); showToast("Ablauf-Notiz gespeichert");
    }
  });
  document.addEventListener("change", event => {
    if (event.target.id === "compact-toggle") {
      state.compact = event.target.checked; saveState(); applyTheme(); showToast("Darstellung gespeichert");
    }
  });
  $("#open-settings").addEventListener("click", () => setView("settings"));
  $("#back-home").addEventListener("click", () => setView("home"));
  function safeURL(raw) {
    try { const u = new URL(raw); return ["https:","http:"].includes(u.protocol) ? u.href : null; } catch { return null; }
  }
  applyTheme();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
  setInterval(tickTimers, 250);
})();