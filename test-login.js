const https = require('https'); 
const data = JSON.stringify({ phone: '9999999999', password: 'admin123' });
 
const options = {
  hostname: 'localapp-backend.onrender.com',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
 
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});
 
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
