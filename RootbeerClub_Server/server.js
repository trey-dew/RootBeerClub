const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
require('dotenv').config()
const session = require('express-session');

const app = express()

// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'RootBeerClub',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5434,
    ssl: false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
})

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err)
        console.log('Server will start but database operations will fail')
    } else {
        console.log('Database connected successfully')
    }
})

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(session({
    secret: process.env.SESSION_SECRET || 'rootbeerclubsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Test endpoint that doesn't require database
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", timestamp: new Date().toISOString() })
})

// get all rootbeers
app.get("/rootbeers", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rootbeers')
        res.json(result.rows)
    } catch (err) {
        console.error('Error fetching rootbeers:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// get all ratings
app.get("/ratings", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ratings')
        res.json(result.rows)
    } catch (err) {
        console.error('Error fetching ratings:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get all users
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM userinfo')
        res.json(result.rows)
    } catch (err) {
        console.error('Error fetching users:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// add new rootbeers
app.post("/rootbeers", async (req, res) => {
    try {
        const { name, rating, date_tested, logo, nutrition_facts, is_rootbeer, rootbeer_facts} = req.body
        const result = await pool.query('INSERT INTO rootbeers (name, rating, date_tested, logo, nutrition_facts, is_rootbeer, rootbeer_facts) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [name, rating, date_tested, logo, nutrition_facts, is_rootbeer, rootbeer_facts])
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('Error adding rootbeer:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// add new ratings
app.post("/ratings", async (req, res) => {
    try {
        const { rootbeer_id, comment, rating, user_id } = req.body  
        const result = await pool.query('INSERT INTO ratings (rootbeer_id, comment, rating, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [rootbeer_id, comment, rating, user_id])
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('Error adding rating:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Add new user
app.post("/adduser", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body
        
        // Basic validation
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        const result = await pool.query(
            'INSERT INTO userinfo (firstname, lastname, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstname, lastname, email, password]
        )
        
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('Error adding user:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// get rootbeer by id
app.get("/rootbeers/:rootbeer_id", async (req, res) => {
    try {
        const { rootbeer_id } = req.params
        const result = await pool.query('SELECT * FROM rootbeers WHERE rootbeer_id = $1', [rootbeer_id])
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rootbeer not found' })
        }
        res.json(result.rows[0])
    } catch (err) {
        console.error('Error fetching rootbeer:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// update rootbeer
app.put("/rootbeers/:rootbeer_id", async (req, res) => {
    try {
        const { rootbeer_id } = req.params;
        const { name, rating, date_tested, logo, nutrition_facts, is_rootbeer, rootbeer_facts } = req.body;
        const result = await pool.query(
            'UPDATE rootbeers SET name = $1, rating = $2, date_tested = $3, logo = $4, nutrition_facts = $5, is_rootbeer = $6, rootbeer_facts = $7 WHERE rootbeer_id = $8 RETURNING *',
            [name, rating, date_tested, logo, nutrition_facts, is_rootbeer, rootbeer_facts, rootbeer_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rootbeer not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating rootbeer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete rootbeer
app.delete("/rootbeers/:rootbeer_id", async (req, res) => {
    try {
        const { rootbeer_id } = req.params;
        const result = await pool.query('DELETE FROM rootbeers WHERE rootbeer_id = $1 RETURNING *', [rootbeer_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rootbeer not found' });
        }
        res.json({ message: 'Rootbeer deleted successfully' });
    } catch (err) {
        console.error('Error deleting rootbeer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get rating by id
app.get("/ratings/:rating_id", async (req, res) => {
    try {
        const { rating_id } = req.params;
        const result = await pool.query('SELECT * FROM ratings WHERE rating_id = $1', [rating_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching rating:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// update rating
app.put("/ratings/:rating_id", async (req, res) => {
    try {
        const { rating_id } = req.params;
        const { rootbeer_id, comment, rating, user_id } = req.body;
        const result = await pool.query(
            'UPDATE ratings SET rootbeer_id = $1, comment = $2, rating = $3, user_id = $4 WHERE rating_id = $5 RETURNING *',
            [rootbeer_id, comment, rating, user_id, rating_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating rating:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete rating
app.delete("/ratings/:rating_id", async (req, res) => {
    try {
        const { rating_id } = req.params;
        const result = await pool.query('DELETE FROM ratings WHERE rating_id = $1 RETURNING *', [rating_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rating not found' });
        }
        res.json({ message: 'Rating deleted successfully' });
    } catch (err) {
        console.error('Error deleting rating:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM userinfo WHERE user_id = $1', [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json(result.rows[0])
    } catch (err) {
        console.error('Error fetching user:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Update user
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { firstname, lastname, password } = req.body
        
        const result = await pool.query(
            'UPDATE userinfo SET firstname = $1, lastname = $2, password = $3 WHERE user_id = $4 RETURNING *',
            [firstname, lastname, password, id]
        )
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json(result.rows[0])
    } catch (err) {
        console.error('Error updating user:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete user
app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM userinfo WHERE user_id = $1 RETURNING *', [id])
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json({ message: 'User deleted successfully' })
    } catch (err) {
        console.error('Error deleting user:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Login endpoint
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const result = await pool.query(
            'SELECT * FROM userinfo WHERE email = $1 AND password = $2',
            [email, password]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        delete user.password;
        req.session.user = user;
        res.json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current logged-in user
app.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});
// Logout endpoint
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out' });
    });
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`))