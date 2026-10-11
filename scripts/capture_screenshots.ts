import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(process.cwd(), 'Document', 'screenshots');

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureAllScreenshots() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('[Screenshots] Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1920,1080',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  try {
    console.log('[Screenshots] Loading http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(2000);

    // 01. Landing Page
    console.log('[Screenshots] 01_landing_page.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('public-home');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01_landing_page.png') });

    // 02. Trainee Dashboard
    console.log('[Screenshots] 02_trainee_dashboard.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('student-dashboard');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02_trainee_dashboard.png') });

    // 03. Surgical Stations Catalog
    console.log('[Screenshots] 03_stations_catalog.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('stations');
    });
    await sleep(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03_stations_catalog.png') });

    // 04. Real-Time Workspace
    console.log('[Screenshots] 04_realtime_workspace.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('workspace', 'stn_interrupted_suture');
    });
    await sleep(2000);

    // Switch to clinical suture video feed so live suture kinematics & calipers show up
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const videoBtn = buttons.find(
        (b) =>
          b.textContent?.includes('Use Clinical Suture Video') ||
          b.textContent?.includes('Mattress Stitch Video') ||
          b.textContent?.includes('Recorded Suture Video')
      );
      if (videoBtn) (videoBtn as HTMLElement).click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_realtime_workspace.png') });

    // 05. Attempt Report Overview
    console.log('[Screenshots] 05_attempt_report_overview.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('attempt-detail', 'att_chen_interrupted_001');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05_attempt_report_overview.png') });

    // 06. Attempt Report - Parameters Tab
    console.log('[Screenshots] 06_attempt_report_parameters.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const paramTab = buttons.find((b) => b.textContent?.includes('Expected vs Observed Parameters'));
      if (paramTab) (paramTab as HTMLElement).click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_attempt_report_parameters.png') });

    // 07. Attempt Report - Checklist Tab
    console.log('[Screenshots] 07_attempt_report_checklist.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const chkTab = buttons.find((b) => b.textContent?.includes('OSATS Step Checklist'));
      if (chkTab) (chkTab as HTMLElement).click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07_attempt_report_checklist.png') });

    // 08. Attempt Report - Deviations Tab
    console.log('[Screenshots] 08_attempt_report_deviations.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const errTab = buttons.find((b) => b.textContent?.includes('Identified Technical Deviations'));
      if (errTab) (errTab as HTMLElement).click();
    });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08_attempt_report_deviations.png') });

    // 09. Attempt Report - Gemini Coach Tab
    console.log('[Screenshots] 09_attempt_report_gemini_coach.png...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const aiTab = buttons.find((b) => b.textContent?.includes('Gemini Clinical Reasoning Coach'));
      if (aiTab) (aiTab as HTMLElement).click();
    });
    await sleep(800);
    // Click sample question
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const promptBtn = buttons.find((b) => b.textContent?.includes('Why does 71° entry cause'));
      if (promptBtn) (promptBtn as HTMLElement).click();
    });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_attempt_report_gemini_coach.png') });

    // 10. Faculty Review Console
    console.log('[Screenshots] 10_faculty_review_console.png...');
    await page.evaluate(() => {
      (window as any).__switchRole('FACULTY');
      (window as any).__navigateToView('faculty-dashboard', 'att_chen_interrupted_001');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '10_faculty_review_console.png') });

    // 11. Digital OSCE Examination
    console.log('[Screenshots] 11_digital_osce_station.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('osce');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11_digital_osce_station.png') });

    // 12. Clinical Lead Analytics & PRMs
    console.log('[Screenshots] 12_clinical_lead_analytics.png...');
    await page.evaluate(() => {
      (window as any).__switchRole('CLINICAL_LEAD');
      (window as any).__navigateToView('clinical-lead');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12_clinical_lead_analytics.png') });

    // 13. Cohort Management
    console.log('[Screenshots] 13_cohort_management.png...');
    await page.evaluate(() => {
      (window as any).__switchRole('INSTITUTION_ADMIN');
      (window as any).__navigateToView('cohort-management');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13_cohort_management.png') });

    // 14. Device Integrations
    console.log('[Screenshots] 14_device_integrations.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('integrations');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14_device_integrations.png') });

    // 15. Admin Diagnostics & Audit Logs
    console.log('[Screenshots] 15_admin_diagnostics.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('diagnostics');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15_admin_diagnostics.png') });

    // 16. Documentation & Concept Guide
    console.log('[Screenshots] 16_documentation_features.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('docs');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '16_documentation_features.png') });

    // 17. Clinical Reference Standards Guide
    console.log('[Screenshots] 17_clinical_reference.png...');
    await page.evaluate(() => {
      (window as any).__navigateToView('help');
    });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '17_clinical_reference.png') });

    console.log('[Screenshots] SUCCESS! All 17 screenshots captured.');
  } catch (err) {
    console.error('[Screenshots] Capture failed:', err);
  } finally {
    await browser.close();
  }
}

captureAllScreenshots().catch(console.error);
