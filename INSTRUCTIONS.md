# FootLineBot - Guía de Usuario / คู่มือการใช้งาน

## Español

### ¿Qué es FootLineBot?
FootLineBot es un bot de LINE para gestionar grupos de fútbol amateur. Ayuda a organizar partidos semanales, gestionar inscripciones, generar equipos equilibrados y manejar formaciones tácticas.

---

### Parte 1: Cómo agregar el bot a un grupo de LINE

#### Paso 1: Buscar el bot
1. Abre LINE en tu teléfono
2. Toca en "Añadir amigos" o el icono de búsqueda
3. Busca "FootLineBot" o el nombre de tu grupo de fútbol

#### Paso 2: Agregar al grupo
1. Abre el grupo de LINE donde quieres agregar el bot
2. Toca en el nombre del grupo o configuración
3. Selecciona "Añadir miembro"
4. Busca y selecciona FootLineBot
5. Confirma la adición

#### Paso 3: Verificar conexión
- El bot automáticamente enviará un mensaje de bienvenida cuando se una al grupo
- Si no recibe mensaje, verifica que el webhook esté configurado correctamente

---

### Parte 2: Comandos para Jugadores

| Comando | Descripción |
|---------|-------------|
| `!register` o `!ลงทะเบียน` | Registrarse al evento actual |
| `!unregister` o `!ยกเลิก` | Cancelar registro |
| `!profile` o `!โปรไฟล์` | Ver perfil y posiciones preferidas |
| `!lineup` o `!รายชื่อ` | Ver alineación del equipo |
| `!events` o `!อีเวนต์` | Ver próximos eventos |
| `!groups` o `!กลุ่ม` | Ver grupos disponibles |
| `!help` o `!ช่วย` | Ver todos los comandos |

---

### Parte 3: Comandos para Administradores

#### 3.1 Crear un evento
```
!create 2024-12-25 18:00 120 20 3
```
- `2024-12-25` = Fecha (YYYY-MM-DD)
- `18:00` = Hora de inicio
- `120` = Duración total en minutos
- `20` = Minutos por partido
- `3` = Número de equipos

#### 3.2 Configurar tipo de juego
```
!config 7
```
- `5` = Fútbol 5 vs 5
- `7` = Fútbol 7 vs 7
- `11` = Fútbol 11 vs 11

#### 3.3 Agregar formación táctica
```
!tactica agregar 4-3-3
!กลยุทธ์ เพิ่ม 4-3-3
```
Formaciones disponibles:
- **Fútbol 7:** 3-2-1, 2-3-1, 2-2-2, 3-1-2
- **Fútbol 5:** 2-2, 1-2-1, 1-1-2, 2-1-1
- **Fútbol 11:** 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3

#### 3.4 Generar equipos
```
!lineup
!จัดทีม
```

#### 3.5 Cerrar inscripciones
```
!close
!ปิด
```

#### 3.6 Eventos recurrentes (NUEVO)
```
!recurrente เพิ่ม พุธ 18:00    # Crear evento todos los miércoles
!recurrente พัก พุธ           # Pausar eventos del miércoles
!recurrente ต่อ พุธ           # Reanudar eventos del miércoles
!recurrente ลบ พุธ            # Eliminar evento recurrente
!recurrente ดู                 # Ver lista de eventos recurrentes
```

---

### Parte 4: Ejemplo de flujo completo

1. **Administrador crea evento:**
   ```
   !create 2024-12-25 18:00 120 20 3
   ```

2. **Jugadores se registran:**
   ```
   !register
   ```

3. **Administrador genera equipos:**
   ```
   !lineup
   ```

4. **El bot muestra:**
   ```
   ⚽ *รายชื่อทีม & ตำแหน่ง*
   
   🏟️ *ทีม 1:*
   • ผู้รักษาประตู: สมชาย
   • กองหลังกลาง: สมศักดิ์
   • กองกลาง: วิชัย
   • กองหน้า: สมปอง
   ```

---

## ภาษาไทย (Thai)

### FootLineBot คืออะไร?
FootLineBot เป็นบอท LINE สำหรับจัดการกลุ่มฟุตบอลสมัครเล่น ช่วยจัดการแมตซ์ประจำสัปดาห์ จัดการลงทะเบียน สร้างทีมที่สมดุล และจัดการแผนการเล่น

---

### ส่วนที่ 1: วิธีเพิ่มบอทเข้ากลุ่ม LINE

#### ขั้นตอนที่ 1: ค้นหาบอท
1. เปิด LINE บนมือถือของคุณ
2. แตะที่ "เพิ่มเพื่อน" หรือไอคอนค้นหา
3. ค้นหา "FootLineBot" หรือชื่อกลุ่มฟุตบอลของคุณ

#### ขั้นตอนที่ 2: เพิ่มเข้ากลุ่ม
1. เปิดกลุ่ม LINE ที่คุณต้องการเพิ่มบอท
2. แตะที่ชื่อกลุ่มหรือการตั้งค่า
3. เลือก "เพิ่มสมาชิก"
4. ค้นหาและเลือก FootLineBot
5. ยืนยันการเพิ่ม

#### ขั้นตอนที่ 3: ตรวจสอบการเชื่อมต่อ
- บอทจะส่งข้อความต้อนรับอัตโนมัติเมื่อเข้ากลุ่ม
- หากไม่ได้รับข้อความ ให้ตรวจสอบว่า webhook ถูกตั้งค่าอย่างถูกต้อง

---

### ส่วนที่ 2: คำสั่งสำหรับผู้เล่น

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `!register` หรือ `!ลงทะเบียน` | ลงทะเบียนเข้าร่วมอีเวนต์ปัจจุบัน |
| `!unregister` หรือ `!ยกเลิก` | ยกเลิกการลงทะเบียน |
| `!profile` หรือ `!โปรไฟล์` | ดูโปรไฟล์และตำแหน่งที่ชอบ |
| `!lineup` หรือ `!รายชื่อ` | ดูรายชื่อในอีเวนต์ปัจจุบัน |
| `!events` หรือ `!อีเวนต์` | ดูอีเวนต์ที่กำลังจะมาถึง |
| `!groups` หรือ `!กลุ่ม` | รายการกลุ่มที่มี |
| `!help` หรือ `!ช่วย` | ดูคำสั่งทั้งหมด |

---

### ส่วนที่ 3: คำสั่งสำหรับผู้ดูแล (แอดมิน)

#### 3.1 สร้างอีเวนต์
```
!create 2024-12-25 18:00 120 20 3
```
- `2024-12-25` = วันที่ (YYYY-MM-DD)
- `18:00` = เวลาเริ่ม
- `120` = ระยะเวลารวม (นาที)
- `20` = นาทีต่อคู่
- `3` = จำนวนทีม

#### 3.2 ตั้งค่าประเภทเกม
```
!config 7
```
- `5` = ฟุตบอล 5 คน
- `7` = ฟุตบอล 7 คน
- `11` = ฟุตบอล 11 คน

#### 3.3 เพิ่มการจัดวาง
```
!กลยุทธ์ เพิ่ม 4-3-3
```
การจัดวางที่ใช้ได้:
- **ฟุตบอล 7 คน:** 3-2-1, 2-3-1, 2-2-2, 3-1-2
- **ฟุตบอล 5 คน:** 2-2, 1-2-1, 1-1-2, 2-1-1
- **ฟุตบอล 11 คน:** 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-2-3-1, 3-4-3

#### 3.4 สร้างทีมอัตโนมัติ
```
!lineup
!จัดทีม
```

#### 3.5 ปิดการลงทะเบียน
```
!close
!ปิด
```

#### 3.6 อีเวนต์ประจำ (ใหม่!)
```
!recurrente เพิ่ม พุธ 18:00    # สร้างอีเวนต์ทุกวันพุธ
!recurrente พัก พุธ           # พักอีเวนต์วันพุธชั่วคราว
!recurrente ต่อ พุธ           # กลับมาจัดอีเวนต์วันพุธ
!recurrente ลบ พุธ            # ลบอีเวนต์ประจำวันพุธ
!recurrente ดู                 # ดูรายการอีเวนต์ประจำ
```

---

### ส่วนที่ 4: ตัวอย่างการใช้งาน

1. **แอดมินสร้างอีเวนต์:**
   ```
   !create 2024-12-25 18:00 120 20 3
   ```

2. **ผู้เล่นลงทะเบียน:**
   ```
   !register
   ```

3. **แอดมินสร้างทีม:**
   ```
   !lineup
   ```

4. **บอทแสดงผล:**
   ```
   ⚽ *รายชื่อทีม & ตำแหน่ง*
   
   🏟️ *ทีม 1:*
   • ผู้รักษาประตู: สมชาย
   • กองหลังกลาง: สมศักดิ์
   • กองกลาง: วิชัย
   • กองหน้า: สมปอง
   ```

---

### Posiciones en tailandés / ตำแหน่งในภาษาไทย

| Español | English | ภาษาไทย |
|---------|---------|---------|
| Portero | Goalkeeper | ผู้รักษาประตู |
| Defensa central | Center Back | กองหลังกลาง |
| Lateral izquierdo | Left Back | แบ็คซ้าย |
| Lateral derecho | Right Back | แบ็คขวา |
| Centrocampista defensivo | Defensive Mid | กองกลางตัวรับ |
| Centrocampista | Midfielder | กองกลาง |
| Centrocampista ofensivo | Attacking Mid | กองกลางตัวรุก |
| Delantero | Forward | กองหน้า |

---

### Días de la semana / วันในสัปดาห์

| Español | ภาษาไทย |
|---------|---------|
| Domingo | อาทิตย์ |
| Lunes | จันทร์ |
| Martes | อังคาร |
| Miércoles | พุธ |
| Jueves | พฤหัส |
| Viernes | ศุกร์ |
| Sábado | เสาร์ |

---

## Información de contacto / ข้อมูลติดต่อ

- **Bot URL:** https://app-omega-sand-14.vercel.app
- **Webhook:** https://app-omega-sand-14.vercel.app/api/line/callback
- **GitHub:** https://github.com/Troyanoj/FootLineBot
