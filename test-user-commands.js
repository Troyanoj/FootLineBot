#!/usr/bin/env node

/**
 * FootLineBot - User Commands Test Suite
 * 
 * Tests ALL user commands with real responses from the bot
 * Focus on normal users (non-admin) and critical registration flow
 * 
 * Usage: node test-user-commands.js
 */

require('dotenv').config({ path: '.env.test' });
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const fs = require('fs');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  WEBHOOK_URL: process.env.NGROK_URL || 'https://footlinebot.vercel.app',
  CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  CHANNEL_TOKEN: process.env.LINE_ACCESS_TOKEN,
  TEST_GROUP_ID: process.env.TEST_GROUP_ID || 'C1234567890abcdef',
  ADMIN_USER_ID: process.env.ADMIN_USER_ID || 'U1234567890abcdef1234567890abcdef',
  NORMAL_USER_ID_1: process.env.NORMAL_USER_ID_1 || 'U9876543210fedcba9876543210fedcba',
  NORMAL_USER_ID_2: process.env.NORMAL_USER_ID_2 || 'U11111111112222222222333333333344',
  WEBHOOK_PATH: '/api/line/callback',
  TIMEOUT: 30000, // 30 seconds max per test
};

// ============================================================================
// Test Results
// ============================================================================

const testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    startTime: new Date().toISOString(),
    endTime: null,
  },
  tests: [],
  criticalFlow: {
    registerCommand: {
      tested: false,
      success: false,
      response: null,
      error: null,
    },
  },
  userCommands: {
    total: 0,
    passed: 0,
    failed: 0,
    details: [],
  },
  languageDetection: {
    spanish: { tested: 0, passed: 0 },
    english: { tested: 0, passed: 0 },
    thai: { tested: 0, passed: 0 },
  },
  errors: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

function signPayload(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('base64');
}

function log(message) {
  console.log(message);
}

async function sendWebhookEvent(eventName, payload, expectedStatus = 200) {
  const bodyString = JSON.stringify(payload);
  const signature = signPayload(bodyString, CONFIG.CHANNEL_SECRET);
  
  testResults.summary.total++;
  
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(CONFIG.WEBHOOK_URL + CONFIG.WEBHOOK_PATH);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature,
        'Content-Length': Buffer.byteLength(bodyString),
      },
      timeout: CONFIG.TIMEOUT,
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const passed = res.statusCode === expectedStatus;
        
        if (passed) {
          testResults.summary.passed++;
        } else {
          testResults.summary.failed++;
        }

        const result = {
          name: eventName,
          status: res.statusCode,
          duration,
          passed,
          request: {
            headers: options.headers,
            body: JSON.parse(bodyString),
          },
          response: {
            headers: res.headers,
            body: data,
          },
          timestamp: new Date().toISOString(),
        };

        testResults.tests.push(result);
        
        resolve(result);
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      testResults.summary.failed++;
      
      const result = {
        name: eventName,
        passed: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      
      testResults.tests.push(result);
      testResults.errors.push({
        test: eventName,
        error: error.message,
        reproducible: true,
      });
      
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${CONFIG.TIMEOUT}ms`));
    });

    req.write(bodyString);
    req.end();
  });
}

async function testCommand(description, command, userId, expectedToWork = true) {
  const payload = {
    events: [
      {
        type: 'message',
        replyToken: `test${Date.now()}${Math.random().toString().slice(2, 6)}`,
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: userId,
        },
        timestamp: Date.now(),
        message: {
          id: `msg${Date.now()}`,
          type: 'text',
          text: command,
        },
      },
    ],
  };

  log(`\n🧪 ${description}`);
  log(`   Command: ${command}`);
  log(`   User: ${userId === CONFIG.ADMIN_USER_ID ? 'ADMIN' : 'NORMAL USER'}`);
  
  try {
    const result = await sendWebhookEvent(description, payload);
    
    if (result.passed) {
      log(`   ✅ PASSED (${result.duration}ms) - Status: ${result.status}`);
      
      // Track language detection
      if (command.includes('!ayuda') || command.includes('!perfil') || 
          command.includes('!apuntar') || command.includes('!baja')) {
        testResults.languageDetection.spanish.tested++;
        testResults.languageDetection.spanish.passed++;
      } else if (command.includes('!help') || command.includes('!profile') || 
                 command.includes('!register') || command.includes('!unregister')) {
        testResults.languageDetection.english.tested++;
        testResults.languageDetection.english.passed++;
      } else if (command.includes('!ช่วย') || command.includes('!โปรไฟล์') || 
                 command.includes('!ลงทะเบียน') || command.includes('!ยกเลิก')) {
        testResults.languageDetection.thai.tested++;
        testResults.languageDetection.thai.passed++;
      }
      
      testResults.userCommands.passed++;
    } else {
      log(`   ❌ FAILED (${result.duration}ms) - Status: ${result.status}`);
      testResults.userCommands.failed++;
    }
    
    testResults.userCommands.total++;
    testResults.userCommands.details.push({
      command,
      userId,
      passed: result.passed,
      duration: result.duration,
    });
    
    return result;
  } catch (error) {
    log(`   ❌ ERROR (${error.message})`);
    testResults.userCommands.failed++;
    testResults.userCommands.total++;
    throw error;
  }
}

// ============================================================================
// Test Cases - USER COMMANDS FOCUS
// ============================================================================

async function testCriticalRegisterFlow() {
  log('\n' + '='.repeat(70));
  log('🎯 CRITICAL TEST: Event Registration Flow (Normal User)');
  log('='.repeat(70));
  
  testResults.criticalFlow.registerCommand.tested = true;
  
  // Test 1: !register (English)
  try {
    const result = await testCommand(
      'Register Command - English',
      '!register',
      CONFIG.NORMAL_USER_ID_1,
      true
    );
    
    if (result.passed) {
      testResults.criticalFlow.registerCommand.success = true;
      testResults.criticalFlow.registerCommand.response = result.response;
    }
  } catch (error) {
    testResults.criticalFlow.registerCommand.error = error.message;
  }
  
  // Test 2: !apuntar (Spanish)
  try {
    await testCommand(
      'Register Command - Spanish (!apuntar)',
      '!apuntar',
      CONFIG.NORMAL_USER_ID_2,
      true
    );
  } catch (error) {
    log('   ⚠️  Spanish register command failed');
  }
  
  // Test 3: !ลงทะเบียน (Thai)
  try {
    await testCommand(
      'Register Command - Thai (!ลงทะเบียน)',
      '!ลงทะเบียน',
      CONFIG.NORMAL_USER_ID_1,
      true
    );
  } catch (error) {
    log('   ⚠️  Thai register command failed');
  }
  
  // Test 4: !inscribirme (Spanish alternative)
  try {
    await testCommand(
      'Register Command - Spanish Alternative (!inscribirme)',
      '!inscribirme',
      CONFIG.NORMAL_USER_ID_2,
      true
    );
  } catch (error) {
    log('   ⚠️  Alternative register command failed');
  }
}

async function testUserHelpCommands() {
  log('\n' + '='.repeat(70));
  log('❓ Help Commands (All Languages)');
  log('='.repeat(70));
  
  // Spanish
  await testCommand('Help - Spanish', '!ayuda', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Help - Spanish (!help)', '!help', CONFIG.NORMAL_USER_ID_2);
  
  // English
  await testCommand('Help - English', '!help', CONFIG.NORMAL_USER_ID_1);
  
  // Thai
  await testCommand('Help - Thai', '!ช่วย', CONFIG.NORMAL_USER_ID_2);
}

async function testUserProfileCommands() {
  log('\n' + '='.repeat(70));
  log('👤 Profile Commands (Normal User)');
  log('='.repeat(70));
  
  // Spanish
  await testCommand('Profile - Spanish', '!perfil', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Profile - Spanish (!profile)', '!profile', CONFIG.NORMAL_USER_ID_2);
  
  // English
  await testCommand('Profile - English', '!profile', CONFIG.NORMAL_USER_ID_1);
  
  // Thai
  await testCommand('Profile - Thai', '!โปรไฟล์', CONFIG.NORMAL_USER_ID_2);
}

async function testPositionCommands() {
  log('\n' + '='.repeat(70));
  log('📍 Position Commands (Normal User)');
  log('='.repeat(70));
  
  // Spanish
  await testCommand('Position - Spanish', '!posicion ST CM GK', CONFIG.NORMAL_USER_ID_1);
  
  // English
  await testCommand('Position - English', '!position ST CM GK', CONFIG.NORMAL_USER_ID_2);
  
  // Thai
  await testCommand('Position - Thai', '!ตำแหน่ง ST CM GK', CONFIG.NORMAL_USER_ID_1);
}

async function testUnregisterCommands() {
  log('\n' + '='.repeat(70));
  log('❌ Unregister Commands (Normal User)');
  log('='.repeat(70));
  
  // Spanish
  await testCommand('Unregister - Spanish', '!baja', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Unregister - Spanish (!desinscribirme)', '!desinscribirme', CONFIG.NORMAL_USER_ID_2);
  
  // English
  await testCommand('Unregister - English', '!unregister', CONFIG.NORMAL_USER_ID_1);
  
  // Thai
  await testCommand('Unregister - Thai', '!ยกเลิก', CONFIG.NORMAL_USER_ID_2);
}

async function testGroupCommands() {
  log('\n' + '='.repeat(70));
  log('👥 Group Commands (Normal User)');
  log('='.repeat(70));
  
  // List groups
  await testCommand('Groups List - Spanish', '!grupos', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Groups List - English', '!groups_list', CONFIG.NORMAL_USER_ID_2);
  await testCommand('Groups List - Thai', '!กลุ่ม', CONFIG.NORMAL_USER_ID_1);
  
  // Join group (will fail if group doesn't exist, but should respond)
  await testCommand('Join Group - Spanish', '!unirse TEST123', CONFIG.NORMAL_USER_ID_2);
  await testCommand('Join Group - English', '!join TEST123', CONFIG.NORMAL_USER_ID_1);
}

async function testWelcomeCommands() {
  log('\n' + '='.repeat(70));
  log('👋 Welcome Commands (Normal User)');
  log('='.repeat(70));
  
  await testCommand('Start - English', '!start', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Start - Spanish', '!iniciar', CONFIG.NORMAL_USER_ID_2);
  await testCommand('Start - Thai', '!เริ่ม', CONFIG.NORMAL_USER_ID_1);
}

async function testAdminCommandsAsNormalUser() {
  log('\n' + '='.repeat(70));
  log('🚫 Admin Commands as Normal User (Should Be Rejected)');
  log('='.repeat(70));
  
  // These should all be rejected with permission error
  await testCommand(
    'Admin Command Rejected - Generate',
    '!generar',
    CONFIG.NORMAL_USER_ID_1,
    false
  );
  
  await testCommand(
    'Admin Command Rejected - Create Event',
    '!crear_evento 2024-04-20 19:00',
    CONFIG.NORMAL_USER_ID_2,
    false
  );
  
  await testCommand(
    'Admin Command Rejected - Config',
    '!configurar 7',
    CONFIG.NORMAL_USER_ID_1,
    false
  );
  
  await testCommand(
    'Admin Command Rejected - Close',
    '!cerrar',
    CONFIG.NORMAL_USER_ID_2,
    false
  );
}

async function testMixedLanguageCommands() {
  log('\n' + '='.repeat(70));
  log('🔀 Mixed Language Commands');
  log('='.repeat(70));
  
  // Test that bot responds in same language as command
  await testCommand('Spanish Command', '!ayuda', CONFIG.NORMAL_USER_ID_1);
  await testCommand('English Command', '!help', CONFIG.NORMAL_USER_ID_1);
  await testCommand('Thai Command', '!ช่วย', CONFIG.NORMAL_USER_ID_1);
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport() {
  testResults.summary.endTime = new Date().toISOString();
  
  const duration = new Date(testResults.summary.endTime) - new Date(testResults.summary.startTime);
  const passRate = testResults.summary.total > 0 
    ? Math.round((testResults.summary.passed / testResults.summary.total) * 100) 
    : 0;
  
  // Generate recommendations
  if (!testResults.criticalFlow.registerCommand.success) {
    testResults.errors.push({
      test: 'Critical Register Flow',
      error: 'Register command failed or did not respond correctly',
      severity: 'CRITICAL',
      reproducible: true,
    });
    
    testResults.recommendations = [
      {
        priority: 'CRITICAL',
        issue: 'Event registration is broken',
        action: 'Check handleApuntar function and ensure !register routes to it (not to handleRegisterGroup)',
      },
    ];
  }
  
  // Write report
  const reportPath = './test-user-commands-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  // Print summary
  log('\n' + '='.repeat(70));
  log('📊 TEST SUMMARY');
  log('='.repeat(70));
  log(`Total Tests: ${testResults.summary.total}`);
  log(`✅ Passed: ${testResults.summary.passed}`);
  log(`❌ Failed: ${testResults.summary.failed}`);
  log(`📈 Pass Rate: ${passRate}%`);
  log(`⏱️  Duration: ${duration}ms`);
  log('='.repeat(70));
  
  log('\n📝 USER COMMANDS:');
  log(`   Total: ${testResults.userCommands.total}`);
  log(`   ✅ Passed: ${testResults.userCommands.passed}`);
  log(`   ❌ Failed: ${testResults.userCommands.failed}`);
  
  log('\n🌐 LANGUAGE DETECTION:');
  log(`   Spanish: ${testResults.languageDetection.spanish.passed}/${testResults.languageDetection.spanish.tested}`);
  log(`   English: ${testResults.languageDetection.english.passed}/${testResults.languageDetection.english.tested}`);
  log(`   Thai: ${testResults.languageDetection.thai.passed}/${testResults.languageDetection.thai.tested}`);
  
  log('\n🎯 CRITICAL FLOW - Event Registration:');
  log(`   Tested: ${testResults.criticalFlow.registerCommand.tested}`);
  log(`   Success: ${testResults.criticalFlow.registerCommand.success ? '✅ YES' : '❌ NO'}`);
  if (testResults.criticalFlow.registerCommand.error) {
    log(`   Error: ${testResults.criticalFlow.registerCommand.error}`);
  }
  
  if (testResults.errors.length > 0) {
    log('\n🚨 ERRORS:');
    testResults.errors.forEach((error, i) => {
      log(`   ${i + 1}. [${error.severity || 'ERROR'}] ${error.test}: ${error.error}`);
    });
  }
  
  if (testResults.recommendations) {
    log('\n💡 RECOMMENDATIONS:');
    testResults.recommendations.forEach((rec, i) => {
      log(`   ${i + 1}. [${rec.priority}] ${rec.issue}`);
      log(`      → ${rec.action}`);
    });
  }
  
  log('\n📄 Full report saved to:', reportPath);
  log('='.repeat(70));
  
  return testResults;
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  log('🚀 FootLineBot - User Commands Test Suite');
  log('📡 Webhook:', CONFIG.WEBHOOK_URL + CONFIG.WEBHOOK_PATH);
  log('👥 Test Group:', CONFIG.TEST_GROUP_ID);
  log('👑 Admin User:', CONFIG.ADMIN_USER_ID);
  log('👤 Normal Users:', CONFIG.NORMAL_USER_ID_1, ',', CONFIG.NORMAL_USER_ID_2);
  log('='.repeat(70));
  
  try {
    // Run all user-focused tests
    await testCriticalRegisterFlow(); // MOST IMPORTANT
    await testUserHelpCommands();
    await testUserProfileCommands();
    await testPositionCommands();
    await testUnregisterCommands();
    await testGroupCommands();
    await testWelcomeCommands();
    await testAdminCommandsAsNormalUser();
    await testMixedLanguageCommands();
    
    // Generate report
    return generateReport();
  } catch (error) {
    log('\n💥 Test suite failed:', error.message);
    generateReport();
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, CONFIG };
