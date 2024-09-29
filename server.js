// Import necessary modules
const express = require('express');
const fs = require('fs'); 
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
const port = 3000;

// Use CORS and body-parser
app.use(cors());
app.use(express.json());



// Initialize SQLite Database
const db = new sqlite3.Database('finance.db', (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create Transactions Table
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT,
                    category TEXT,
                    amount REAL,
                    date TEXT
                )
            `, (createErr) => {
                if (createErr) {
                    console.error('Error creating table:', createErr.message);
                } else {
                    console.log('Transactions table created or already exists.');
                }
            });
        });
    }
});



app.post('/api/transactions', (req, res) => {
    const { type, category, amount, date } = req.body;

    db.run(`INSERT INTO transactions (type, category, amount, date) VALUES (?, ?, ?, ?)`, 
        [type, category, amount, date], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, type, category, amount, date });
        });
});



function appendTransactionToFile(transaction) {
    const filePath = path.join(__dirname, 'transactions.json');

    // Read existing transactions or create an empty array if the file doesn't exist
    fs.readFile(filePath, 'utf8', (err, data) => {
        let transactions = [];
        if (!err) {
            try {
                transactions = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
            }
        } else {
            console.error("File read error:", err);
        }

        transactions.push(transaction);

        // Write the updated array back to the JSON file
        fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to file:", writeErr);
            } else {
                console.log("Transaction saved to file:", transaction);
            }
        });
    });
}



// API route to get all transactions

// In your server.js or equivalent file
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
