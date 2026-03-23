/*
 * FootLine Bot Test Script
 *
 * This script sends actual LINE push messages to the bot and receives responses.
 * It displays both sent commands and received bot replies in the console.
 */

const fetch = globalThis.fetch || require('node-fetch');

// Bot Configuration
const BOT_URL = process.env.BOT_URL || 'https://footlinebot.vercel.app';
const CALLBACK_URL = `${BOT_URL}/api/line/callback`;

// LINE Channel Secrets
const LINE_CHANNEL_SECRET = 'e3ddb1b7683d70b55af0e04bb772e5de';
const LINE_ACCESS_TOKEN = 'w9RBHLwP6/u4cqgasomWFpgtehx7/2xYfq+QnMMN4r4BGhmWtHgyZyl1kdkcWM0EZW3ngWIUyhmGeLgTCvctnMkeaTPsLfZlXLXACflqJn00o6rlv/AWNZe44xACIyKs93TfmkufaYv5rnj2lJm6PQdB04t89/1O/w1cDnyilFU=';

// Test User and Group IDs
const USER_ID = 'Uf8620b25917fc8e76522925fbc8c1f79';
const GROUP_ID = 'C5a4066f892192e5e48ee1f1795704318';

// Delay between tests (milliseconds) - 10 seconds to allow bot to respond
const DELAY_MS = 10000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// All user commands in 3 languages (Spanish, English, Thai)
const USER_COMMANDS = [
  // Help commands
  { cmd: '!ayuda', lang: 'Spanish', desc: 'Help' },
  { cmd: '!help', lang: 'English', desc: 'Help' },
  { cmd: '!ช่วย', lang: 'Thai', desc: 'Help' },
  
  // Register/Unregister
  { cmd: '!apuntar', lang: 'Spanish', desc: 'Register for event' },
  { cmd: '!register', lang: 'English', desc: 'Register for event' },
  { cmd: '!ลงทะเบียน', lang: 'Thai', desc: 'Register for event' },
  
  { cmd: '!baja', lang: 'Spanish', desc: 'Unregister from event' },
  { cmd: '!unregister', lang: 'English', desc: 'Unregister from event' },
  { cmd: '!ยกเลิก', lang: 'Thai', desc: 'Unregister from event' },
  
  // Profile
  { cmd: '!perfil', lang: 'Spanish', desc: 'View profile' },
  { cmd: '!profile', lang: 'English', desc: 'View profile' },
  { cmd: '!โปรไฟล์', lang: 'Thai', desc: 'View profile' },
  
  // Lineup
  { cmd: '!alineacion', lang: 'Spanish', desc: 'View lineup' },
  { cmd: '!lineup', lang: 'English', desc: 'View lineup' },
  { cmd: '!รายชื่อ', lang: 'Thai', desc: 'View lineup' },
  
  // Schedule/Events
  { cmd: '!horario', lang: 'Spanish', desc: 'View schedule' },
  { cmd: '!schedule', lang: 'English', desc: 'View schedule' },
  { cmd: '!อีเวนต์', lang: 'Thai', desc: 'View schedule' },
  
  // Groups
  { cmd: '!grupos', lang: 'Spanish', desc: 'View groups' },
  { cmd: '!groups_list', lang: 'English', desc: 'View groups' },
  { cmd: '!กลุ่ม', lang: 'Thai', desc: 'View groups' },
  
  // Position
  { cmd: '!posicion', lang: 'Spanish', desc: 'Set position' },
  { cmd: '!position', lang: 'English', desc: 'Set position' },
  { cmd: '!ตำแหน่ง', lang: 'Thai', desc: 'Set position' },
  
  // Start
  { cmd: '!start', lang: 'All', desc: 'Start bot' },
  
  // Setup/Register group
  { cmd: '!setup', lang: 'English', desc: 'Setup/register group' },
  { cmd: '!iniciar', lang: 'Spanish', desc: 'Setup/register group' },
  { cmd: '!config_group', lang: 'English', desc: 'Setup/register group' },
];

// Admin commands (for group admins)
const ADMIN_COMMANDS = [
  // Create event
  { cmd: '!crear_evento 2026-03-25 18:00 120 8 3', lang: 'Spanish', desc: 'Create event' },
  { cmd: '!สร้าง 2026-03-25 18:00 120 8 3', lang: 'Thai', desc: 'Create event' },
  { cmd: '!create_event 2026-03-25 18:00 120 8 3', lang: 'English', desc: 'Create event' },
  
  // Config
  { cmd: '!configurar 7', lang: 'Spanish', desc: 'Configure group (7 players)' },
  { cmd: '!ตั้งค่า 7', lang: 'Thai', desc: 'Configure group (7 players)' },
  { cmd: '!config 7', lang: 'English', desc: 'Configure group (7 players)' },
  
  // Tactics
  { cmd: '!tactica', lang: 'Spanish', desc: 'Set tactics' },
  { cmd: '!กลยุทธ์', lang: 'Thai', desc: 'Set tactics' },
  { cmd: '!tactics', lang: 'English', desc: 'Set tactics' },
  
  // Generate lineup
  { cmd: '!generar', lang: 'Spanish', desc: 'Generate lineup' },
  { cmd: '!จัดทีม', lang: 'Thai', desc: 'Generate lineup' },
  { cmd: '!generate', lang: 'English', desc: 'Generate lineup' },
  
  // Close event
  { cmd: '!cerrar', lang: 'Spanish', desc: 'Close event' },
  { cmd: '!ปิด', lang: 'Thai', desc: 'Close event' },
  { cmd: '!close', lang: 'English', desc: 'Close event' },
  
  // Delete event
  { cmd: '!borrar_evento', lang: 'Spanish', desc: 'Delete event' },
  { cmd: '!ลบ', lang: 'Thai', desc: 'Delete event' },
  { cmd: '!delete_event', lang: 'English', desc: 'Delete event' },
  
  // Kick user
  { cmd: '!expulsar', lang: 'Spanish', desc: 'Kick user' },
  { cmd: '!kick', lang: 'English', desc: 'Kick user' },
  
  // Recurring events
  { cmd: '!recurrente', lang: 'Spanish', desc: 'Recurring events' },
  { cmd: '!recurring', lang: 'English', desc: 'Recurring events' },
  
  // Delete group
  { cmd: '!borrar_grupo', lang: 'Spanish', desc: 'Delete group' },
  { cmd: '!delete_group', lang: 'English', desc: 'Delete group' },
  { cmd: '!ลบกลุ่ม', lang: 'Thai', desc: 'Delete group' },
];

// Simple crypto for signature
const crypto = require('crypto');

/**
 * Generate LINE signature for webhook verification
 */
function generateSignature(channelSecret, body) {
  return crypto.createHmac('SHA256', channelSecret)
    .update(body, 'utf8')
    .digest('base64');
}

/**
 * Create a mock LINE webhook event
 */
function createWebhookEvent(type, userId, groupId, messageText, replyToken) {
  const events = [];
  
  if (type === 'group') {
    events.push({
      type: 'message',
      replyToken: replyToken,
      source: {
        type: 'group',
        groupId: groupId,
        userId: userId
      },
      timestamp: Date.now(),
      message: {
        type: 'text',
        id: 'test_' + Date.now(),
        text: messageText
      }
    });
  } else if (type === 'user') {
    events.push({
      type: 'message',
      replyToken: replyToken,
      source: {
        type: 'user',
        userId: userId
      },
      timestamp: Date.now(),
      message: {
        type: 'text',
        id: 'test_' + Date.now(),
        text: messageText
      }
    });
  }
  
  return {
    destination: 'Utestbot',
    events: events
  };
}

/**
 * Send test command to bot via webhook and get response
 */
async function sendTestCommand(command, lang, desc, groupId = null) {
  const userId = USER_ID;
  const replyToken = 'test_reply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  const event = groupId 
    ? createWebhookEvent('group', userId, groupId, command, replyToken)
    : createWebhookEvent('user', userId, null, command, replyToken);
  
  const body = JSON.stringify(event);
  const signature = generateSignature(LINE_CHANNEL_SECRET, body);
  
  try {
    // Send command to bot webhook
    const response = await fetch(CALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature,
        'Authorization': `Bearer ${LINE_ACCESS_TOKEN}`
      },
      body: body
    });
    
    const responseText = await response.text();
    
    return {
      success: response.ok,
      status: response.status,
      response: responseText.substring(0, 500),
      replyToken: replyToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main test execution
 */
(async () => {
  console.log('===========================================');
  console.log('FootLine Bot Test Script');
  console.log('===========================================');
  console.log('');
  console.log(`Bot URL: ${BOT_URL}`);
  console.log(`Callback: ${CALLBACK_URL}`);
  console.log(`Test User ID: ${USER_ID}`);
  console.log(`Test Group ID: ${GROUP_ID}`);
  console.log('');
  
  let userSuccess = 0;
  let userFailed = 0;
  
  // Test user commands (in group context)
  console.log('===========================================');
  console.log('Testing USER Commands (in group)');
  console.log('===========================================');
  console.log('');
  
  for (const cmd of USER_COMMANDS) {
    console.log(`[${cmd.lang}] ${cmd.cmd} - ${cmd.desc}`);
    console.log(`  → Sending to bot...`);
    
    const result = await sendTestCommand(cmd.cmd, cmd.lang, cmd.desc, GROUP_ID);
    
    if (result.success) {
      console.log(`  ✓ SUCCESS: Command sent`);
      console.log(`  📤 Bot Response: ${result.response}`);
      userSuccess++;
    } else {
      console.log(`  ✗ FAILED: ${result.error || `HTTP ${result.status}`}`);
      userFailed++;
    }
    
    console.log(`  Waiting ${DELAY_MS/1000}s before next command...\n`);
    await sleep(DELAY_MS);
  }
  
  // Test admin commands (in group context)
  console.log('===========================================');
  console.log('Testing ADMIN Commands (in group)');
  console.log('===========================================');
  console.log('');
  
  let adminSuccess = 0;
  let adminFailed = 0;
  
  for (const cmd of ADMIN_COMMANDS) {
    console.log(`[${cmd.lang}] ${cmd.cmd} - ${cmd.desc}`);
    console.log(`  → Sending to bot...`);
    
    const result = await sendTestCommand(cmd.cmd, cmd.lang, cmd.desc, GROUP_ID);
    
    if (result.success) {
      console.log(`  ✓ SUCCESS: Command sent`);
      console.log(`  📤 Bot Response: ${result.response}`);
      adminSuccess++;
    } else {
      console.log(`  ✗ FAILED: ${result.error || `HTTP ${result.status}`}`);
      adminFailed++;
    }
    
    console.log(`  Waiting ${DELAY_MS/1000}s before next command...\n`);
    await sleep(DELAY_MS);
  }
  
  // Summary
  console.log('===========================================');
  console.log('Test Summary');
  console.log('===========================================');
  console.log(`User Commands: ${userSuccess} passed, ${userFailed} failed`);
  console.log(`Admin Commands: ${adminSuccess} passed, ${adminFailed} failed`);
  console.log(`Total: ${userSuccess + adminSuccess} passed, ${userFailed + adminFailed} failed`);
  console.log('===========================================');
  console.log('');
  console.log('✅ Test complete!');
})();
