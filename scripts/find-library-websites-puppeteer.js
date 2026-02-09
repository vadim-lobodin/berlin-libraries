const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Read the libraries JSON file
const librariesPath = path.join(__dirname, '../src/data/libraries.json');
const libraries = JSON.parse(fs.readFileSync(librariesPath, 'utf8'));

// Function to search for library website using Puppeteer
async function searchLibraryWebsite(page, libraryName, address) {
  try {
    const cleanName = libraryName.trim();
    const cleanAddress = address.trim();
    
    // Create search query
    const query = `${cleanName} ${cleanAddress} offizielle website`;
    
    console.log(`Searching for: ${cleanName}...`);
    
    // Navigate to Google search
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Extract the first result URL
    const firstResult = await page.evaluate(() => {
      const results = document.querySelectorAll('div.g a[href^="http"]');
      if (results.length > 0) {
        const url = results[0].getAttribute('href');
        // Filter out Google-related URLs
        if (url && !url.includes('google.com') && !url.includes('youtube.com')) {
          return url;
        }
      }
      
      // Try alternative selectors
      const altResults = document.querySelectorAll('a[jsname]');
      for (const result of altResults) {
        const href = result.getAttribute('href');
        if (href && href.startsWith('http') && !href.includes('google.com') && !href.includes('youtube.com')) {
          return href;
        }
      }
      
      return null;
    });
    
    if (firstResult) {
      console.log(`  Found: ${firstResult}`);
      return firstResult;
    } else {
      console.log(`  No website found`);
      return null;
    }
  } catch (error) {
    console.error(`  Error searching: ${error.message}`);
    return null;
  }
}

// Function to add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process all libraries
async function processLibraries() {
  console.log(`Processing ${libraries.length} libraries...\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const results = [];
  
  for (let i = 0; i < libraries.length; i++) {
    const library = libraries[i];
    
    console.log(`[${i + 1}/${libraries.length}] ${library.name}`);
    
    // Search for website
    const website = await searchLibraryWebsite(page, library.name, library.address);
    
    // Add website field to library object
    results.push({
      ...library,
      website: website || ""
    });
    
    // Add delay to avoid rate limiting (3-5 seconds between requests)
    if (i < libraries.length - 1) {
      const randomDelay = 3000 + Math.random() * 2000;
      await delay(randomDelay);
    }
    
    console.log('');
  }
  
  await browser.close();
  
  // Save results to a new file first (backup)
  const backupPath = path.join(__dirname, '../src/data/libraries_with_websites.json');
  fs.writeFileSync(backupPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${backupPath}`);
  
  // Count how many websites were found
  const foundCount = results.filter(lib => lib.website).length;
  console.log(`\nFound websites for ${foundCount}/${libraries.length} libraries`);
  
  // Print libraries without websites
  const missingWebsites = results.filter(lib => !lib.website);
  if (missingWebsites.length > 0) {
    console.log('\nLibraries without websites found:');
    missingWebsites.forEach(lib => {
      console.log(`  - ${lib.name} (ID: ${lib.id})`);
    });
  }
}

// Run the script
processLibraries().catch(console.error);