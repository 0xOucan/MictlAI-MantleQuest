const { execSync } = require('child_process');

try {
  console.log('🔨 Testing TypeScript compilation...');
  const result = execSync('npx tsc --skipLibCheck --noEmit', { encoding: 'utf8' });
  console.log('✅ TypeScript compilation successful!');
  console.log(result);
} catch (error) {
  console.log('❌ TypeScript compilation failed:');
  console.log(error.stdout || error.message);
} 