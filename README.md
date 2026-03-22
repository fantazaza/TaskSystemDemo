# Freelance Task Manager (Premium Edition)

A professional-grade task management system designed specifically for freelancers. Built with modern **Electron**, **SQLite**, and **Vanilla JS/CSS**, it delivers a seamless desktop experience with uncompromising data privacy through purely local storage.

---

## ✨ Key Features

- **🚀 Smart Kanban Board**: Drag-and-drop tasks between statuses (To Do, In Progress, and Done) with instantaneous real-time UI updates.
- **📅 Full Calendar View**: Visualize your schedule and deadlines in a calendar format that supports vertical cell expansion for heavy workload days.
- **📊 Insights Dashboard**: A real-time analytics dashboard displaying Earned Revenue, Pending Revenue, and your overall Success Rate with color-coded breakdown charts.
- **💰 Dynamic Currency Settings**: A new settings menu to configure your preferred currency symbol (e.g., $, ฿, €). The system automatically updates price displays everywhere, including CSV exports.
- **📥 CSV Export**: Seamlessly export your entire task list to a `.csv` file. Fully supports complex data including commas and newlines within task descriptions.
- **🔔 Modern Toast Notifications**: Elegant, auto-dismissing toast notifications handle errors and validation warnings, replacing intrusive browser popups.
- **📁 Secure Archive Module**: Keep your workspace clean by moving completed tasks to a dedicated archive. Supports permanent deletion or smart restoration (restoring tasks back to their original column).
- **🎨 Modern Dark UI**: A sleek, glassmorphic premium design tailored to reduce eye strain during extended work sessions.
- **🛡️ Data Security & Isolation**: The SQLite database is safely stored in the OS's protected AppData directory, preventing accidental data loss or project corruption.

## 🛠️ Technical Stack

- **Framework**: Electron (Main & Preload Context Architecture)
- **Database**: SQLite3 (Local, Encapsulated)
- **Styling**: Vanilla CSS (Modern Grid/Flexbox Layouts + CSS Variables)
- **Logic**: ES6 Modules for clean, maintainable code execution (Separated into State Management, APIs, and UI Components).

## 📦 Installation & Setup

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Clone or Download** this repository.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Launch Application**:
   ```bash
   npm start
   ```

## 🏗️ Build & Distribution

To package this application into a deployable executable (`.exe` for Windows, `.dmg` for macOS):
```bash
npm run build
```
The compiled installation packages will be generated within the `dist/` directory.

## 💾 Data Management

100% of your data (including currency settings) is stored locally and securely isolated on your machine:
- **Windows**: `%APPDATA%\TaskSystem\tasksystemDB.db` (or application name in User Data)
- **Mac**: `~/Library/Application Support/TaskSystem/tasksystemDB.db`

This methodology ensures that your data remains completely intact even if you uninstall, update, or move the application directory.

## 📄 License
This project is licensed under the [ISC License](LICENSE).
