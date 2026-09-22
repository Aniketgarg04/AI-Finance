const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('api-out.log', 'a');
const err = fs.openSync('api-err.log', 'a');

const child = spawn('npm', ['run', 'dev:api'], {
  cwd: 'c:\\Users\\LENOVO\\OneDrive\\Desktop\\AI Finance',
  detached: true,
  stdio: [ 'ignore', out, err ]
});

child.unref();
console.log('Started api in background');
