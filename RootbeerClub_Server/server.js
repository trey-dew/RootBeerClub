const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
require('dotenv').config()

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
app.use(cors())

// Test endpoint that doesn't require database
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", timestamp: new Date().toISOString() })
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`))