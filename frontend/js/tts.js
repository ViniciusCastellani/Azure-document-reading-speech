document.getElementById('ttsRun').addEventListener('click', async () => {
  const btn = document.getElementById('ttsRun');
  const resultEl = document.getElementById('ttsResult');
  const text = document.getElementById('ttsText').value.trim();
  if (!text) {
    renderError(resultEl, 'digite um texto antes de gerar o áudio');
    return;
  }
  btn.disabled = true;
  setLoading(resultEl, '// gerando áudio…');

  const payload = {
    text,
    locale: document.getElementById('ttsLocale').value.trim() || 'pt-BR',
    voice: document.getElementById('ttsVoice').value.trim() || 'pt-BR-FranciscaNeural'
  };

  try {
    const res = await timedFetch('POST', '/api/speech/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let message = 'erro ao gerar áudio';
      try { const data = await res.json(); message = data.error || message; } catch {}
      renderError(resultEl, message);
    } else {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      resultEl.innerHTML = '';

      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = url;
      resultEl.appendChild(audio);

      const link = document.createElement('a');
      link.className = 'download-link';
      link.href = url;
      link.download = 'saida.mp3';
      link.textContent = 'baixar saida.mp3';
      resultEl.appendChild(link);
    }
  } catch (e) {
    renderError(resultEl, 'falha de conexão com o gateway');
  } finally {
    btn.disabled = false;
  }
});