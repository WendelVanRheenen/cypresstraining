const response = await fetch('http://localhost:3333/api/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'admin', password: 'admin' }),
});

if (!response.ok) {
  const body = await response.text();
  console.error('Reset failed:', response.status, body);
  process.exit(1);
}

const data = await response.json();
console.log('Reset done:', data.status);
