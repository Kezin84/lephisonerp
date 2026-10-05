import https from 'https';

const options = {
  hostname: 'ark.ap-southeast.bytepluses.com',
  path: '/api/v3/chat/completions',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
