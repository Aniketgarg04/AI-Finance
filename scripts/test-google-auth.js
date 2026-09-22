const http = require('http');

http.get('http://localhost:3001/auth/google', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
