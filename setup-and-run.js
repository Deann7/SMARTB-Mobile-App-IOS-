#!/usr/bin/env node

/**
 * Setup and Run Script for SMARTB Registration
 * This script helps you configure Supabase credentials and run the registration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 SMARTB Registration Setup and Run');
console.log('=====================================\n');

// Check if supabase-config.js exists
const configPath = path.join(__dirname, 'supabase-config.js');
const configExists = fs.existsSync(configPath);

if (!configExists) {
  console.log('📝 Creating supabase-config.js file...');
  const configContent = 
// Edit these values with your actual Supabase credentials


  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Created supabase-config.js file');
}

// Check if config is properly configured
try {
  const config = require('./supabase-config');
  const isConfigured = config.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && 
                      config.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';
  
  if (!isConfigured) {
    console.log('⚠️  Supabase credentials not configured yet!');
    console.log('');
    console.log('🔧 To configure your Supabase credentials:');
    console.log('');
    console.log('1. Open supabase-config.js in your editor');
    console.log('2. Replace the placeholder values with your actual credentials:');
    console.log('');
    console.log('   SUPABASE_URL: "YOUR_SUPABASE_URL_HERE"');
    console.log('   SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY_HERE"');
    console.log('');
    console.log('🔗 To find your Supabase credentials:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your SMARTB-DB project');
    console.log('   3. Go to Settings > API');
    console.log('   4. Copy the URL and anon/public key');
    console.log('');
    console.log('📄 Example configuration:');
    console.log('   SUPABASE_URL: "https://abcdefghijklm.supabase.co"');
    console.log('   SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."');
    console.log('');
    console.log('💡 After configuring, run this script again:');
    console.log('   node setup-and-run.js');
    console.log('');
    process.exit(1);
  }
  
  console.log('✅ Supabase credentials are configured!');
  console.log('');
  
  // Ask user if they want to run registration
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('🤔 Do you want to run the registration script now? (y/n): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n🚀 Running registration script...\n');
      
      // Run the registration script
      const { spawn } = require('child_process');
      const registrationProcess = spawn('node', ['register-account.js'], {
        stdio: 'inherit'
      });
      
      registrationProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 Registration completed successfully!');
        } else {
          console.log(`\n❌ Registration failed with code ${code}`);
        }
      });
    } else {
      console.log('\n👋 You can run the registration script later with:');
      console.log('   node register-account.js');
      console.log('   or');
      console.log('   node register-account.js your.email@example.com yourpassword');
    }
  });
  
} catch (error) {
  console.error('❌ Error reading configuration:', error.message);
  process.exit(1);
}
