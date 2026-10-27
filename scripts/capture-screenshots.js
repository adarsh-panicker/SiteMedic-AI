const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outDir = path.resolve(__dirname, "../public/screenshots");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function findButtonByText(page, text) {
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const content = await page.evaluate((el) => el.textContent, b);
    if (content && content.includes(text)) {
      return b;
    }
  }
  return null;
}

async function capture() {
  console.log("Launching Edge via puppeteer-core...");
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1200, height: 800 },
  });

  const page = await browser.newPage();

  // 1. Landing Page
  console.log("Capturing 01-landing-page.png...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(outDir, "01-landing-page.png") });

  // 2. Scan Results (Demo)
  console.log("Capturing 02-demo-audit-results.png...");
  await page.goto("http://localhost:3000/scan?demo=true", { waitUntil: "networkidle0" });
  await page.waitForSelector("h1", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, "02-demo-audit-results.png") });

  // 3. Expand first issue and open Repair Lab
  console.log("Opening issue in Repair Lab...");
  const firstCardButton = await page.$(".card button");
  if (firstCardButton) {
    await firstCardButton.click();
    await new Promise((r) => setTimeout(r, 800));
  }

  const openRepairBtn = await findButtonByText(page, "Open in Repair Lab");
  if (openRepairBtn) {
    await Promise.all([
      openRepairBtn.click(),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);
  } else {
    await page.goto("http://localhost:3000/repair-lab", { waitUntil: "networkidle0" });
  }

  await new Promise((r) => setTimeout(r, 1000));
  console.log("Capturing 03-repair-lab-workspace.png...");
  await page.screenshot({ path: path.join(outDir, "03-repair-lab-workspace.png") });

  // 4. Generate Fix
  console.log("Clicking Generate Fix...");
  const generateBtn = await findButtonByText(page, "Generate Fix");
  if (generateBtn) {
    await generateBtn.click();
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("Capturing 04-repair-lab-diff.png...");
  await page.screenshot({ path: path.join(outDir, "04-repair-lab-diff.png") });

  // 5. Workflow Tab
  console.log("Switching to Workflow tab...");
  const workflowTab = await findButtonByText(page, "Workflow");
  if (workflowTab) {
    await workflowTab.click();
    await new Promise((r) => setTimeout(r, 800));
  }
  console.log("Capturing 05-repair-lab-workflow.png...");
  await page.screenshot({ path: path.join(outDir, "05-repair-lab-workflow.png") });

  // 6. Settings Page
  console.log("Capturing 06-settings-nebius.png...");
  await page.goto("http://localhost:3000/settings", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, "06-settings-nebius.png") });

  // 7. Dashboard Overview
  console.log("Capturing 07-dashboard.png...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, "07-dashboard.png") });

  await browser.close();
  console.log("All screenshots captured successfully in 3:2 ratio (1200x800)!");
}

capture().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
