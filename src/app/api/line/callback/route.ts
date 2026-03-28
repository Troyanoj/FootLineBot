/** Handle message event - process user commands */
async function handleMessageEvent(event: LineWebhookEvent): Promise<void> {
  const { source, message, replyToken } = event;

  // DEBUG: Log full source object to diagnose groupId issues
  console.log('[INFO] === WEBHOOK DEBUG ===');
  console.log('[INFO] Source type:', event.source.type);
  console.log('[INFO] Source groupId:', (event.source as any).groupId);
  console.log('[INFO] Source roomId:', (event.source as any).roomId);
  console.log('[INFO] Source userId:', event.source.userId);
  console.log('[INFO] Reply token present:', !!replyToken);

  if (!source.userId || !message || message.type !== 'text' || !replyToken) {
    console.warn(`[WARN] Missing required fields for message event`, {
      hasUserId: !!source.userId,
      hasMessage: !!message,
      messageType: message?.type,
      hasReplyToken: !!replyToken,
    });
    return;
  }

  const text = message.text?.trim() || '';
  const userId = source.userId;
  const groupId = source.groupId || source.roomId || undefined;

  // ENSURE GROUP EXISTS IN DATABASE (handle race conditions where join event hasn't been fully processed)
  // AND AUTO-ADD USER AS MEMBER IF NEEDED
  if (groupId) {
    try {
      // Check if group exists in our database
      const existingGroup = await groupService.getGroupById(groupId);
      
      if (!existingGroup) {
        console.log(`[INFO] Group ${groupId} not found in DB, creating it now...`);
        
        // First, ensure we have a system placeholder user
        let systemUser = await userService.findByLineUserId('system-placeholder');
        if (!systemUser) {
          systemUser = await userService.create({
            lineUserId: 'system-placeholder',
            displayName: 'System Placeholder',
            position1: 'CM',
          });
        }

        // Create the group with system placeholder as temporary admin
        const autoGroupName = `Football Group ${groupId.substring(0, 8)}`;
        const newGroup = await groupService.createGroup(
          autoGroupName,
          systemUser.id,
          'Auto-registered',
          '7',
          undefined, // internal id (uuid will be generated)
          groupId    // lineGroupId for push notifications
        );

        console.log(`[INFO] [MessageEvent] Auto-created group: ${newGroup.id} (${newGroup.name}) with lineGroupId: ${groupId}`);
        
        // Send welcome message to the group using pushMessage
        try {
          const welcomeMessage = {
            type: 'text' as const,
            text: `🎉 Welcome to FootLine Bot!\n\n` +
                  `Your group has been registered with ID: ${groupId.substring(0, 8)}\n\n` +
                  `📋 *Quick Start:*\n` +
                  `1. Admin: Use !setup to claim admin rights\n` +
                  `2. Players: Use !join ${groupId.substring(0, 8)} to join\n` +
                  `3. Admin: Use !create_event to create a match\n` +
                  `4. Players: Use !register to sign up\n\n` +
                  `Type !help for all commands.`,
          };

          // Push message to the group
          await pushMessage(groupId, welcomeMessage);
          console.log(`[INFO] [MessageEvent] Welcome message sent to group ${groupId}`);
        } catch (msgError) {
          console.error(`[ERROR] [MessageEvent] Failed to send welcome message:`, msgError);
        }
      } else {
        // Group exists, check if user is already a member
        const isMember = await groupService.isMember(groupId, userId);
        if (!isMember) {
          // Add user as a regular member
          await groupService.addMember(groupId, userId, 'member');
          console.log(`[INFO] Auto-added user ${userId} as member to group ${groupId}`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Failed to ensure group exists or add user as member:`, error);
      // Continue processing even if this fails
    }
  }

  console.log(`[DEBUG] Processing message: "${text.substring(0, 50)}" from userId: ${userId}`);

  // Parse command from message
  const parsed = parseCommand(text);

  if (!parsed) {
    // Not a command - ignore the message completely
    console.log(`[DEBUG] Ignoring non-command message: "${text.substring(0, 50)}"`);
    return;
  }

  const { command, args } = parsed;
  console.log(`[INFO] Command received: ${command}, args: ${args.length}`);

  // Check if user is admin for admin commands
  const isAdmin = await isUserAdmin(userId, groupId);

  // Determine language based on command keywords
  // Spanish commands
  const spanishCommands = [
    'apuntar', 'inscribirme', 'baja', 'desinscribirme', 'perfil', 'alineacion', 'horario', 'grupos', 'unirse',
    'posicion', 'ayuda', 'crear_evento', 'configurar', 'tactica', 'generar', 'cerrar', 'borrar_evento', 'expulsar',
    'recurrente', 'borrar_grupo', 'iniciar', 'setup', 'config_group'
  ];

  // English commands
  const englishCommands = [
    'register', 'unregister', 'profile', 'lineup', 'schedule', 'groups_list', 'join',
    'position', 'help', 'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick',
    'recurring', 'recurring_events', 'delete_group', 'delete-group', 'setup', 'config_group'
  ];

  // Thai commands
  const thaiCommands = [
    'ลงทะเบียน', 'สมัคร', 'ยกเลิก', 'โปรไฟล์', 'รายชื่อ', 'ไลน์อัพ', 'อีเวนต์', 'ตาราง', 'กลุ่ม', 'เข้าร่วม',
    'ตำแหน่ง', 'ช่วย', 'help', 'สร้าง', 'ตั้งค่า', 'กลยุทธ์', 'จัดทีม', 'ปิด', 'ลบ', 'kick', 'expulsar',
    'recurrente', 'recurring', 'เริ่ม', 'start', 'setup', 'iniciar'
  ];

  let lang: 'es' | 'en' | 'th' = 'th'; // Default to Thai
  
  // Check language based on command
  if (spanishCommands.includes(command)) {
    lang = 'es';
  } else if (thaiCommands.includes(command)) {
    lang = 'th';
  } else if (englishCommands.includes(command)) {
    lang = 'en';
  }

  // Define admin commands in all languages
  const adminCommands = [
    // Spanish
    'crear_evento', 'configurar', 'tactica', 'táctica', 'generar', 'cerrar', 'borrar_evento', 'expulsar',
    'recurrente', 'borrar_grupo',
    // English
    'create_event', 'config', 'tactics', 'generate', 'close', 'delete_event', 'kick',
    'recurring', 'recurring_events', 'delete_group', 'delete-group',
    // Thai
    'สร้าง', 'ตั้งค่า', 'กลยุทธ์', 'ปิด', 'ลบ', 'ลบกลุ่ม', 'เริ่มต้น'
  ];

  // Group setup commands - These should NOT require admin status because they're used to CLAIM admin rights
  const groupSetupCommands = [
    'setup', 'config_group', 'iniciar', 'iniciar_grupo', 'เริ่มต้น', 'ลงทะเบียนกลุ่ม'
  ];

  // User commands for registering to events (NOT admin-only)
  const userEventCommands = [
    // Spanish
    'apuntar', 'inscribirme', 'baja', 'desinscribirme',
    // English  
    'register', 'unregister',
    // Thai
    'ลงทะเบียน', 'สมัคร', 'ยกเลิก'
  ];

  console.log(`[DEBUG] Language detected: ${lang}, isAdmin: ${isAdmin}, command: ${command}`);

  // Initialize context that will be used throughout the function
  const context: HandlerContext & { lang: 'es' | 'en' | 'th' } = {
    userId,
    groupId,
    replyToken,
    lang,
  };
  
  let result: HandlerResult;
   
  // Check if it's a group setup command - these should NOT require admin status initially
  // because they're used to CLAIM admin rights
  if (groupSetupCommands.includes(command)) {
    // For group setup commands, we still check LINE API to see if user is actually admin in the group
    // If they are, we grant them admin rights
    result = await handleUserCommand(command, args, context);
  } else if (adminCommands.includes(command) && !userEventCommands.includes(command)) {
    // Handle admin command
    if (!isAdmin) {
      const msgFile = lang === 'es' ? msgEs : (lang === 'en' ? msgEn : msgTh);
      result = {
        success: false,
        message: msgFile.adminRequiredMessage(),
      };
      console.warn(`[WARN] Admin command ${command} rejected for non-admin user ${userId}`);
    } else {
      result = await handleAdminCommand(command, args, context);
    }
  } else {
    // Handle user command (including event registration)
    result = await handleUserCommand(command, args, context);
  }

  // Send response
  console.log(`[DEBUG] Sending response: success=${result.success}`);
  await sendResponse(replyToken, result, context);
}