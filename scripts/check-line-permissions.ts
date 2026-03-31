/**
 * LINE Permission Checker
 * 
 * This script checks if your LINE bot has the necessary permissions
 * to interact with group members.
 * 
 * How to run:
 * 1. Set your LINE_CHANNEL_SECRET and LINE_ACCESS_TOKEN in .env
 * 2. Set GROUP_ID to a LINE group ID where the bot is a member
 * 3. Run: npx ts-node scripts/check-line-permissions.ts
 * 
 * IMPORTANT: LINE Messaging API does NOT provide admin/member role information
 * through getGroupMemberProfile. It only returns:
 * - userId
 * - displayName  
 * - pictureUrl
 * 
 * There is NO way to check if someone is a LINE group admin via the standard
 * Messaging API. Admin status must be tracked in your own database.
 */

import { Client } from '@line/bot-sdk';

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN || '';
const GROUP_ID = process.env.GROUP_ID || '';

if (!CHANNEL_SECRET || !ACCESS_TOKEN) {
  console.error('ERROR: Set LINE_CHANNEL_SECRET and LINE_ACCESS_TOKEN in .env');
  process.exit(1);
}

if (!GROUP_ID) {
  console.error('ERROR: Set GROUP_ID to a LINE group ID where the bot is a member');
  process.exit(1);
}

const client = new Client({
  channelAccessToken: ACCESS_TOKEN,
  channelSecret: CHANNEL_SECRET,
});

async function checkPermissions() {
  console.log('=== LINE Permission Checker ===\n');

  // Test 1: Get group summary
  console.log('Test 1: Getting group summary...');
  try {
    const summary = await client.getGroupSummary(GROUP_ID);
    console.log('✅ SUCCESS - Group summary retrieved');
    console.log(`   Group name: ${summary.groupName}`);
    console.log(`   Group ID: ${summary.groupId}`);
    console.log(`   Member count: ${summary.members?.length ?? 'unknown'}`);
  } catch (error: any) {
    console.log(`❌ FAILED - ${error.message}`);
    console.log(`   Status: ${error.status || error.statusCode}`);
    console.log('   This means the bot may not have group access permissions.');
  }

  // Test 2: Get group member IDs
  console.log('\nTest 2: Getting group member IDs...');
  try {
    const memberIds = await client.getGroupMemberIds(GROUP_ID);
    console.log('✅ SUCCESS - Group member IDs retrieved');
    console.log(`   Number of members: ${memberIds.memberIds?.length ?? 'unknown'}`);
    
    if (memberIds.memberIds && memberIds.memberIds.length > 0) {
      const firstMemberId = memberIds.memberIds[0];
      
      // Test 3: Get group member profile
      console.log('\nTest 3: Getting group member profile...');
      try {
        const profile = await client.getGroupMemberProfile(GROUP_ID, firstMemberId);
        console.log('✅ SUCCESS - Group member profile retrieved');
        console.log(`   Display name: ${profile.displayName}`);
        console.log(`   User ID: ${profile.userId}`);
        console.log(`   Picture URL: ${profile.pictureUrl ?? 'none'}`);
        console.log(`   Role property: ${'role' in profile ? (profile as any).role : 'NOT AVAILABLE'}`);
        console.log('\n⚠️  NOTE: LINE API does NOT return role (admin/member) information.');
        console.log('   The response only includes: displayName, userId, pictureUrl');
      } catch (error: any) {
        console.log(`❌ FAILED - ${error.message}`);
        console.log(`   Status: ${error.status || error.statusCode}`);
      }
    }
  } catch (error: any) {
    console.log(`❌ FAILED - ${error.message}`);
    console.log(`   Status: ${error.status || error.statusCode}`);
    console.log('   This means the bot cannot list group members.');
  }

  // Test 4: Send a test message to group
  console.log('\nTest 4: Sending test message to group...');
  try {
    await client.pushMessage(GROUP_ID, {
      type: 'text',
      text: '🔍 Permission check - this is a test message',
    });
    console.log('✅ SUCCESS - Test message sent to group');
  } catch (error: any) {
    console.log(`❌ FAILED - ${error.message}`);
    console.log(`   Status: ${error.status || error.statusCode}`);
    console.log('   This means the bot cannot push messages to this group.');
  }

  console.log('\n=== Summary ===');
  console.log('LINE Messaging API does NOT provide admin/member role information.');
  console.log('Admin status MUST be tracked in your own database.');
  console.log('Use !setup command in the group to claim admin rights.');
}

checkPermissions().catch(console.error);
