(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '2607mray@gmail.com' }),
    });
    console.log('status', res.status);
    console.log('body', await res.text());
  } catch (err) {
    console.error('error', err);
  }
})();