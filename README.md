# Freelance Task Manager (Premium Edition)

A professional, high-performance task management system specifically designed for freelancers. Built with **Electron**, **SQLite**, and modern **Vanilla JS/CSS**, it offers a seamless desktop experience with complete data privacy and local storage.

## ✨ Key Features

- **🚀 Smart Kanban Board**: Drag-and-drop tasks between statuses (To Do, In Progress, Done) with real-time updates.
- **📅 Full Calendar View**: Visualize your schedule and deadlines across months. Supports vertical expansion for heavy workload days.
- **📊 Insights Dashboard**: Real-time analytics on earned revenue, pending payments, and project success rates with detailed breakdown charts.
- **📁 Secure Archive Module**: Move completed tasks to a dedicated archive to keep your workspace clean. Supports per-item or bulk deletion.
- **🎨 Modern Dark UI**: Sleek, glassmorphic design that reduces eye strain and looks premium.
- **🛡️ Data Security & Isolation**: Uses specialized local storage paths (AppData/Roaming) to ensure your project data is safe from accidental deletion.

## 🛠️ Technical Stack

- **Framework**: Electron (Main & Preload Context Architecture)
- **Database**: SQLite3 (Local, Encapsulated)
- **Styling**: Vanilla CSS (Modern Grid/Flexbox Layouts)
- **Logic**: ES6 Modules for clean, maintainable, and modular code.

## 📦 Installation & Setup

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
2. **Clone/Download** this repository.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Launch Application**:
   ```bash
   npm start
   ```

## 🏗️ Build & Distribution

To package this application into a portable executable (`.exe` for Windows, `.dmg` for macOS):
```bash
npm run build
```
The final package will be generated in the `dist/` directory.

## 💾 Data Management

By default, all data is stored locally in your system's `AppData/Roaming` directory:
- **Windows**: `%APPDATA%\freelance-task-manager`
- **Mac**: `~/Library/Application Support/freelance-task-manager`

This ensures your data persists even if you update or move the application's source folder.

## 📄 License
This project is licensed under the [ISC License](LICENSE).
