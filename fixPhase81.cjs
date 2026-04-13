const fs = require('fs');

// Fix App.tsx missing array fallbacks and Homepage Hero visibility
let app = fs.readFileSync('src/app/App.tsx', 'utf8');

app = app.replace(/selectedRecipe\?\.allergens\.filter/g, '(selectedRecipe?.allergens || []).filter');
app = app.replace(/selectedRecipe\.instructions\.length/g, '(selectedRecipe.instructions || []).length');
app = app.replace(/selectedRecipe\.instructions\[instructionStep\]/g, '(selectedRecipe.instructions || [])[instructionStep]');
app = app.replace(/selectedRecipe\.instructions\.map/g, '(selectedRecipe.instructions || []).map');
app = app.replace(/selectedRecipe\.categories\.join/g, '(selectedRecipe.categories || []).join');
app = app.replace(/selectedRecipe\.dietaryTags\.length/g, '(selectedRecipe.dietaryTags || []).length');
app = app.replace(/selectedRecipe\.dietaryTags\.map/g, '(selectedRecipe.dietaryTags || []).map');
app = app.replace(/selectedRecipe\.ingredients\.map/g, '(selectedRecipe.ingredients || []).map');

app = app.replace(/className="relative hidden md:block"/g, 'className="relative mt-8 md:mt-0"');
app = app.replace(/className="aspect-square rounded-3xl overflow-hidden shadow-2xl"/g, 'className="aspect-video md:aspect-square rounded-[32px] md:rounded-3xl overflow-hidden shadow-2xl max-w-[85%] mx-auto md:max-w-none"');

fs.writeFileSync('src/app/App.tsx', app);

// Fix ProfileSettings.tsx Avatar Freeze
let profile = fs.readFileSync('src/app/components/ProfileSettings.tsx', 'utf8');

profile = profile.replace(/const response = await fetch\(`data:image\/\$\{extension\};base64,\$\{photo\.base64String\}`\);\s*const blob = await response\.blob\(\);\s*const snapshot = await uploadBytes\(imageRef, blob\);/g, `
      const b64Data = photo.base64String;
      const contentType = \`image/\${extension}\`;
      const sliceSize = 512;
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: contentType });
      const snapshot = await uploadBytes(imageRef, blob);
`);

// Also fix the toast error not dismissing
profile = profile.replace("toast.error(`Avatar upload failed: ${err.message || 'Unknown error'}`);", "toast.error(`Avatar upload failed: ${err.message || 'Unknown error'}`, { id: toastId });");

fs.writeFileSync('src/app/components/ProfileSettings.tsx', profile);

console.log('Phase 8.1 successfully injected.');
