function renderJson(el, data) {
  const pre = document.createElement('pre');
  pre.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  el.innerHTML = '';
  el.appendChild(pre);
}

let visionFile = null;
setupDropzone('visionDrop', 'visionFile', 'visionFname', (file) => {
  visionFile = file;
  document.getElementById('visionRun').disabled = !file;
});

document.getElementById('visionRun').addEventListener('click', async () => {
  if (!visionFile) return;
  const btn = document.getElementById('visionRun');
  const resultEl = document.getElementById('visionResult');
  btn.disabled = true;
  setLoading(resultEl, '// analisando documento — isso pode levar 10 a 20s…');

  const form = new FormData();
  form.append('file', visionFile);

  try {
    const res = await timedFetch('POST', '/api/vision/document-intelligence', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) {
      renderError(resultEl, data.error || 'erro ao analisar o documento');
    } else {
      const content = data?.analyzeResult?.content ?? data;
      renderJson(resultEl, content);
    }
  } catch (e) {
    renderError(resultEl, 'falha de conexão com o gateway');
  } finally {
    btn.disabled = false;
  }
});