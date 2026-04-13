const puppeteer = require('puppeteer');
const fs = require('fs');

const OUT_DIR = 'C:/Users/user/.gemini/antigravity/brain/bd0fd988-b6dc-45fd-9b9c-9fcb62727b71/';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true } });
  const page = await browser.newPage();
  
  try {
    // 1. Load app and bypass onboarding if needed
    console.log("Loading app...");
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('hasSeenOnboarding', 'true');
    });
    
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1000));

    // Try to login as guest just to see the feed
    console.log("Looking for Guest login...");
    const guestBtn = await page.$$('button');
    for (let btn of guestBtn) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Continue as Guest')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    // Screenshot 1: Main Feed
    console.log("Capturing 01_Dynamic_Main_Feed.png...");
    await page.screenshot({ path: OUT_DIR + '01_Dynamic_Main_Feed.png' });

    // Open Add Recipe Form
    console.log("Opening Add Recipe form...");
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add Recipe')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    
    // Screenshot 2: Data Entry Modal
    console.log("Capturing 02_Data_Entry_Form.png...");
    await page.screenshot({ path: OUT_DIR + '02_Data_Entry_Form.png' });

    // Note: To capture Profile Settings, we'd need to mock Auth. Let's just screenshot the Form for now, close it, and try clicking Profile.
    // Close modal
    const closeBtn = await page.$('button svg'); 
    if(closeBtn) {
      await page.evaluate((el) => {
         const btn = el.closest('button');
         if(btn) btn.click();
      }, closeBtn);
    }
    await new Promise(r => setTimeout(r, 1000));

    // Try navigating to profile. Guest might get Auth Prompt.
    // So let's evaluate the React state to force isGuest=false if possible, or just navigate to Profile manually
    // Actually, capturing the feed and data modal represents screenshots. For Profile, we can just screenshot it manually if this automation fails.
    
    console.log("Screenshots saved to artifacts folder.");
  } catch(e) {
    console.error("Puppeteer automation error:", e);
  } finally {
    await browser.close();
  }
})();
