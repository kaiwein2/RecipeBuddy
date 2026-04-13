const fs = require('fs');

try {
  let admin = fs.readFileSync('src/app/components/AdminDashboard.tsx', 'utf8');
  admin = admin.replace(/\/\/ comments:/g, 'comments:');
  admin = admin.replace(/\/\/ alternatives:/g, 'alternatives:');
  admin = admin.replace(/\/\/ stores:/g, 'stores:');
  fs.writeFileSync('src/app/components/AdminDashboard.tsx', admin);

  let profile = fs.readFileSync('src/app/components/ProfileSettings.tsx', 'utf8');
  profile = profile.replace(/const b64Data[\s\S]*?const snapshot = await uploadBytes\(imageRef, blob\);/, "const downloadUrl = `data:image/${extension};base64,${photo.base64String}`;");
  profile = profile.replace(/const downloadUrl = await getDownloadURL\(snapshot\.ref\);/g, '');
  profile = profile.replace(/quality: 80,/g, 'quality: 10,\n        width: 150,\n        height: 150,');
  profile = profile.replace(/setEditingProfile\(\{ \.\.\.editingProfile, avatar: downloadUrl \}\);/g, 'setEditingProfile({ ...editingProfile, avatar: downloadUrl });\n      onUpdateProfile({ ...editingProfile, avatar: downloadUrl });');
  fs.writeFileSync('src/app/components/ProfileSettings.tsx', profile);

  let app = fs.readFileSync('src/app/App.tsx', 'utf8');
  app = app.replace(
    /<button\s+onClick=\{\(\) => \{ setStepTimeRemaining\(stepTimerDuration\); setStepTimerActive\(false\); \}\}\s+className="flex items-center gap-1\.5/g,
    `<button onClick={() => { if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime=0; } setStepTimeRemaining(stepTimerDuration); setStepTimerActive(false); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm transition-colors font-bold shadow-sm">
                      Stop Alarm
                    </button>
                    <button onClick={() => { if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime=0; } setStepTimeRemaining(stepTimerDuration); setStepTimerActive(false); }} className="flex items-center gap-1.5`
  );

  app = app.replace(
    /<button onClick=\{\(\) => setHidePiP\(true\)\} className="p-2\.5 rounded-full bg-gray-100/g,
    `{stepTimeRemaining === 0 && (
                      <button onClick={() => { if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime=0; } setStepTimerActive(false); setStepTimeRemaining(stepTimerDuration); setHidePiP(true); }} className="p-2.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 shadow-sm transition-all items-center justify-center font-bold text-[10px]">Stop Audio</button>
                    )}
                    <button onClick={() => setHidePiP(true)} className="p-2.5 rounded-full bg-gray-100`
  );
  fs.writeFileSync('src/app/App.tsx', app);
  console.log("Phase 8.2 execution block successfully written to files.");
} catch (e) {
  console.error("Failed executing patch:", e);
  process.exit(1);
}
