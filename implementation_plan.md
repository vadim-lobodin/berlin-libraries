# Implementation Plan: Library Interior Images Collection

## [Overview]
Collect 3-5 high-quality vertical images of library interiors for all 64 Berlin libraries listed in `src/data/libraries.json` and save them to the `public/photos/` directory with organized naming conventions.

This implementation is needed to provide visual context for each library in the application, helping users better understand the workspace environment, atmosphere, and facilities before visiting. The images will be integrated into the library listing and detail views.

## [Types]
No new type definitions required.

The existing type system in `src/types/library.ts` already supports the library data structure. Images will be accessed by constructing paths based on library IDs.

## [Files]
Modifications to the file system structure for image storage.

### New Files to be Created:
- `public/photos/1_1.jpg` through `public/photos/1_5.jpg` (Staatsbibliothek zu Berlin)
- `public/photos/2_1.jpg` through `public/photos/2_5.jpg` (Amerika-Gedenkbibliothek)
- ... continuing for all 64 libraries
- Total: 192-320 image files (3-5 images per library)

### Existing Files - No Modifications:
- `src/data/libraries.json` - Contains library metadata
- `public/photos/` - Target directory for images

### File Naming Convention:
Format: `{library_id}_{image_number}.jpg`
- Library ID: Matches the `id` field in `libraries.json`
- Image number: Sequential 1-5 based on number of images found
- Example: `1_1.jpg`, `1_2.jpg`, `1_3.jpg` for library ID 1

## [Functions]
No function modifications required.

This task involves data collection and file organization only. Image paths can be programmatically constructed in components using the pattern `public/photos/{id}_{n}.jpg`.

## [Classes]
No class modifications required.

This is a pure data collection and file organization task without code changes.

## [Dependencies]
No new dependencies required.

Will use existing system tools:
- `curl` - For downloading images from web sources
- Standard file system operations

## [Testing]
Verification of image collection completeness.

### Validation Steps:
1. Verify all 64 libraries have 3-5 images each
2. Check that all images are in vertical/portrait orientation
3. Confirm all files are properly named following convention
4. Ensure images are of good quality (interior shots, well-lit, representative)
5. Verify file sizes are reasonable (not too large, not corrupted)

### Testing Commands:
```bash
# Count total images
ls -1 public/photos/*.jpg | wc -l

# List images by library ID
ls -1 public/photos/ | sort -V

# Check for missing library IDs
for i in {1..64}; do [ $i -eq 24 ] && continue; ls public/photos/${i}_*.jpg 2>/dev/null || echo "Missing: Library $i"; done
```

## [Implementation Order]
Sequential processing of libraries in batches to ensure no libraries are missed.

1. **Setup Phase**
   - Verify `public/photos/` directory exists
   - Create library tracking checklist

2. **Batch 1: Libraries 1-10**
   - Search and download 3-5 images per library
   - Name files according to convention
   - Mark each library as complete

3. **Batch 2: Libraries 11-20**
   - Continue systematic image collection
   - Track progress in checklist

4. **Batch 3: Libraries 21-30**
   - Note: Skip ID 24 (not in dataset)
   - Process remaining libraries in batch

5. **Batch 4: Libraries 31-40**
   - Continue systematic collection

6. **Batch 5: Libraries 41-50**
   - Continue systematic collection

7. **Batch 6: Libraries 51-60**
   - Continue systematic collection

8. **Batch 7: Libraries 61-64**
   - Complete final libraries
   - Total: 4 libraries

9. **Verification Phase**
   - Run validation commands
   - Verify all 64 libraries have images
   - Check image quality and orientation
   - Create summary report

## Library Checklist

### Batch 1 (IDs 1-10)
- [ ] 1: Staatsbibliothek zu Berlin
- [ ] 2: Amerika-Gedenkbibliothek
- [ ] 3: Zentral- und Landesbibliothek
- [ ] 4: Universitätsbibliothek der Humboldt-Universität
- [ ] 5: Philologische Bibliothek der Freien Universität
- [ ] 6: Stadtbibliothek Friedrichshain-Kreuzberg
- [ ] 7: Stadtbibliothek Mitte - Philipp-Schaeffer-Bibliothek
- [ ] 8: Stadtbibliothek Pankow
- [ ] 9: Stadtbibliothek Charlottenburg-Wilmersdorf
- [ ] 10: Stadtbibliothek Spandau

### Batch 2 (IDs 11-20)
- [ ] 11: Philipp-Schaeffer-Bibliothek
- [ ] 12: Bruno-Lösche-Bibliothek
- [ ] 13: Bibliothek am Luisenbad
- [ ] 14: Bezirkszentralbibliothek Pablo Neruda
- [ ] 15: Heinrich-Böll-Bibliothek
- [ ] 16: Kurt-Tucholsky-Bibliothek
- [ ] 17: Hansabibliothek
- [ ] 18: Tiergarten-Bibliothek
- [ ] 19: Bibliothek am Frankfurter Tor
- [ ] 20: Familienbibliothek am Kotti

### Batch 3 (IDs 21-30)
- [ ] 21: Heinrich-Heine-Bibliothek
- [ ] 22: Janusz-Korczak-Bibliothek
- [ ] 23: Bibliothek am Wasserturm
- [ ] 25: Wolfdietrich-Schnurre-Bibliothek (Note: ID 24 missing)
- [ ] 26: Dietrich-Bonhoeffer-Bibliothek
- [ ] 27: Heinrich-Schulz-Bibliothek
- [ ] 28: Stadtteilbibliothek Halemweg
- [ ] 29: Bezirkszentralbibliothek Spandau
- [ ] 30: Stadtteilbibliothek Falkenhagener Feld

### Batch 4 (IDs 31-40)
- [ ] 31: Stadtteilbibliothek Heerstraße
- [ ] 32: Bibliothek Kladow
- [ ] 33: Ingeborg-Drewitz-Bibliothek
- [ ] 34: Gottfried-Benn-Bibliothek
- [ ] 35: Bezirksbibliothek Steglitz
- [ ] 36: Stadtteilbibliothek Lankwitz
- [ ] 37: Eva-Maria-Buch-Haus
- [ ] 38: Gertrud-Kolmar-Bibliothek
- [ ] 39: Stadtteilbibliothek Friedenau
- [ ] 40: Bibliothek am Bundesplatz

### Batch 5 (IDs 41-50)
- [ ] 41: Helene-Nathan-Bibliothek
- [ ] 42: Bibliothek am Sandberg
- [ ] 43: Stadtteilbibliothek Britz
- [ ] 44: Mittelpunktbibliothek Köpenick
- [ ] 45: Stadtbibliothek Friedrichshagen
- [ ] 46: Stadt- und Regionalbibliothek Treptow
- [ ] 47: Bibliothek Baumschulenweg
- [ ] 48: Mark-Twain-Bibliothek
- [ ] 49: Heinrich-von-Kleist-Bibliothek
- [ ] 50: Biesdorf-Bibliothek

### Batch 6 (IDs 51-60)
- [ ] 51: Kaulsdorf-Bibliothek
- [ ] 52: Anna-Seghers-Bibliothek
- [ ] 53: Bodo-Uhse-Bibliothek
- [ ] 54: Anton-Saefkow-Bibliothek
- [ ] 55: Bibliothek im Linden-Center
- [ ] 56: Humboldt-Bibliothek
- [ ] 57: Stadtteilbibliothek Reinickendorf-Ost
- [ ] 58: Stadtteilbibliothek Märkisches Viertel
- [ ] 59: Bibliothek am Schäfersee
- [ ] 60: Ibero-Amerikanisches Institut

### Batch 7 (IDs 61-64)
- [ ] 61: Bibliothek des Jüdischen Museums
- [ ] 62: Stiftung Neue Synagoge Berlin- Centrum Judaicum Library
- [ ] 63: Amerika-Haus Bibliothek
- [ ] 64: Goethe-Institut Library

## Notes
- ID 24 is missing from the dataset - skip this number
- Focus on interior shots showing workspace areas, reading rooms, study spaces
- Prefer vertical/portrait orientation images
- Ensure good lighting and quality
- Images should represent the actual library atmosphere