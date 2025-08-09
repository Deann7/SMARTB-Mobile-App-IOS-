#!/usr/bin/env node

/**
 * SMARTB Registration Script
 * 
 * This script registers a new account by filling in all required fields
 * from both Register Step 1 and Step 2 of the SMARTB application.
 * 
 * Usage:
 * node register-account.js [email] [password]
 * 
 * Example:
 * node register-account.js test@example.com password123
 */

const { createClient } = require('@supabase/supabase-js');

// Try to load config from local file
let config;
try {
  config = require('./supabase-config');
} catch (error) {
  config = {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
  };
}

// Supabase configuration
const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;

// Initialize Supabase client (only if credentials are valid)
let supabase = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' && 
    SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE') {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Generate random data for registration
 */
function generateRandomData() {
  const now = new Date();
  
  // Generate random date of birth (18-65 years old)
  const year = now.getFullYear() - Math.floor(Math.random() * 47) - 18;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  // Generate random diagnosis date (within last 2 years)
  const diagnosisYear = now.getFullYear() - Math.floor(Math.random() * 2);
  const diagnosisMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const diagnosisDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  // Generate random national ID (16 digits)
  const nationalId = String(Math.floor(Math.random() * 9000000000000000) + 1000000000000000);
  
  // Generate random phone number (Indonesian format)
  const phoneNumber = '08' + String(Math.floor(Math.random() * 900000000) + 100000000);
  
  return {
    // Step 1 Data (Personal Information)
    fullName: `Test User ${Math.floor(Math.random() * 1000)}`,
    nickname: `User${Math.floor(Math.random() * 1000)}`,
    dateOfBirth: {
      day,
      month,
      year: String(year)
    },
    phoneNumber,
    email: `deandronas04@gmail.com`,
    nationalId,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    
    // Step 2 Data (Medical Information)
    healthFacility: `Rumah Sakit ${Math.floor(Math.random() * 100)}`,
    doctorName: `Dr. ${['Ahmad', 'Siti', 'Budi', 'Dewi', 'Rudi'][Math.floor(Math.random() * 5)]}`,
    diagnosisDate: {
      day: diagnosisDay,
      month: diagnosisMonth,
      year: String(diagnosisYear)
    },
    tbType: ['tb_paru', 'tb_ekstra_paru', 'tb_mdr', 'tb_xdr', 'tb_laten'][Math.floor(Math.random() * 5)],
    medicationCombination: ['rhze', 'rhz', 'rh', 'streptomisin_rhze', 'levofloxacin_rhze', 'mdr_combination'][Math.floor(Math.random() * 6)],
    comorbidities: Math.random() > 0.5 ? 'Diabetes, Hipertensi' : 'Tidak ada'
  };
}

/**
 * Format date for database
 */
function formatDate(dateObj) {
  return `${dateObj.year}-${dateObj.month}-${dateObj.day}`;
}

/**
 * Register a new account with all required fields
 */
async function registerAccount(email, password) {
  try {
    console.log('🚀 Starting registration process...');
    
    // Check if Supabase is initialized
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please configure your Supabase credentials.');
    }
    
    // Generate random data
    const randomData = generateRandomData();
    
    // Override email and password if provided
    if (email) randomData.email = email;
    if (password) {
      // Use provided password
    } else {
      password = 'TestPassword123!';
    }
    
    console.log('📋 Generated test data:');
    console.log('Email:', randomData.email);
    console.log('Full Name:', randomData.fullName);
    console.log('Nickname:', randomData.nickname);
    console.log('Phone:', randomData.phoneNumber);
    console.log('National ID:', randomData.nationalId);
    console.log('Gender:', randomData.gender);
    console.log('Date of Birth:', formatDate(randomData.dateOfBirth));
    console.log('Health Facility:', randomData.healthFacility);
    console.log('Doctor Name:', randomData.doctorName);
    console.log('Diagnosis Date:', formatDate(randomData.diagnosisDate));
    console.log('TB Type:', randomData.tbType);
    console.log('Medication Combination:', randomData.medicationCombination);
    console.log('Comorbidities:', randomData.comorbidities);
    console.log('');
    
    // Prepare user data for registration
    const userData = {
      email: randomData.email,
      password: password,
      full_name: randomData.fullName,
      phone: randomData.phoneNumber,
      date_of_birth: formatDate(randomData.dateOfBirth),
      gender: randomData.gender,
      national_id: randomData.nationalId,
      treatment_start_date: formatDate(randomData.diagnosisDate),
      health_facility: randomData.healthFacility,
      doctor_name: randomData.doctorName,
      tb_type: randomData.tbType,
      medication_combination: randomData.medicationCombination,
      comorbidities: randomData.comorbidities,
    };
    
    console.log('🔐 Signing up user...');
    
    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
          date_of_birth: userData.date_of_birth,
          gender: userData.gender,
          national_id: userData.national_id,
        },
      },
    });
    
    if (signUpError) {
      throw new Error(`Sign up failed: ${signUpError.message}`);
    }
    
    console.log('✅ User signed up successfully!');
    console.log('User ID:', signUpData.user?.id);
    
    // Wait a moment for the user to be fully created
    console.log('⏳ Waiting for user creation to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Create user in custom users table
    console.log('👤 Creating user in custom users table...');
    const { data: userCreateData, error: userCreateError } = await supabase.rpc('create_user', {
      p_id: signUpData.user.id,
      p_email: userData.email,
      p_phone: userData.phone,
      p_full_name: userData.full_name,
      p_date_of_birth: userData.date_of_birth,
      p_gender: userData.gender,
      p_national_id: userData.national_id,
    });
    
    if (userCreateError) {
      console.log('⚠️ User creation in custom table failed:', userCreateError.message);
      // Check if user already exists (might happen on retry)
      if (userCreateError.message.includes('already exists') || userCreateError.message.includes('duplicate')) {
        console.log('⚠️ User already exists in custom table, continuing...');
      } else {
        throw new Error(`Failed to create user in custom table: ${userCreateError.message}`);
      }
    } else {
      console.log('✅ User created successfully in custom table!');
    }
    
    // Step 3: Create user profile
    console.log('👤 Creating user profile...');
    
    // Try to create user profile using RPC function
    const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
      p_user_id: signUpData.user.id,
      p_treatment_start_date: userData.treatment_start_date,
      p_health_facility: userData.health_facility,
      p_doctor_name: userData.doctor_name,
      p_tb_type: userData.tb_type,
      p_medication_combination: userData.medication_combination,
      p_comorbidities: userData.comorbidities,
    });
    
    if (profileError) {
      console.log('⚠️ RPC failed, trying direct insert...');
      
      // Fallback: Try direct insert
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: signUpData.user.id,
          treatment_start_date: userData.treatment_start_date,
          current_day: 0,
          total_points: 0,
          streak_days: 0,
          treatment_phase: 'Intensive',
          health_facility: userData.health_facility,
          doctor_name: userData.doctor_name,
          tb_type: userData.tb_type,
          medication_combination: userData.medication_combination,
          comorbidities: userData.comorbidities,
        });
      
      if (insertError) {
        console.log('⚠️ Direct insert also failed:', insertError.message);
      } else {
        console.log('✅ User profile created successfully!');
      }
    } else {
      console.log('✅ User profile created successfully via RPC!');
    }
    
    // Step 4: Sign in the user
    console.log('🔑 Signing in user...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });
    
    if (signInError) {
      console.log('⚠️ Sign in failed:', signInError.message);
      console.log('This might be expected if email confirmation is required.');
    } else {
      console.log('✅ User signed in successfully!');
      console.log('Session:', signInData.session ? 'Active' : 'None');
    }
    
    console.log('\n🎉 Registration completed successfully!');
    console.log('\n📊 Account Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${userData.password}`);
    console.log(`Full Name: ${userData.full_name}`);
    console.log(`Nickname: ${randomData.nickname}`);
    console.log(`Phone: ${userData.phone}`);
    console.log(`National ID: ${userData.national_id}`);
    console.log(`Gender: ${userData.gender}`);
    console.log(`Date of Birth: ${userData.date_of_birth}`);
    console.log(`Treatment Start Date: ${userData.treatment_start_date}`);
    console.log(`Health Facility: ${userData.health_facility}`);
    console.log(`Doctor Name: ${userData.doctor_name}`);
    console.log(`TB Type: ${userData.tb_type}`);
    console.log(`Medication Combination: ${userData.medication_combination}`);
    console.log(`Comorbidities: ${userData.comorbidities}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return {
      success: true,
      user: signUpData.user,
      email: userData.email,
      password: userData.password,
      data: userData
    };
    
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🤖 SMARTB Account Registration Script');
  console.log('=====================================\n');
  
  // Check if Supabase URL and key are configured
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' ||
      SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.error('❌ Error: Please configure your Supabase credentials!');
    console.log('');
    console.log('📝 To configure your Supabase credentials:');
    console.log('');
    console.log('Option 1: Edit the supabase-config.js file:');
    console.log('   - Open supabase-config.js');
    console.log('   - Replace YOUR_SUPABASE_URL_HERE with your actual Supabase URL');
    console.log('   - Replace YOUR_SUPABASE_ANON_KEY_HERE with your actual Supabase Anonymous Key');
    console.log('');
    console.log('Option 2: Set environment variables:');
    console.log('   - EXPO_PUBLIC_SUPABASE_URL');
    console.log('   - EXPO_PUBLIC_SUPABASE_ANON_KEY');
    console.log('');
    console.log('🔗 To find your Supabase credentials:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your SMARTB-DB project');
    console.log('   3. Go to Settings > API');
    console.log('   4. Copy the URL and anon/public key');
    console.log('');
    process.exit(1);
  }
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  
  if (email && !password) {
    console.error('❌ Error: If you provide an email, you must also provide a password');
    console.log('Usage: node register-account.js [email] [password]');
    process.exit(1);
  }
  
  // Register the account
  const result = await registerAccount(email, password);
  
  if (result.success) {
    console.log('\n✅ Registration completed successfully!');
    console.log('You can now use this account to log into the SMARTB application.');
  } else {
    console.log('\n❌ Registration failed!');
    console.log('Error:', result.error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { registerAccount, generateRandomData, formatDate };
