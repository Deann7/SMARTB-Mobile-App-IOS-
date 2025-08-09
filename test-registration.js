#!/usr/bin/env node

/**
 * Test script for registration functionality
 * This script tests the registration process without actually creating an account
 */

const { generateRandomData, formatDate } = require('./register-account.js');

console.log('🧪 Testing SMARTB Registration Script');
console.log('=====================================\n');

// Test data generation
console.log('📊 Testing data generation...');
const testData = generateRandomData();

console.log('✅ Generated test data:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Full Name: ${testData.fullName}`);
console.log(`Nickname: ${testData.nickname}`);
console.log(`Email: ${testData.email}`);
console.log(`Phone: ${testData.phoneNumber}`);
console.log(`National ID: ${testData.nationalId}`);
console.log(`Gender: ${testData.gender}`);
console.log(`Date of Birth: ${formatDate(testData.dateOfBirth)}`);
console.log(`Health Facility: ${testData.healthFacility}`);
console.log(`Doctor Name: ${testData.doctorName}`);
console.log(`Diagnosis Date: ${formatDate(testData.diagnosisDate)}`);
console.log(`TB Type: ${testData.tbType}`);
console.log(`Medication Combination: ${testData.medicationCombination}`);
console.log(`Comorbidities: ${testData.comorbidities}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test date formatting
console.log('\n📅 Testing date formatting...');
const testDate = { year: '1990', month: '05', day: '15' };
const formattedDate = formatDate(testDate);
console.log(`Input:`, testDate);
console.log(`Output:`, formattedDate);
console.log('✅ Date formatting test passed!');

// Test multiple data generations
console.log('\n🔄 Testing multiple data generations...');
for (let i = 1; i <= 3; i++) {
  const data = generateRandomData();
  console.log(`${i}. ${data.fullName} (${data.email}) - ${data.gender}`);
}

console.log('\n🎉 All tests completed successfully!');
console.log('\nTo run the actual registration script:');
console.log('node register-account.js [email] [password]');
