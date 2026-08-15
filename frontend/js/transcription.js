let sttFile = null;
setupDropzone('sttDrop', 'sttFile', 'sttFname', (file) => {
  sttFile = file;
  document.getElementById('sttRun').disabled = !file;
});

document.getElementById('sttRun').addEventListener('click', async () => {
  if (!sttFile) return;
  const btn = document.getElementById('sttRun');
  const resultEl = document.getElementById('sttResult');
  btn.disabled = true;
  setLoading(resultEl, '// transcrevendo áudio…');

  const form = new FormData();
  form.append('audio', sttFile);
  const locales = document.getElementById('sttLocales').value.trim();
  if (locales) form.append('locales', locales);

  try {
    const res = await timedFetch('POST', '/api/speech/fast-transcription', { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) {
      renderError(resultEl, data.error || 'erro ao transcrever áudio');
    } else {
      resultEl.innerHTML = '';

      const transcript = document.createElement('div');
      transcript.className = 'transcript-text';
      transcript.textContent = data.combinedPhrases?.map(p => p.text).join(' ') || '(sem texto reconhecido)';
      resultEl.appendChild(transcript);

      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'ver resposta completa (JSON)';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(data, null, 2);
      details.appendChild(summary);
      details.appendChild(pre);
      resultEl.appendChild(details);
    }
  } catch (e) {
    renderError(resultEl, 'falha de conexão com o gateway');
  } finally {
    btn.disabled = false;
  }
});