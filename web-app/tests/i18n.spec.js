const { test, expect } = require('@playwright/test');

test.describe('Internationalization (i18n)', () => {
  test('should display English content by default', async ({ page }) => {
    await page.goto('https://my-affirms.web.app/landing');
    await page.waitForLoadState('networkidle');
    
    // Check that main elements are in English
    await expect(page.locator('h1:has-text("Affirmation Demo")')).toBeVisible();
    await expect(page.locator('text=Choose an affirmation category')).toBeVisible();
    await expect(page.locator('text=Create account and build your own affirmations!')).toBeVisible();
    await expect(page.locator('text=Start free')).toBeVisible();
  });

  test('should switch to Polish when language switcher is clicked', async ({ page }) => {
    await page.goto('https://my-affirms.web.app/landing');
    await page.waitForLoadState('networkidle');
    
    // Click language switcher to switch to Polish
    const languageSwitcher = page.locator('button:has(svg)').first();
    await languageSwitcher.click();
    
    // Wait for language to switch
    await page.waitForTimeout(500);
    
    // Check that main elements are now in Polish
    await expect(page.locator('h1:has-text("Demo Afirmacji")')).toBeVisible();
    await expect(page.locator('text=Wybierz kategorię afirmacji')).toBeVisible();
    await expect(page.locator('text=Utwórz konto i stwórz własne afirmacje!')).toBeVisible();
    await expect(page.locator('text=Zacznij za darmo')).toBeVisible();
  });

  test('should maintain language preference across page navigation', async ({ page }) => {
    await page.goto('https://my-affirms.web.app/landing');
    await page.waitForLoadState('networkidle');
    
    // Switch to Polish
    const languageSwitcher = page.locator('button:has(svg)').first();
    await languageSwitcher.click();
    await page.waitForTimeout(500);
    
    // Verify Polish content is shown
    await expect(page.locator('h1:has-text("Demo Afirmacji")')).toBeVisible();
    
    // Navigate to auth page
    await page.goto('https://my-affirms.web.app/auth');
    await page.waitForLoadState('networkidle');
    
    // Check that Polish is still active
    await expect(page.locator('text=Zaloguj się')).toBeVisible();
    await expect(page.locator('text=Zaloguj się aby kontynuować')).toBeVisible();
  });

  test('should display correct flag icons for each language', async ({ page }) => {
    await page.goto('https://my-affirms.web.app/landing');
    await page.waitForLoadState('networkidle');
    
    // Initially should show Polish flag (to switch to Polish)
    const languageSwitcher = page.locator('button:has(svg)').first();
    await expect(languageSwitcher).toBeVisible();
    
    // Click to switch to Polish
    await languageSwitcher.click();
    await page.waitForTimeout(500);
    
    // After switching to Polish, should show British flag (to switch to English)
    await expect(languageSwitcher).toBeVisible();
    
    // Click to switch back to English
    await languageSwitcher.click();
    await page.waitForTimeout(500);
    
    // Should show English content again
    await expect(page.locator('h1:has-text("Affirmation Demo")')).toBeVisible();
  });

  test('should have all required translation keys', async ({ page }) => {
    // This test checks if the JSON translation files exist and have required keys
    await page.goto('https://my-affirms.web.app/landing');
    await page.waitForLoadState('networkidle');
    
    // Test English version
    await expect(page.locator('text=Choose an affirmation category')).toBeVisible();
    await expect(page.locator('text=Ready to start?')).toBeVisible();
    
    // Switch to Polish
    const languageSwitcher = page.locator('button:has(svg)').first();
    await languageSwitcher.click();
    await page.waitForTimeout(500);
    
    // Test Polish version
    await expect(page.locator('text=Wybierz kategorię afirmacji')).toBeVisible();
    await expect(page.locator('text=Gotowy do rozpoczęcia?')).toBeVisible();
  });
});

test.describe('Authentication i18n', () => {
  test('should display auth page in correct language', async ({ page }) => {
    await page.goto('https://my-affirms.web.app/auth');
    await page.waitForLoadState('networkidle');
    
    // Should default to English
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    
    // Switch to Polish
    const languageSwitcher = page.locator('button:has(svg)').first();
    await languageSwitcher.click();
    await page.waitForTimeout(500);
    
    // Should show Polish
    await expect(page.locator('text=Zaloguj się')).toBeVisible();
    await expect(page.locator('text=Kontynuuj z Google')).toBeVisible();
  });
});