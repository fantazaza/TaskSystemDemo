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
                    color TEXT
                )`);

                // We try adding color column, ignoring error if it exists (for backward compatibility)
                db.run(`ALTER TABLE tasks ADD COLUMN color TEXT`, (err) => {
                    resolve();
                });
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
            } else {
                // Default to everything
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
            db.run(`UPDATE tasks SET status = 'archived' WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },

    restoreTask: function(id) {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE tasks SET status = 'done' WHERE id = ?`, [id], function(err) {
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
            db.run(`UPDATE tasks SET status = 'archived' WHERE status = 'done'`, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
};
