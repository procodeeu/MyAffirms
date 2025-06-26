const { test, expect } = require('@playwright/test');

test('should display correct build version on landing page after deployment', async ({ page }) => {
  // Read the current build version from the local file
  const fs = require('fs');
  const versionFile = './utils/version.js';
  const versionContent = fs.readFileSync(versionFile, 'utf8');
  const versionMatch = versionContent.match(/BUILD_VERSION = '([^']+)'/);
  
  if (!versionMatch) {
    throw new Error('Could not extract BUILD_VERSION from utils/version.js');
  }
  
  const expectedVersion = versionMatch[1];
  console.log(`Expected version: ${expectedVersion}`);
  
  // Navigate to the production landing page
  const prodUrl = 'https://my-affirms.web.app/landing';
  await page.goto(prodUrl);
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Take a full page screenshot for deployment verification
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `test-results/deployment-${expectedVersion}-${timestamp}.png`;
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true 
  });
  console.log(`📸 Full page screenshot saved: ${screenshotPath}`);
  
  // Look for the version display element
  const versionElement = page.locator('text=Build:');
  await expect(versionElement).toBeVisible();
  
  // Take a focused screenshot of the version area
  const versionScreenshotPath = `test-results/version-${expectedVersion}-${timestamp}.png`;
  await versionElement.screenshot({ 
    path: versionScreenshotPath 
  });
  console.log(`📸 Version screenshot saved: ${versionScreenshotPath}`);
  
  // Get the full text content that includes the version
  const versionText = await versionElement.textContent();
  console.log(`Found version text: ${versionText}`);
  
  // Extract the version from the text (format: "Build: 15:18")
  const displayedVersionMatch = versionText.match(/Build:\s*([^\s]+)/);
  
  if (!displayedVersionMatch) {
    throw new Error(`Could not extract version from displayed text: ${versionText}`);
  }
  
  const displayedVersion = displayedVersionMatch[1];
  console.log(`Displayed version: ${displayedVersion}`);
  
  // Verify that the displayed version matches the expected version
  expect(displayedVersion).toBe(expectedVersion);
  
  console.log(`✅ Version verification successful: ${displayedVersion}`);
  
  // Attach screenshots to the test report
  await test.info().attach('Full Page Screenshot', {
    path: screenshotPath,
    contentType: 'image/png'
  });
  
  await test.info().attach('Version Display Screenshot', {
    path: versionScreenshotPath,
    contentType: 'image/png'
  });
});

test('should have responsive landing page', async ({ page }) => {
  const prodUrl = 'https://my-affirms.web.app/landing';
  await page.goto(prodUrl);
  
  // Check that main elements are visible
  await expect(page.locator('h1:has-text("Demo Afirmacji")')).toBeVisible();
  await expect(page.locator('text=Wybierz kategorię afirmacji')).toBeVisible();
  
  // Check that the page is responsive (mobile view)
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('h1:has-text("Demo Afirmacji")')).toBeVisible();
});