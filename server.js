const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Add this line
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public'))); // Add this line

// Database setup
const db = new sqlite3.Database('./database.db');

// Create a table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            father_name TEXT,
            contact_number TEXT,
            location TEXT
        )
    `);
});

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML file
});

// Route to add data
app.post('/add', (req, res) => {
    const { name, father_name, contact_number, location } = req.body;
    const query = `INSERT INTO users (name, father_name, contact_number, location) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, father_name, contact_number, location], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Route to search data
app.get('/search', (req, res) => {
    const name = req.query.name;
    const query = `SELECT * FROM users WHERE name LIKE ?`;
    db.all(query, [`%${name}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});