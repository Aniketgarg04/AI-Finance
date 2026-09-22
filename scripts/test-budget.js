const axios = require('axios');

async function run() {
  try {
    // 1. Register a user
    const ts = Date.now();
    const email = `test${ts}@example.com`;
    const password = 'Password123!';
    
    console.log(`Registering user ${email}...`);
    let res = await axios.post('http://localhost:3001/auth/register', {
      email,
      password,
      name: 'Test User'
    });
    console.log('Register response:', res.data);

    // 2. Login
    console.log(`Logging in...`);
    res = await axios.post('http://localhost:3001/auth/login', {
      email,
      password
    });
    const token = res.data.access_token;
    console.log('Login token:', token);

    // 3. Create Budget
    console.log(`Creating budget...`);
    res = await axios.post('http://localhost:3001/budgets', {
      category: 'Food',
      limit: 5000,
      month: 5,
      year: 2026
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Create Budget response:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

run();
