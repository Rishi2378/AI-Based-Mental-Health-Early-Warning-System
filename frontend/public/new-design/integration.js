(() => {
  const paths = {
    dashboard: '/new-design/home.html', home: '/new-design/home.html',
    'text-nlp': '/new-design/home.html#nlp-playground',
    'assessment-wizard': '/new-design/assessment.html', questionnaire: '/new-design/assessment.html',
    'voice-lab': '/new-design/voice.html', history: '/history', 'model-stats': '/dashboard', about: '/about'
  };
  document.querySelectorAll('a[data-path]').forEach((link) => {
    link.href = paths[link.dataset.path] || '/new-design/home.html';
  });

  const message = (text, error = false) => {
    let node = document.getElementById('backend-feedback');
    if (!node) {
      node = document.createElement('div');
      node.id = 'backend-feedback';
      node.setAttribute('role', 'status');
      node.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:1000;max-width:420px;padding:14px 18px;border-radius:14px;color:#f8fafc;background:' + (error ? '#7f1d1d' : '#0f3f48') + ';box-shadow:0 8px 30px #0008;font:14px system-ui';
      document.body.appendChild(node);
    }
    node.textContent = text;
  };
  const request = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'The analysis request failed.');
    return data;
  };

  const textButton = document.getElementById('btn-analyze');
  if (textButton) textButton.addEventListener('click', async (event) => {
    event.stopImmediatePropagation();
    const input = document.getElementById('nlp-input');
    textButton.disabled = true;
    try {
      const result = await request('/api/text/analyze', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({text: input.value}) });
      const score = Math.round(result.stress_indicator || 0);
      const scoreNode = document.getElementById('tension-score');
      if (scoreNode) scoreNode.textContent = score;
      const badge = document.getElementById('classification-badge');
      if (badge) badge.textContent = result.is_crisis ? 'Elevated Distress' : `${result.emotion || result.sentiment} · ${result.sentiment || 'Analysis complete'}`;
      const affect = document.getElementById('affect-label');
      if (affect) affect.textContent = `${result.emotion || 'Emotion'} · ${result.sentiment || 'Sentiment'} · ${Math.round((result.confidence || 0) * 100)}% confidence`;
      [1, 2].forEach((n) => { const bar = document.getElementById(`prob-bar-${n}`); if (bar) bar.style.width = `${score}%`; });
      message(result.is_crisis ? 'The analysis flagged crisis language. Please use the crisis support information on this page.' : 'Text analysis completed using the MindGuard backend.');
    } catch (error) { message(error.message, true); }
    finally { textButton.disabled = false; }
  }, true);

  const assessmentButton = document.getElementById('calculate-btn');
  if (assessmentButton) assessmentButton.addEventListener('click', async (event) => {
    event.stopImmediatePropagation();
    const text = document.getElementById('journal-input')?.value || '';
    try {
      const textResult = await request('/api/text/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}) });
      const saved = await request('/api/assessment/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text_result:textResult, raw_text_sample:text}) });
      const summary = document.getElementById('result-summary-card');
      if (summary) { summary.classList.remove('hidden'); summary.scrollIntoView({behavior:'smooth',block:'nearest'}); }
      message(`Assessment ${saved.assessment_id} saved. Overall indicator: ${Math.round(saved.fusion_result.overall_score)}.`);
    } catch (error) { message(error.message, true); }
  }, true);

  const fileInput = document.getElementById('audio-file-input');
  if (fileInput) fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const form = new FormData(); form.append('audio', file);
    try {
      const result = await request('/api/voice/analyze', {method:'POST', body:form});
      message(`Voice analysis complete: ${result.emotion || 'processed'} · ${Math.round((result.confidence || 0) * 100)}% confidence.`);
      const state = document.getElementById('record-label'); if (state) state.textContent = 'Voice Analysis Complete';
    } catch (error) { message(error.message, true); }
  });
})();
