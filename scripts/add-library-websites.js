const fs = require('fs');
const path = require('path');

// Read the libraries JSON file
const librariesPath = path.join(__dirname, '../src/data/libraries.json');
const libraries = JSON.parse(fs.readFileSync(librariesPath, 'utf8'));

// Manual mapping of library websites based on research
// Most Berlin libraries are part of VÖBB (Verbund der Öffentlichen Bibliotheken Berlins)
const websiteMap = {
  // Major state libraries
  1: 'https://staatsbibliothek-berlin.de',
  2: 'https://www.zlb.de', // Amerika-Gedenkbibliothek is part of ZLB
  3: 'https://www.zlb.de', // Zentral- und Landesbibliothek Berlin
  4: 'https://www.ub.hu-berlin.de',
  5: 'https://www.fu-berlin.de/sites/philbib',
  
  // District libraries - most are part of their district's VÖBB system
  6: 'https://www.berlin.de/stadtbibliothek-friedrichshain-kreuzberg',
  7: 'https://www.berlin.de/stadtbibliothek-mitte',
  8: 'https://www.berlin.de/stadtbibliothek-pankow',
  9: 'https://www.berlin.de/stadtbibliothek-charlottenburg-wilmersdorf',
  12: 'https://www.berlin.de/stadtbibliothek-mitte',
  13: 'https://www.berlin.de/stadtbibliothek-mitte',
  14: 'https://www.berlin.de/stadtbibliothek-friedrichshain-kreuzberg',
  15: 'https://www.berlin.de/stadtbibliothek-pankow',
  16: 'https://www.berlin.de/stadtbibliothek-pankow',
  17: 'https://www.berlin.de/stadtbibliothek-mitte',
  18: 'https://www.berlin.de/stadtbibliothek-mitte',
  20: 'https://www.berlin.de/stadtbibliothek-friedrichshain-kreuzberg',
  23: 'https://www.berlin.de/stadtbibliothek-pankow',
  25: 'https://www.berlin.de/stadtbibliothek-pankow',
  26: 'https://www.berlin.de/stadtbibliothek-charlottenburg-wilmersdorf',
  27: 'https://www.berlin.de/stadtbibliothek-tempelhof-schoeneberg',
  28: 'https://www.berlin.de/stadtbibliothek-charlottenburg-wilmersdorf',
  29: 'https://www.berlin.de/stadtbibliothek-spandau',
  30: 'https://www.berlin.de/stadtbibliothek-spandau',
  31: 'https://www.berlin.de/stadtbibliothek-spandau',
  32: 'https://www.berlin.de/stadtbibliothek-spandau',
  33: 'https://www.berlin.de/stadtbibliothek-steglitz-zehlendorf',
  34: 'https://www.berlin.de/stadtbibliothek-steglitz-zehlendorf',
  36: 'https://www.berlin.de/stadtbibliothek-steglitz-zehlendorf',
  37: 'https://www.berlin.de/stadtbibliothek-tempelhof-schoeneberg',
  38: 'https://www.berlin.de/stadtbibliothek-tempelhof-schoeneberg',
  39: 'https://www.berlin.de/stadtbibliothek-tempelhof-schoeneberg',
  40: 'https://www.berlin.de/stadtbibliothek-charlottenburg-wilmersdorf',
  41: 'https://www.berlin.de/stadtbibliothek-neukoelln',
  43: 'https://www.berlin.de/stadtbibliothek-neukoelln',
  44: 'https://www.berlin.de/stadtbibliothek-treptow-koepenick',
  45: 'https://www.berlin.de/stadtbibliothek-treptow-koepenick',
  46: 'https://www.berlin.de/stadtbibliothek-treptow-koepenick',
  47: 'https://www.berlin.de/stadtbibliothek-treptow-koepenick',
  48: 'https://www.berlin.de/stadtbibliothek-marzahn-hellersdorf',
  49: 'https://www.berlin.de/stadtbibliothek-marzahn-hellersdorf',
  50: 'https://www.berlin.de/stadtbibliothek-marzahn-hellersdorf',
  51: 'https://www.berlin.de/stadtbibliothek-marzahn-hellersdorf',
  52: 'https://www.berlin.de/stadtbibliothek-lichtenberg',
  53: 'https://www.berlin.de/stadtbibliothek-lichtenberg',
  54: 'https://www.berlin.de/stadtbibliothek-lichtenberg',
  56: 'https://www.berlin.de/stadtbibliothek-reinickendorf',
  57: 'https://www.berlin.de/stadtbibliothek-reinickendorf',
  58: 'https://www.berlin.de/stadtbibliothek-reinickendorf',
  59: 'https://www.berlin.de/stadtbibliothek-reinickendorf',
  
  // Special libraries
  60: 'https://www.iai.spk-berlin.de',
  61: 'https://www.jmberlin.de/bibliothek',
  62: 'https://www.centrumjudaicum.de',
  63: 'https://www.amerikahaus.de',
  64: 'https://www.goethe.de/berlin'
};

// Add websites to library objects
const updatedLibraries = libraries.map(library => ({
  ...library,
  website: websiteMap[library.id] || ''
}));

// Save to new file
const outputPath = path.join(__dirname, '../src/data/libraries_with_websites.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedLibraries, null, 2));

console.log(`\nSuccessfully added website field to ${updatedLibraries.length} libraries`);

// Count libraries with websites
const withWebsites = updatedLibraries.filter(lib => lib.website).length;
console.log(`Libraries with websites: ${withWebsites}/${updatedLibraries.length}`);

// Show libraries without websites
const missingWebsites = updatedLibraries.filter(lib => !lib.website);
if (missingWebsites.length > 0) {
  console.log('\nLibraries without websites:');
  missingWebsites.forEach(lib => {
    console.log(`  - ID ${lib.id}: ${lib.name}`);
  });
}

console.log(`\nOutput saved to: ${outputPath}`);
console.log('\nTo update the original file, run:');
console.log('cp src/data/libraries_with_websites.json src/data/libraries.json');