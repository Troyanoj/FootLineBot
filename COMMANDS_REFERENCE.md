# FootLine Bot - Command Reference (3 Languages)

## 📋 Command Language Mapping

All commands execute the same action regardless of language. The bot responds in the same language as the command.

---

## 🎯 EVENT REGISTRATION COMMANDS (All Users - NOT Admin Only)

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Register for event | `!apuntar`, `!inscribirme` | `!register` | `!ลงทะเบียน`, `!สมัคร` |
| Unregister from event | `!baja`, `!desinscribirme` | `!unregister` | `!ยกเลิก` |

**✅ These commands work for BOTH admins and regular users**

---

## 👤 PROFILE & POSITION COMMANDS

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| View profile | `!perfil` | `!profile` | `!โปรไฟล์` |
| Set positions | `!posicion [p1] [p2] [p3]` | `!position [p1] [p2] [p3]` | `!ตำแหน่ง [p1] [p2] [p3]` |

---

## 📅 EVENT INFO COMMANDS

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| View lineup | `!alineacion` | `!lineup` | `!รายชื่อ`, `!ไลน์อัพ` |
| View schedule | `!horario` | `!schedule` | `!อีเวนต์`, `!ตาราง` |

---

## 👥 GROUP COMMANDS

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| List groups | `!grupos` | `!groups_list` | `!กลุ่ม` |
| Join group | `!unirse [id]` | `!join [id]` | `!เข้าร่วม [id]` |

---

## ❓ HELP & WELCOME COMMANDS

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Show help | `!ayuda` | `!help` | `!ช่วย` |
| Welcome message | `!start`, `!iniciar` | `!start` | `!เริ่ม` |

---

## 👑 ADMIN-ONLY COMMANDS

These commands require admin privileges in the group.

### Event Management

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Create event | `!crear_evento [fecha] [hora]` | `!create_event [date] [time]` | `!สร้าง [วันที่] [เวลา]` |
| Generate teams | `!generar` | `!generate` | `!จัดทีม` |
| Close registration | `!cerrar` | `!close` | `!ปิด` |
| Delete event | `!borrar_evento [id]` | `!delete_event [id]` | `!ลบ [id]` |

### Group Settings

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Configure game type | `!configurar [5\|7\|11]` | `!config [5\|7\|11]` | `!ตั้งค่า [5\|7\|11]` |
| Add tactic | `!tactica agregar [formacion]` | `!tactics add [formation]` | `!กลยุทธ์ เพิ่ม [formation]` |
| Remove tactic | `!tactica quitar [formacion]` | `!tactics remove [formation]` | `!กลยุทธ์ ลบ [formation]` |
| Kick member | `!expulsar [userId]` | `!kick [userId]` | `!kick [userId]` |

### Recurring Events

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Add recurring | `!recurrente agregar [dia] [hora]` | `!recurring add [day] [time]` | `!recurrente เพิ่ม [วัน] [เวลา]` |
| Pause recurring | `!recurrente pausar [dia]` | `!recurring pause [day]` | `!recurrente พัก [วัน]` |
| Resume recurring | `!recurrente reanudar [dia]` | `!recurring resume [day]` | `!recurrente ต่อ [วัน]` |
| List recurring | `!recurrente listar` | `!recurring list` | `!recurrente ดู` |

### Group Administration

| Action | Spanish | English | Thai |
|--------|---------|---------|------|
| Setup group (register) | `!iniciar`, `!setup` | `!setup`, `!config_group` | `!เริ่มต้น`, `!ลงทะเบียนกลุ่ม` |
| Delete group | `!borrar_grupo` | `!delete_group` | `!ลบกลุ่ม` |

---

## 🔧 Language Detection Logic

The bot detects language based on the command used:

1. **Spanish detection**: Commands like `apuntar`, `inscribirme`, `perfil`, etc.
2. **English detection**: Commands like `register`, `unregister`, `profile`, etc.
3. **Thai detection**: Commands like `ลงทะเบียน`, `สมัคร`, `โปรไฟล์`, etc.
4. **Default**: Thai (if language cannot be determined)

---

## ✅ Fixed Issues

### Before Fix:
- ❌ `!register` was trying to register group (admin command) instead of event (user command)
- ❌ Thai characters were corrupted (showing as `???`)
- ❌ Language detection was inconsistent
- ❌ Some commands responded in wrong language

### After Fix:
- ✅ `!register` / `!apuntar` / `!ลงทะเบียน` all register for EVENT (works for all users)
- ✅ `!setup` / `!iniciar` / `!เริ่มต้น` register GROUP (admin only)
- ✅ All Thai UTF-8 characters properly encoded
- ✅ Language detection based on command keywords
- ✅ Bot responds in same language as command

---

## 📝 Examples

### Example 1: Register for Event (Regular User)
```
User: !register
Bot (EN): ✅ Successfully registered for the event!

User: !apuntar
Bot (ES): ✅ ¡Te has registrado exitosamente!

User: !ลงทะเบียน
Bot (TH): ✅ ลงทะเบียนสำเร็จ!
```

### Example 2: Register Group (Admin Only)
```
Admin: !setup
Bot (EN): ✅ Group registered successfully!

Admin: !iniciar
Bot (ES): ✅ ¡Grupo registrado exitosamente!

Admin: !เริ่มต้น
Bot (TH): ✅ ลงทะเบียนกลุ่มสำเร็จ!
```

### Example 3: Non-Admin Tries Admin Command
```
User: !generar
Bot (ES): ℹ️ *Requiere grupo* - Este comando solo puede usarse dentro de un grupo de LINE.

User: !generate
Bot (EN): ℹ️ *Group Required* - This command can only be used inside a LINE group.

User: !จัดทีม
Bot (TH): ℹ️ *ต้องการกลุ่ม* - คำสั่งนี้ใช้ได้เฉพาะในกลุ่ม LINE เท่านั้น
```

---

## 🚀 Deployment

Changes deployed to:
- GitHub: https://github.com/Troyanoj/FootLineBot
- Vercel: https://footlinebot.vercel.app

Commit: `06dfc39` - "Fix: Command language detection and registration commands for all 3 languages"
