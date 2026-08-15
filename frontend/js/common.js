const BASE_URL = 'http://localhost:3000';

// ---------- request console (signature element, present on every page) ----------
const consoleBody = document.getElementById('consoleBody');
let logHasEntries = false;

function logRequest(method, path, statusOrLabel, ok, durationMs) {
  if (!consoleBody) return;
  if (!logHasEntries) {
    consoleBody.innerHTML = '';
    logHasEntries = true;
  }
  const line = document.createElement('div');
  line.className = 'line';
  const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  const statusClass = ok === null ? '' : (ok ? 'ok' : 'err');
  line.innerHTML = `<span class="t">${time}</span><span class="method">${method}</span><span class="path">${path}</span><span class="status-code ${statusClass}">${statusOrLabel}${durationMs != null ? ' · ' + durationMs + 'ms' : ''}</span>`;
  consoleBody.appendChild(line);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

const clearLogBtn = document.getElementById('clearLog');
if (clearLogBtn) {
  clearLogBtn.addEventListener('click', () => {
    consoleBody.innerHTML = '<div class="empty">// nenhuma requisição ainda — as chamadas HTTP feitas por esta página aparecem aqui</div>';
    logHasEntries = false;
  });
}

async function timedFetch(method, path, options) {
  const start = performance.now();
  logRequest(method, path, 'pending…', null, null);
  try {
    const res = await fetch(BASE_URL + path, options);
    const duration = Math.round(performance.now() - start);
    logRequest(method, path, res.status, res.ok, duration);
    return res;
  } catch (e) {
    const duration = Math.round(performance.now() - start);
    logRequest(method, path, 'network error', false, duration);
    throw e;
  }
}

// ---------- health check pill (present on every page) ----------
async function checkHealth() {
  const dot = document.getElementById('healthDot');
  const text = document.getElementById('healthText');
  if (!dot || !text) return;
  dot.className = 'dot pending';
  text.textContent = 'verificando…';
  try {
    const res = await timedFetch('GET', '/api/health');
    if (res.ok) {
      dot.className = 'dot ok';
      text.textContent = 'gateway online';
    } else {
      dot.className = 'dot err';
      text.textContent = 'erro (' + res.status + ')';
    }
  } catch {
    dot.className = 'dot err';
    text.textContent = 'gateway inacessível';
  }
}
checkHealth();

// ---------- shared render helpers ----------
function renderError(el, message) {
  el.innerHTML = `<div class="err-text">✕ ${message}</div>`;
}

function setLoading(el, label) {
  el.innerHTML = `<div class="placeholder">${label}</div>`;
}

// ---------- shared dropzone wiring ----------
function setupDropzone(dropId, inputId, fnameId, onFile) {
  const drop = document.getElementById(dropId);
  const input = document.getElementById(inputId);
  const fname = document.getElementById(fnameId);

  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });

  ['dragenter', 'dragover'].forEach(evt =>
    drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add('drag'); })
  );
  ['dragleave', 'drop'].forEach(evt =>
    drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.remove('drag'); })
  );
  drop.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      handleChange();
    }
  });
  input.addEventListener('change', handleChange);

  function handleChange() {
    const file = input.files[0];
    fname.textContent = file ? file.name : '';
    onFile(file || null);
  }
}