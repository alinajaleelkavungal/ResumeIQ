const http = require('http');

const data = JSON.stringify({
  candidateId: "cmsxjmk7c0013tkuootxyljzb",
  age: "21",
  sector: "IT",
  category: "Software Developer",
  yearsOfExperience: "Fresher"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/candidate/finalize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
