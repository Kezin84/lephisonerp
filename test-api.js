import https from 'https';

const API_KEY = 'VxCgNvLTE.ChthcGlrZXktMjAyNjEwMDUyMTA2MjEtN2ZzOW0Q-5_rmAsYAiCfgOwtKhAaV-B60txBRYBHBOtS7fGX.3anjjKeiObCad8KG5EhozRtIuoD2U-BFpSMbkg0T_HZW4vy4gHGiyyx5DjmiJrkVDu0bG_oO8PuNQmGsOS12HweZ';

const data = JSON.stringify({
  model: 'deepseek-v4-pro-ga-260813',
  messages: [
    { role: 'system', content: 'You are a test assistant' },
    { role: 'user', content: 'Say hello' }
  ]
});

const options = {
  hostname: 'ark.ap-southeast.bytepluses.com',
  path: '/api/v3/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${responseBody}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
