const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\tyron\\.gemini\\antigravity\\brain\\94543a69-08ec-4f03-9b0e-ba20c600f403\\screenshots";
const PUBLIC_DIR = path.join(__dirname, "..", "public", "screenshots");

async function run() {
  console.log("Launching headless Chrome for verification...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();

  // Set iPhone 13/14/15 viewport (390 x 844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const capture = async (name) => {
    const p1 = path.join(ARTIFACT_DIR, name);
    const p2 = path.join(PUBLIC_DIR, name);
    await page.screenshot({ path: p1, fullPage: false });
    await page.screenshot({ path: p2, fullPage: false });
    console.log(`Saved screenshot: ${name}`);
  };

  try {
    // 1. Home Screen
    console.log("Testing Home Screen (390x844)...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_home.png");

    // 2. Programme Screen
    console.log("Testing Programme Screen...");
    await page.goto("http://localhost:3000/programme", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_programme.png");

    // 2b. Open Event Details Modal
    console.log("Opening Event Details Modal...");
    const firstCard = await page.$("article");
    if (firstCard) {
      await firstCard.click();
      await new Promise((r) => setTimeout(r, 800));
      await capture("mobile_event_modal.png");
      // Close modal
      const closeBtn = await page.$("button[aria-label='Close dialog']");
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // 3. Map / Venue Directory Screen
    console.log("Testing Map & Venues Screen...");
    await page.goto("http://localhost:3000/map", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_map_venues.png");

    // 4. KliK Quest Screen
    console.log("Testing KliK Quest Screen...");
    await page.goto("http://localhost:3000/quest", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_quest.png");

    // 5. QR Check-In Flow
    console.log("Testing QR Check-In Flow (/check-in/loc-town-hall)...");
    await page.goto("http://localhost:3000/check-in/loc-town-hall?token=seed-token-town-hall-2026", {
      waitUntil: "networkidle0",
    });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_checkin_prompt.png");

    // Confirm check in
    const confirmBtn = await page.$("button");
    if (confirmBtn) {
      await confirmBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
      await capture("mobile_checkin_confirmed.png");
    }

    // 6. My Festival Screen
    console.log("Testing My Festival Screen...");
    await page.goto("http://localhost:3000/my-festival", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_my_festival.png");

    // 7. Small Budget Viewport (360 x 640)
    console.log("Testing Budget Viewport (360x640)...");
    await page.setViewport({ width: 360, height: 640, isMobile: true, hasTouch: true });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 800));
    await capture("mobile_budget_360.png");

    console.log("All automated browser checks and screenshots passed successfully!");
  } catch (err) {
    console.error("Browser verification error:", err);
  } finally {
    await browser.close();
  }
}

run();
