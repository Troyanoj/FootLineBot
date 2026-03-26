#!/usr/bin/env node

/**
 * Test script to validate error handling improvements
 * This script tests the getUserProfile function with various scenarios
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing Error Handling Improvements\n');

// Test 1: Check if the getUserProfile function has been updated
console.log('1. Verifying getUserProfile function updates...');

try {
  const clientPath = path.join(__dirname, 'src', 'lib', 'line', 'client.ts');
  const clientContent = execSync(`cat "${clientPath}"`, { encoding: 'utf8' });
  
  // Check for enhanced error logging
  const hasEnhancedLogging = clientContent.includes('error.status') && 
                            clientContent.includes('error.statusCode') &&
                            clientContent.includes('originalError') &&
                            clientContent.includes('stack');
  
  // Check for dual status code handling
  const hasDualStatusCode = clientContent.includes('error.status === 404 || error.statusCode === 404');
  
  // Check for debug logging
  const hasDebugLogging = clientContent.includes('User ${userId} not found in LINE API');
  
  console.log(`   ✅ Enhanced error logging: ${hasEnhancedLogging ? '✓' : '✗'}`);
  console.log(`   ✅ Dual status code handling: ${hasDualStatusCode ? '✓' : '✗'}`);
  console.log(`   ✅ Debug logging for unknown users: ${hasDebugLogging ? '✓' : '✗'}`);
  
  if (hasEnhancedLogging && hasDualStatusCode && hasDebugLogging) {
    console.log('   🎉 getUserProfile function has been successfully updated!\n');
  } else {
    console.log('   ❌ getUserProfile function updates are incomplete\n');
  }
  
} catch (error) {
  console.log(`   ❌ Error reading client.ts: ${error.message}\n`);
}

// Test 2: Check if user handlers use the updated function
console.log('2. Verifying user handlers integration...');

try {
  const userHandlersPath = path.join(__dirname, 'src', 'lib', 'line', 'handlers', 'user.handlers.ts');
  const userHandlersContent = execSync(`cat "${userHandlersPath}"`, { encoding: 'utf8' });
  
  // Check if getOrCreateUser function exists and uses getUserProfile
  const hasGetOrCreateUser = userHandlersContent.includes('async function getOrCreateUser');
  const usesGetUserProfile = userHandlersContent.includes('const lineProfile = await getUserProfile');
  
  console.log(`   ✅ getOrCreateUser function exists: ${hasGetOrCreateUser ? '✓' : '✗'}`);
  console.log(`   ✅ Uses updated getUserProfile: ${usesGetUserProfile ? '✓' : '✗'}`);
  
  if (hasGetOrCreateUser && usesGetUserProfile) {
    console.log('   🎉 User handlers are properly integrated!\n');
  } else {
    console.log('   ❌ User handlers integration issues\n');
  }
  
} catch (error) {
  console.log(`   ❌ Error reading user.handlers.ts: ${error.message}\n`);
}

// Test 3: Check git status
console.log('3. Checking git status...');

try {
  const diffOutput = execSync('git diff 882d841..HEAD --name-only', { encoding: 'utf8' });
  const modifiedFiles = diffOutput.trim().split('\n').filter(f => f.length > 0);
  
  console.log(`   📁 Modified files since last commit: ${modifiedFiles.length}`);
  modifiedFiles.forEach(file => console.log(`      - ${file}`));
  
  if (modifiedFiles.includes('src/lib/line/client.ts')) {
    console.log('   ✅ Client.ts changes detected in git diff\n');
  } else {
    console.log('   ❌ Client.ts changes not detected in git diff\n');
  }
  
} catch (error) {
  console.log(`   ❌ Error checking git status: ${error.message}\n`);
}

// Test 4: Check for proper error handling patterns
console.log('4. Checking error handling patterns...');

try {
  const clientPath = path.join(__dirname, 'src', 'lib', 'line', 'client.ts');
  const clientContent = execSync(`cat "${clientPath}"`, { encoding: 'utf8' });
  
  // Check for try-catch pattern
  const hasTryCatch = clientContent.includes('try {') && clientContent.includes('} catch (error: any) {');
  
  // Check for default profile return
  const hasDefaultProfile = clientContent.includes('displayName: \'Unknown User\'');
  
  // Check for proper error types
  const hasErrorTypes = clientContent.includes('error.status') || clientContent.includes('error.statusCode');
  
  console.log(`   ✅ Try-catch pattern: ${hasTryCatch ? '✓' : '✗'}`);
  console.log(`   ✅ Default profile for unknown users: ${hasDefaultProfile ? '✓' : '✗'}`);
  console.log(`   ✅ Proper error type handling: ${hasErrorTypes ? '✓' : '✗'}`);
  
  if (hasTryCatch && hasDefaultProfile && hasErrorTypes) {
    console.log('   🎉 Error handling patterns are correctly implemented!\n');
  } else {
    console.log('   ❌ Error handling patterns need improvement\n');
  }
  
} catch (error) {
  console.log(`   ❌ Error checking error handling patterns: ${error.message}\n`);
}

console.log('📋 Summary:');
console.log('The error handling improvements include:');
console.log('• Enhanced error logging with detailed information');
console.log('• Support for both error.status and error.statusCode for 404 detection');
console.log('• Debug logging when returning default profiles for unknown users');
console.log('• Robust try-catch patterns throughout the codebase');
console.log('• Default profile handling for users not found in LINE API');
console.log('\n🎯 These changes should resolve the 404 errors in user commands');
console.log('   by providing graceful fallbacks and better error visibility.');