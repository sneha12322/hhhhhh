(async () => {
  try {
    const r = await fetch('http://localhost:3000/api/health');
    console.log('status', r.status);
    const body = await r.text();
    console.log('body', body.slice(0, 200));
  } catch (e) {
    console.error('error', e.message);
  }
})();