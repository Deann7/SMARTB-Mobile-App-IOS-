#!/usr/bin/env node

/**
 * Supabase Configuration Helper
 * This script helps you configure your Supabase credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🔧 Supabase Configuration Helper');
console.log('================================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function configureSupabase() {
  try {
    console.log('📋 To configure your Supabase credentials, you need to:');
    console.log('');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Login to your account');
    console.log('3. Select your SMARTB-DB project');
    console.log('4. Go to Settings > API');
    console.log('5. Copy the Project URL and anon/public key');
    console.log('');
    
    const supabaseUrl = await askQuestion('🔗 Enter your Supabase URL (e.g., https://abcdefghijklm.supabase.co): ');
    
    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
      console.log('❌ Invalid Supabase URL. Please try again.');
      rl.close();
      return;
    }
    
    const supabaseKey = await askQuestion('🔑 Enter your Supabase Anonymous Key (starts with eyJ...): ');
    
    if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
      console.log('❌ Invalid Supabase key. Please try again.');
      rl.close();
      return;
    }
    
    // Create the config content
    const configContent = `// Supabase Configuration
// This file contains your Supabase credentials

module.exports = {
  // Your Supabase project URL
  SUPABASE_URL: '${supabaseUrl}',
  
  // Your Supabase anonymous key
  SUPABASE_ANON_KEY: '${supabaseKey}'
};`;
    
    // Write to supabase-config.js
    const configPath = path.join(__dirname, 'supabase-config.js');
    fs.writeFileSync(configPath, configContent);
    
    console.log('');
    console.log('✅ Supabase credentials configured successfully!');
    console.log('');
    console.log('📄 Configuration saved to: supabase-config.js');
    console.log('');
    console.log('🚀 You can now run the registration script:');
    console.log('   node register-account.js');
    console.log('');
    console.log('🔍 To verify your credentials, run:');
    console.log('   node test-registration.js');
    
  } catch (error) {
    console.error('❌ Error configuring Supabase:', error.message);
  } finally {
    rl.close();
  }
}

// Run the configuration
configureSupabase();
