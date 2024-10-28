const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Go to the login page
    const url = 'https://cobalt.reebelo.com/login';
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Fill in the login form
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'tonmoyroy5885+1@gmail.com'); // Replace with your email

    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', 'raf$2024$'); // Replace with your password

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Take a screenshot after logging in
    await page.screenshot({ path: 'screenshot.png' });
    console.log('Screenshot taken.');

    // Check if login was successful
    const title = await page.title();
    console.log(`Page Title after login: ${title}`);

    // Get cookies after login to find the access token
    const cookies = await page.cookies();

    // Save cookies to a JSON file
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    console.log('Cookies saved to cookies.json.');

    const accessTokenCookie = cookies.find(cookie => 
        cookie.name.includes('.accessToken')
      );
    
    if (accessTokenCookie) {
    console.log('Access Token:', accessTokenCookie.value);
    } else {
    console.log('Access Token not found.');
    }

    // Close the browser
    await browser.close();
})();
