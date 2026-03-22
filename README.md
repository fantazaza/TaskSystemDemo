# Freelance Task Manager (Premium Edition)

ระบบจัดการงานระดับมืออาชีพที่ออกแบบมาเพื่อฟรีแลนซ์โดยเฉพาะ พัฒนาด้วย **Electron**, **SQLite** และ **Vanilla JS/CSS** สมัยใหม่ มอบประสบการณ์การใช้งานบนเดสก์ท็อปที่ลื่นไหล พร้อมความปลอดภัยของข้อมูลขั้นสูงสุดด้วยการจัดเก็บข้อมูลแบบ Local

---

## ✨ ฟีเจอร์เด่น (Key Features)

- **🚀 Smart Kanban Board**: ระบบลากวางงาน (Drag-and-drop) ระหว่างสถานะ To Do, In Progress และ Done พร้อมอัปเดตแบบเรียลไทม์
- **📅 Full Calendar View**: ดูตารางงานและเส้นตาย (Deadline) ของคุณในรูปแบบปฏิทินที่รองรับการขยายช่องเมื่อมีงานหนาแน่นในแต่ละวัน
- **📊 Insights Dashboard**: หน้าปัดสรุปสถิติแบบเรียลไทม์ แสดงรายได้ที่ได้รับแล้ว (Earned), รายได้ที่รอรับ (Pending) และอัตราความสำเร็จ (Success Rate) พร้อมกราฟสัดส่วนงาน
- **💰 Dynamic Currency Settings**: เมนูตั้งค่าใหม่ให้คุณเลือกสัญลักษณ์สกุลเงิน (เช่น $, ฿, €) ได้ตามต้องการ โดยระบบจะอัปเดตการแสดงผลราคาทุกจุด รวมถึงตอน Export ให้โดยอัตโนมัติ
- **📥 CSV Export**: ส่งออกรายการงานทั้งหมดของคุณเป็นไฟล์ `.csv` อย่างง่ายดาย รองรับข้อความที่มีลูกน้ำ (Comma) หรือบรรทัดใหม่ (New line) อย่างสมบูรณ์แบบ
- **🔔 Modern Toast Notifications**: ระบบแจ้งเตือนข้อผิดพลาดและการทำงานที่สวยงามและหายไปเองอัตโนมัติ (ไม่ใช้ Popup น่ารำคาญ)
- **📁 Secure Archive Module**: ระบบจัดเก็บงานที่ทำเสร็จแล้วเข้าสู่ Archive เพื่อให้พื้นที่ทำงานของคุณสะอาดตา สามารถเลือกลบถาวรหรือกู้คืนกลับไปยังสถานะเดิมได้
- **🎨 Modern Dark UI**: ดีไซน์แบบ Glassmorphism สไตล์พรีเมียม ถนอมสายตา ใช้งานได้ยาวนาน
- **🛡️ Data Security & Isolation**: ดาต้าเบสถูกแยกไปเก็บไว้ใน AppData ของระบบปฏิบัติการอย่างปลอดภัย ป้องกันไฟล์โปรเจคเสียหายหรือสูญหาย

## 🛠️ เทคโนโลยีที่ใช้ (Technical Stack)

- **Framework**: Electron (Main & Preload Context Architecture)
- **Database**: SQLite3 (Local, Encapsulated)
- **Styling**: Vanilla CSS (Modern Grid/Flexbox Layouts + CSS Variables)
- **Logic**: ES6 Modules แยกไฟล์ชัดเจน ง่ายต่อการดูแลรักษา (State Management, API, UI Components)

## 📦 การติดตั้งและการใช้งาน (Installation & Setup)

1. **ข้อกำหนดเบื้องต้น**: ตรวจสอบให้แน่ใจว่าคุณติดตั้ง [Node.js](https://nodejs.org/) ในเครื่องแล้ว
2. **Clone หรือดาวน์โหลด** ไฟล์ใน Repository นี้
3. **ติดตั้ง Dependencies**:
   ```bash
   npm install
   ```
4. **เปิดแอปพลิเคชัน**:
   ```bash
   npm start
   ```

## 🏗️ การ Build โปรแกรมเพื่อนำไปใช้ (Build & Distribution)

หากคุณต้องการแพ็กเกจแอปพลิเคชันนี้เพื่อนำไปติดตั้งเป็นไฟล์ `.exe` (สำหรับ Windows) หรือ `.dmg` (สำหรับ macOS):
```bash
npm run build
```
ระบบจะสร้างไฟล์สำหรับติดตั้งให้คุณในโฟลเดอร์ `dist/` ทันที

## 💾 การจัดการข้อมูล (Data Management)

ข้อมูลทั้งหมดของคุณ (รวมถึงการตั้งค่าสกุลเงิน) จะถูกเก็บไว้ในเครื่องของคุณ 100% โดยอยู่ที่:
- **Windows**: `%APPDATA%\TaskSystem\tasksystemDB.db` (หรือตามชื่อโปรเจคใน User Data)
- **Mac**: `~/Library/Application Support/TaskSystem/tasksystemDB.db`

การเก็บข้อมูลแบบนี้ทำให้คุณมั่นใจได้ว่าแม้จะลบโฟลเดอร์โปรแกรมทิ้ง หรืออัปเดตเวอร์ชันใหม่ ข้อมูลงานทั้งหมดก็จะยังคงอยู่เหมือนเดิม

## 📄 License
โปรเจคนี้อยู่ภายใต้ไลเซนส์ [ISC License](LICENSE)
