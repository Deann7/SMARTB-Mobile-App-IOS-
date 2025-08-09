#!/usr/bin/env node

/**
 * Database Reset Script for SMARTB
 * This script helps reset the database and apply the new schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load configuration
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

// Initialize Supabase client
let supabase = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.log('❌ Konfigurasi Supabase tidak ditemukan!');
  console.log('Pastikan file supabase-config.js ada atau environment variables sudah diset.');
  process.exit(1);
}

/**
 * Reset database schema
 */
async function resetDatabase() {
  console.log('🔄 Memulai reset database...');
  
  try {
    // Step 1: Drop and recreate schema
    console.log('📋 Step 1: Menghapus schema yang ada...');
    const { error: resetError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP SCHEMA IF EXISTS public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
      `
    });
    
    if (resetError) {
      console.log('⚠️ Reset schema gagal, mencoba method alternatif...');
      // Alternative method using direct SQL
      const { error: altError } = await supabase.from('information_schema.schemata').delete();
      if (altError) {
        console.log('❌ Gagal reset database melalui script.');
        console.log('Silakan reset manual melalui Supabase Dashboard:');
        console.log('1. Buka SQL Editor');
        console.log('2. Jalankan: DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('3. Grant permissions seperti di atas');
        return false;
      }
    }
    
    console.log('✅ Schema berhasil direset!');
    return true;
  } catch (error) {
    console.log('❌ Error resetting database:', error.message);
    return false;
  }
}

/**
 * Read and execute SQL file
 */
async function executeSQLFile(filename) {
  console.log(`📄 Step 2: Menjalankan file ${filename}...`);
  
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, filename);
    if (!fs.existsSync(sqlFilePath)) {
      console.log(`❌ File ${filename} tidak ditemukan!`);
      return false;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Menjalankan ${statements.length} statement SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ Statement ${i + 1} gagal:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} error:`, err.message);
          errorCount++;
        }
      }
    }
    
    console.log(`✅ SQL selesai dijalankan!`);
    console.log(`📈 Berhasil: ${successCount}, Gagal: ${errorCount}`);
    
    return errorCount === 0;
  } catch (error) {
    console.log('❌ Error executing SQL file:', error.message);
    return false;
  }
}

/**
 * Verify database setup
 */
async function verifyDatabase() {
  console.log('🔍 Step 3: Verifikasi database...');
  
  try {
    // Check tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (!tablesError && tables) {
      console.log('📋 Tabel yang ditemukan:');
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // Check functions
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public');
    
    if (!functionsError && functions) {
      console.log('🔧 Fungsi yang ditemukan:');
      functions.forEach(func => {
        console.log(`  - ${func.routine_name}`);
      });
    }
    
    // Check policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .eq('schemaname', 'public');
    
    if (!policiesError && policies) {
      console.log('🔐 Policy yang ditemukan:');
      policies.forEach(policy => {
        console.log(`  - ${policy.tablename}.${policy.policyname}`);
      });
    }
    
    console.log('✅ Verifikasi database selesai!');
    return true;
  } catch (error) {
    console.log('❌ Error verifying database:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 SMARTB Database Reset Script');
  console.log('================================');
  
  // Check if supabase is configured
  if (!supabase) {
    console.log('❌ Supabase client tidak dapat diinisialisasi!');
    process.exit(1);
  }
  
  // Step 1: Reset database
  const resetSuccess = await resetDatabase();
  if (!resetSuccess) {
    console.log('❌ Gagal reset database. Silakan lakukan manual.');
    process.exit(1);
  }
  
  // Step 2: Execute SQL file
  const sqlSuccess = await executeSQLFile('smartb_database_complete.sql');
  if (!sqlSuccess) {
    console.log('❌ Gagal menjalankan SQL file.');
    process.exit(1);
  }
  
  // Step 3: Verify database
  await verifyDatabase();
  
  console.log('🎉 Database reset berhasil!');
  console.log('');
  console.log('📝 Langkah selanjutnya:');
  console.log('1. Test registrasi: node register-account.js');
  console.log('2. Cek apakah user berhasil dibuat');
  console.log('3. Verifikasi semua fungsi bekerja');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { resetDatabase, executeSQLFile, verifyDatabase };
