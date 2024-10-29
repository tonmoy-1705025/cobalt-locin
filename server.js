const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve an HTML page at the root
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Login Page</title></head>
      <body>
        <h1>Login Page</h1>
        <form id="login-form">
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <script>
          document.getElementById('login-form').onsubmit = async function(e) {
            e.preventDefault();
            const username = this.username.value;
            const password = this.password.value;
            const response = await fetch('/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            alert(JSON.stringify(result));
          }
        </script>
      </body>
    </html>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
    const page = await browser.newPage();

    const url = 'https://cobalt.reebelo.com/login';
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', username);

    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', password);

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const cookies = await page.cookies();
    const accessTokenCookie = cookies.find(cookie => cookie.name.includes('.accessToken'));

    await browser.close();

    if (accessTokenCookie) {
      res.json({ accessToken: accessTokenCookie.value });
    } else {
      res.status(401).json({ error: 'Login failed. Access token not found.' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
