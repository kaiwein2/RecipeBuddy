const { execSync } = require('child_process');
try {
  console.log("Building Vite...");
  execSync('npm run build', { stdio: 'inherit' });
  console.log("Syncing Capacitor...");
  execSync('npx cap sync android', { stdio: 'inherit' });
  console.log("Assembling APK...");
  execSync('.\\gradlew assembleDebug', { cwd: './android', stdio: 'inherit' });
  console.log("APK WORKFLOW COMPLETE!");
} catch (e) {
  console.error("Workflow failed");
  process.exit(1);
}
