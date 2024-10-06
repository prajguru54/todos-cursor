// server.js
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Initialize SQLite database
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Create tasks table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           text TEXT NOT NULL,
           date TEXT,
           completed BOOLEAN NOT NULL DEFAULT 0
       )`);
});

// Get all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`All tasks: ${JSON.stringify(rows, null, 2)}`);
        res.json(rows);
    });
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { text, date } = req.body;
    console.log(`Adding new task: ${JSON.stringify(req.body, null, 2)}`);
    db.run('INSERT INTO tasks (text, date, completed) VALUES (?, ?, ?)', [text, date, false], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const newTask = { id: this.lastID, text, date, completed: false };
        console.log(`Task added: ${JSON.stringify(newTask, null, 2)}`);
        res.json(newTask);
    });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, date, completed } = req.body;
    console.log(`Updating task ID ${id}: ${JSON.stringify(req.body, null, 2)}`);
    db.run('UPDATE tasks SET text = ?, date = ?, completed = ? WHERE id = ?', [text, date, completed, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const updatedTask = { id, text, date, completed };
        console.log(`Task updated: ${JSON.stringify(updatedTask, null, 2)}`);
        res.json(updatedTask);
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    console.log(`Deleting task ID ${id}`);
    db.run('DELETE FROM tasks WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`Task ID ${id} deleted`);
        res.json({ message: 'Task deleted' });
    });
});

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app and server for testing
export { app, server };
