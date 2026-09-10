const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CONV_ID = "f45a519d-69f9-4f90-9d41-3ff3ea4e6ab4";
const ARTIFACT_DIR = path.join("C:\\Users\\tyron\\.gemini\\antigravity\\brain", CONV_ID, "screenshots");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "screenshots");

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function run() {
  console.log("Launching headless Chrome for verification...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const capture = async (name) => {
    const p1 = path.join(ARTIFACT_DIR, name);
    const p2 = path.join(PUBLIC_DIR, name);
    await page.screenshot({ path: p1, fullPage: false });
    await page.screenshot({ path: p2, fullPage: false });
    console.log(`Saved screenshot: ${name}`);
  };

  try {
    // 1. Home Screen (Top Hero with Official Logo & Coastal Landscape)
    console.log("Testing Home Screen (Top Hero)...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_home.png");

    // 2. Home Screen - Scroll to Youth Spotlight & Gallery
    console.log("Testing Home Screen (Youth Spotlight & Posters)...");
    await page.evaluate(() => window.scrollBy(0, 450));
    await new Promise((r) => setTimeout(r, 600));
    await capture("mobile_youth_spotlight.png");

    // 3. Open Artwork Lightbox Modal
    console.log("Opening Artwork Lightbox Modal...");
    const posterContainer = await page.$("section:last-of-type div.relative.cursor-pointer");
    if (posterContainer) {
      await posterContainer.click();
      await new Promise((r) => setTimeout(r, 800));
      await capture("mobile_artwork_modal.png");
      // Close modal
      const closeBtn = await page.$("button[aria-label='Close artwork preview']");
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // 4. Programme Screen (Header with Emblem)
    console.log("Testing Programme Screen...");
    await page.goto("http://localhost:3000/programme", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_programme.png");

    // 5. Programme Screen with Youth Filter
    console.log("Testing Programme Screen with Youth Filter...");
    await page.goto("http://localhost:3000/programme?category=youth", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_programme_youth.png");

    // 6. KliK Quest Screen (Medallion & Trail)
    console.log("Testing KliK Quest Screen...");
    await page.goto("http://localhost:3000/quest", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_quest.png");

    // 7. QR Check-In Flow (Checkpoint Stamp)
    console.log("Testing QR Check-In Flow (/check-in/loc-town-hall)...");
    await page.goto("http://localhost:3000/check-in/loc-town-hall?token=seed-token-town-hall-2026", {
      waitUntil: "networkidle0",
    });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_checkin.png");

    // 8. My Festival Screen
    console.log("Testing My Festival Screen...");
    await page.goto("http://localhost:3000/my-festival", { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1000));
    await capture("mobile_my_festival.png");

    console.log("All screenshots captured successfully!");
  } catch (err) {
    console.error("Browser verification error:", err);
  } finally {
    await browser.close();
  }
}

run();
