const fs = require('fs');
const path = require('path');
const https = require('https');

// Read the libraries JSON file
const librariesPath = path.join(__dirname, '../src/data/libraries.json');
const libraries = JSON.parse(fs.readFileSync(librariesPath, 'utf8'));

// Function to search DuckDuckGo and extract website
async function searchLibraryWebsite(libraryName, address) {
  return new Promise((resolve) => {
    // Clean the library name and address for search
    const cleanName = libraryName.trim();
    const cleanAddress = address.trim();
    
    // Create search query
    const query = encodeURIComponent(`${cleanName} ${cleanAddress} official website`);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;
    
    console.log(`Searching for: ${cleanName}...`);
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Try to extract website URL from results
        const urlMatch = data.match(/class="result__url"[^>]*>([^<]+)<\/a>/);
        if (urlMatch && urlMatch[1]) {
          let website = urlMatch[1].trim();
          // Clean up the URL
          if (!website.startsWith('http')) {
            website = 'https://' + website;
          }
          console.log(`  Found: ${website}`);
          resolve(website);
        } else {
          console.log(`  No website found`);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error(`  Error searching: ${err.message}`);
      resolve(null);
    });
  });
}

// Function to add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process all libraries
async function processLibraries() {
  console.log(`Processing ${libraries.length} libraries...\n`);
  
  const results = [];
  
  for (let i = 0; i < libraries.length; i++) {
    const library = libraries[i];
    
    console.log(`[${i + 1}/${libraries.length}] ${library.name}`);
    
    // Search for website
    const website = await searchLibraryWebsite(library.name, library.address);
    
    // Add website field to library object
    results.push({
      ...library,
      website: website || ""
    });
    
    // Add delay to avoid rate limiting (2 seconds between requests)
    if (i < libraries.length - 1) {
      await delay(2000);
    }
    
    console.log('');
  }
  
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