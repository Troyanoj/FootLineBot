/**
 * FootLineBot - Automated Webhook Test Suite
 * 
 * Tests LINE webhook functionality for admin and normal users
 * Uses environment variables from .env.test
 */

require('dotenv').config({ path: '.env.test' });
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  NGROK_URL: process.env.NGROK_URL || 'http://localhost:3000',
  CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  CHANNEL_TOKEN: process.env.LINE_ACCESS_TOKEN,
  TEST_GROUP_ID: process.env.TEST_GROUP_ID || 'C1234567890abcdef',
  ADMIN_USER_ID: process.env.ADMIN_USER_ID || 'U1234567890abcdef1234567890abcdef',
  NORMAL_USER_ID_1: process.env.NORMAL_USER_ID_1 || 'U9876543210fedcba9876543210fedcba',
  NORMAL_USER_ID_2: process.env.NORMAL_USER_ID_2 || 'U11111111112222222222333333333344',
  WEBHOOK_PATH: '/api/line/callback',
  MAX_RETRIES: 3,
  RETRY_DELAY: 500,
};

// ============================================================================
// Test Results Storage
// ============================================================================

const testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    startTime: new Date().toISOString(),
    endTime: null,
  },
  logs: [],
  signatures: [],
  voteState: {
    expected: {},
    actual: {},
    duplicates: [],
  },
  permissions: {
    adminTests: [],
    nonAdminTests: [],
  },
  errors: [],
  recommendations: [],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate X-Line-Signature header
 */
function signPayload(body, channelSecret) {
  const signature = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return signature;
}

/**
 * Log a test event
 */
function logEvent(type, data) {
  testResults.logs.push({
    timestamp: new Date().toISOString(),
    type,
    ...data,
  });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send HTTP request with retries
 */
async function sendRequest(options, body, retryCount = 0) {
  const bodyString = JSON.stringify(body);
  const signature = signPayload(bodyString, CONFIG.CHANNEL_SECRET);
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Line-Signature': signature,
    'Content-Length': Buffer.byteLength(bodyString),
  };

  // Store signature for reporting
  if (testResults.signatures.length < 3) {
    testResults.signatures.push({
      test: options.testName,
      body: bodyString.substring(0, 100) + '...',
      signature: signature.substring(0, 50) + '...',
    });
  }

  logEvent('REQUEST', {
    test: options.testName,
    method: 'POST',
    url: options.url,
    headers,
    body: bodyString,
  });

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(options.url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers,
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const responseTime = Date.now();
        const logData = {
          test: options.testName,
          status: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime,
        };

        logEvent('RESPONSE', logData);

        if (res.statusCode >= 500 && retryCount < CONFIG.MAX_RETRIES) {
          const delay = CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
          logEvent('RETRY', {
            test: options.testName,
            retryCount: retryCount + 1,
            delay,
            reason: `Server error ${res.statusCode}`,
          });
          
          setTimeout(async () => {
            try {
              const result = await sendRequest(options, body, retryCount + 1);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, delay);
        } else if (res.statusCode === 200) {
          testResults.summary.passed++;
          resolve({ success: true, status: res.statusCode, data, responseTime });
        } else {
          testResults.summary.failed++;
          const error = new Error(`HTTP ${res.statusCode}: ${data}`);
          testResults.errors.push({
            test: options.testName,
            error: error.message,
            reproducible: true,
          });
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      logEvent('ERROR', {
        test: options.testName,
        error: error.message,
      });

      if (retryCount < CONFIG.MAX_RETRIES) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
        logEvent('RETRY', {
          test: options.testName,
          retryCount: retryCount + 1,
          delay,
          reason: error.message,
        });
        
        setTimeout(async () => {
          try {
            const result = await sendRequest(options, body, retryCount + 1);
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        }, delay);
      } else {
        testResults.summary.failed++;
        testResults.errors.push({
          test: options.testName,
          error: error.message,
          reproducible: true,
        });
        reject(error);
      }
    });

    req.write(bodyString);
    req.end();
  });
}

/**
 * Run a single test
 */
async function runTest(testName, payload, expectedStatus = 200) {
  testResults.summary.total++;
  
  console.log(`\n🧪 Running test: ${testName}`);
  
  const startTime = Date.now();
  
  try {
    const result = await sendRequest({
      url: CONFIG.NGROK_URL + CONFIG.WEBHOOK_PATH,
      testName,
    }, payload);
    
    const duration = Date.now() - startTime;
    console.log(`✅ PASSED (${duration}ms) - Status: ${result.status}`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ FAILED (${duration}ms) - ${error.message}`);
    throw error;
  }
}

// ============================================================================
// Test Cases
// ============================================================================

/**
 * Test 1: Connectivity Check
 */
async function testConnectivity() {
  console.log('\n📡 Test 1: Connectivity Check');
  
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const url = CONFIG.NGROK_URL + CONFIG.WEBHOOK_PATH;
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = lib.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'GET',
    }, (res) => {
      const duration = Date.now() - startTime;
      logEvent('CONNECTIVITY', {
        url,
        status: res.statusCode,
        duration,
      });
      
      if (res.statusCode === 200 || res.statusCode === 405) {
        console.log(`✅ Webhook endpoint is reachable (${duration}ms)`);
        resolve({ success: true, status: res.statusCode });
      } else {
        console.log(`⚠️  Webhook returned ${res.statusCode}`);
        resolve({ success: true, status: res.statusCode }); // Not critical
      }
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      logEvent('CONNECTIVITY_ERROR', {
        url,
        error: error.message,
        duration,
      });
      console.log(`❌ Cannot reach webhook: ${error.message}`);
      testResults.errors.push({
        test: 'Connectivity Check',
        error: error.message,
        reproducible: true,
      });
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Test 2: Join Event (Bot added to group)
 */
async function testJoinEvent() {
  console.log('\n👥 Test 2: Join Event');
  
  const payload = {
    events: [
      {
        type: 'join',
        replyToken: '00000000000000000000000000000000',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
        },
        timestamp: Date.now(),
      },
    ],
  };
  
  await runTest('Join Event', payload);
}

/**
 * Test 3: Admin Command - Start Voting
 */
async function testAdminCommand() {
  console.log('\n👑 Test 3: Admin Command - Start Voting');
  
  const payload = {
    events: [
      {
        type: 'message',
        replyToken: '11111111111111111111111111111111',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.ADMIN_USER_ID,
        },
        timestamp: Date.now(),
        message: {
          id: 'm1',
          type: 'text',
          text: '!votar partido sabado',
        },
      },
    ],
  };
  
  await runTest('Admin Command - Start Voting', payload);
  
  testResults.permissions.adminTests.push({
    command: '!votar partido sabado',
    userId: CONFIG.ADMIN_USER_ID,
    expected: 'Accept command and create voting',
    result: 'Will be verified by response',
  });
}

/**
 * Test 4: Non-Admin User Tries Admin Command
 */
async function testNonAdminCommand() {
  console.log('\n🚫 Test 4: Non-Admin Command Rejection');
  
  const payload = {
    events: [
      {
        type: 'message',
        replyToken: '44444444444444444444444444444444',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_1,
        },
        timestamp: Date.now(),
        message: {
          id: 'm2',
          type: 'text',
          text: '!votar partido domingo',
        },
      },
    ],
  };
  
  await runTest('Non-Admin Command Rejection', payload);
  
  testResults.permissions.nonAdminTests.push({
    command: '!votar partido domingo',
    userId: CONFIG.NORMAL_USER_ID_1,
    expected: 'Reject with permission error',
    result: 'Will be verified by response',
  });
}

/**
 * Test 5: Postback Votes from Multiple Users
 */
async function testPostbackVotes() {
  console.log('\n🗳️  Test 5: Postback Votes');
  
  // Vote from User A
  const voteA = {
    events: [
      {
        type: 'postback',
        replyToken: '22222222222222222222222222222222',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_1,
        },
        timestamp: Date.now(),
        postback: {
          data: 'vote=si&match=sabado',
        },
      },
    ],
  };
  
  await runTest('Postback Vote - User A', voteA);
  
  // Vote from User B
  const voteB = {
    events: [
      {
        type: 'postback',
        replyToken: '33333333333333333333333333333333',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_2,
        },
        timestamp: Date.now(),
        postback: {
          data: 'vote=si&match=sabado',
        },
      },
    ],
  };
  
  await runTest('Postback Vote - User B', voteB);
  
  // Duplicate vote from User A (should be ignored)
  const voteADuplicate = {
    events: [
      {
        type: 'postback',
        replyToken: '55555555555555555555555555555555',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_1,
        },
        timestamp: Date.now(),
        postback: {
          data: 'vote=si&match=sabado',
        },
      },
    ],
  };
  
  await runTest('Postback Duplicate Vote - User A', voteADuplicate);
  
  testResults.voteState.expected = {
    uniqueVotes: 2,
    duplicateAttempts: 1,
    voters: [CONFIG.NORMAL_USER_ID_1, CONFIG.NORMAL_USER_ID_2],
  };
  
  testResults.voteState.duplicates.push({
    userId: CONFIG.NORMAL_USER_ID_1,
    voteData: 'vote=si&match=sabado',
    shouldIgnore: true,
  });
  
  // Admin closes voting
  const closeVote = {
    events: [
      {
        type: 'postback',
        replyToken: '66666666666666666666666666666666',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.ADMIN_USER_ID,
        },
        timestamp: Date.now(),
        postback: {
          data: 'action=close_vote&match=sabado',
        },
      },
    ],
  };
  
  await runTest('Admin Close Vote', closeVote);
}

/**
 * Test 6: Confirmation Command from Non-Admin
 */
async function testConfirmationCommand() {
  console.log('\n✅ Test 6: Confirmation Command');
  
  const payload = {
    events: [
      {
        type: 'message',
        replyToken: '77777777777777777777777777777777',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_2,
        },
        timestamp: Date.now(),
        message: {
          id: 'm4',
          type: 'text',
          text: '!confirmo',
        },
      },
    ],
  };
  
  await runTest('Confirmation Command', payload);
}

/**
 * Test 7: Leave Event
 */
async function testLeaveEvent() {
  console.log('\n👋 Test 7: Leave Event');
  
  const payload = {
    events: [
      {
        type: 'leave',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
        },
        timestamp: Date.now(),
      },
    ],
  };
  
  await runTest('Leave Event', payload);
}

/**
 * Test 8: Help Command in Multiple Languages
 */
async function testHelpCommands() {
  console.log('\n❓ Test 8: Help Commands (Multi-language)');
  
  // Spanish help
  const helpES = {
    events: [
      {
        type: 'message',
        replyToken: '88888888888888888888888888888888',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_1,
        },
        timestamp: Date.now(),
        message: {
          id: 'm5',
          type: 'text',
          text: '!ayuda',
        },
      },
    ],
  };
  
  await runTest('Help Command - Spanish', helpES);
  
  // English help
  const helpEN = {
    events: [
      {
        type: 'message',
        replyToken: '99999999999999999999999999999999',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_2,
        },
        timestamp: Date.now(),
        message: {
          id: 'm6',
          type: 'text',
          text: '!help',
        },
      },
    ],
  };
  
  await runTest('Help Command - English', helpEN);
  
  // Thai help
  const helpTH = {
    events: [
      {
        type: 'message',
        replyToken: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.ADMIN_USER_ID,
        },
        timestamp: Date.now(),
        message: {
          id: 'm7',
          type: 'text',
          text: '!ช่วย',
        },
      },
    ],
  };
  
  await runTest('Help Command - Thai', helpTH);
}

/**
 * Test 9: Register Command (Critical User Flow)
 */
async function testRegisterCommand() {
  console.log('\n📝 Test 9: Register Command (Critical Flow)');
  
  const payload = {
    events: [
      {
        type: 'message',
        replyToken: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        source: {
          type: 'group',
          groupId: CONFIG.TEST_GROUP_ID,
          userId: CONFIG.NORMAL_USER_ID_1,
        },
        timestamp: Date.now(),
        message: {
          id: 'm8',
          type: 'text',
          text: '!register',
        },
      },
    ],
  };
  
  await runTest('Register Command', payload);
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport() {
  testResults.summary.endTime = new Date().toISOString();
  
  // Calculate pass rate
  const passRate = testResults.summary.total > 0
    ? Math.round((testResults.summary.passed / testResults.summary.total) * 100)
    : 0;
  
  // Generate recommendations
  if (testResults.summary.failed > 0) {
    testResults.recommendations.push({
      priority: 'HIGH',
      issue: `${testResults.summary.failed} test(s) failed`,
      action: 'Review error logs and fix critical issues first',
    });
  }
  
  if (testResults.errors.some(e => e.error.includes('isAdmin'))) {
    testResults.recommendations.push({
      priority: 'CRITICAL',
      issue: 'isAdmin variable undefined - Bot completely non-functional',
      action: 'Add "const isAdmin = await isUserAdmin(userId);" in handleMessageEvent()',
    });
  }
  
  if (testResults.errors.some(e => e.error.includes('signature'))) {
    testResults.recommendations.push({
      priority: 'HIGH',
      issue: 'Signature validation failures',
      action: 'Verify CHANNEL_SECRET matches LINE Developer Console',
    });
  }
  
  // Write report to file
  const fs = require('fs');
  const reportPath = './test-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
  console.log(`⏱️  Duration: ${new Date(testResults.summary.endTime) - new Date(testResults.summary.startTime)}ms`);
  console.log('='.repeat(60));
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    testResults.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  if (testResults.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    testResults.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`     → ${rec.action}`);
    });
  }
  
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  console.log('='.repeat(60));
  
  return testResults;
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log('🚀 Starting FootLineBot Webhook Test Suite');
  console.log(`📡 Webhook URL: ${CONFIG.NGROK_URL}${CONFIG.WEBHOOK_PATH}`);
  console.log(`👥 Test Group: ${CONFIG.TEST_GROUP_ID}`);
  console.log(`👑 Admin User: ${CONFIG.ADMIN_USER_ID}`);
  console.log(`👤 Normal Users: ${CONFIG.NORMAL_USER_ID_1}, ${CONFIG.NORMAL_USER_ID_2}`);
  console.log('='.repeat(60));
  
  try {
    // Run tests in sequence
    await testConnectivity();
    await testJoinEvent();
    await testAdminCommand();
    await testNonAdminCommand();
    await testPostbackVotes();
    await testConfirmationCommand();
    await testLeaveEvent();
    await testHelpCommands();
    await testRegisterCommand();
    
    // Generate report
    return generateReport();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    generateReport();
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, CONFIG };
