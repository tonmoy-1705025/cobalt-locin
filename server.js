const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
