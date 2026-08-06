import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  const takeScreenshot = async (name, width, height, colorScheme, selector) => {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme });
    const page = await context.newPage();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const el = selector ? await page.$(selector) : page;
    await el.screenshot({ path: name });
    await context.close();
  };

  // 1. Header close-up on desktop dark mode
  await takeScreenshot('screenshot_header_dark_1440.png', 1440, 900, 'dark', 'header');
  // 2. Header close-up on desktop light mode
  await takeScreenshot('screenshot_header_light_1440.png', 1440, 900, 'light', 'header');
  // 3. Header on 390px mobile
  await takeScreenshot('screenshot_header_dark_390.png', 390, 844, 'dark', 'header');
  // 4. Footer brand area on desktop dark mode
  await takeScreenshot('screenshot_footer_dark_1440.png', 1440, 900, 'dark', 'footer');
  // 5. Footer brand area on mobile
  await takeScreenshot('screenshot_footer_dark_390.png', 390, 844, 'dark', 'footer');

  await browser.close();
})();
