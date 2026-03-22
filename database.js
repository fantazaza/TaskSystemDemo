const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

module.exports = {
    init: function(userDataPath) {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(userDataPath, 'tasksystemDB.db');
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error("Database initialization failed:", err);
                    reject(err);
                }
            });

            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    price TEXT,
                    deadline TEXT,
                    status TEXT,
                    createdAt TEXT,
                    color TEXT,
                    originalStatus TEXT
                )`);

                // Create index on status for faster filtering
                db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);

                // Create settings table
                db.run(`CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )`, () => {
                   // Ensure default currency is set
                   db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', '$')`);
                });

                // Add originalStatus column if it doesn't exist (for existing databases)
                db.run(`ALTER TABLE tasks ADD COLUMN originalStatus TEXT`, (err) => {
                    // Silently ignore error if column already exists
                    resolve();
                });
            });
        });
    },

    getSetting: function(key) {
        return new Promise((resolve, reject) => {
           db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
               if (err) reject(err);
               else resolve(row ? row.value : null);
           });
        });
    },

    setSetting: function(key, value) {
        return new Promise((resolve, reject) => {
           db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], function(err) {
               if (err) reject(err);
               else resolve(this.changes);
           });
        });
    },

    getTasks: function(filters = {}) {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM tasks WHERE 1=1";
            let params = [];
            
            if (filters.status) {
                if (filters.status === 'active') {
                    query += " AND status != 'archived'";
                } else {
                    query += " AND status = ?";
                    params.push(filters.status);
                }
            }
            
            if (filters.date) {
                query += " AND strftime('%Y-%m-%d', createdAt) = ?";
                params.push(filters.date);
            }
            
            query += " ORDER BY createdAt DESC";
            
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    addTask: function(task) {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO tasks (id, title, description, price, deadline, status, createdAt, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [task.id, task.title, task.description, task.price, task.deadline, task.status, task.createdAt, task.color], 
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
        });
    },

    updateTask: function(task) {
        return new Promise((resolve, reject) => {
            if (task.statusOnly && task.id) {
                db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [task.status, task.id], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            } else if (task.deadlineOnly && task.id) {
                db.run(`UPDATE tasks SET deadline = ? WHERE id = ?`, [task.deadline, task.id], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            } else {
                db.run(`UPDATE tasks SET title = ?, description = ?, price = ?, deadline = ?, status = ?, color = ? WHERE id = ?`, 
                    [task.title, task.description, task.price, task.deadline, task.status, task.color, task.id], 
                    function(err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    });
            }
        });
    },

    deleteTask: function(id) {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM tasks WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    archiveTask: function(id) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE tasks SET originalStatus = status, status = 'archived' WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    restoreTask: function(id) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE tasks SET status = COALESCE(originalStatus, 'todo'), originalStatus = NULL WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    clearArchive: function() {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM tasks WHERE status = 'archived'`, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    archiveAllDone: function() {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE tasks SET originalStatus = status, status = 'archived' WHERE status = 'done'`, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
};
