const express = require("express")
const cors = require("cors");
const { Pool } = require("pg")
require('dotenv').config()
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

// Move authenticateUser middleware to the top
const authenticateUser = (req, res, next) => {
    console.log('🔒 Checking authentication');
    console.log('Session:', req.session);
    if (!req.session.user) {
        console.log('❌ Authentication failed: No session user');
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const app = express()

app.use(cors({
    origin: 'https://root-beer-club.vercel.app',
    credentials: true
}));

app.use(express.json());

// Session configuration - update this block
app.use(session({
    store: new pgSession({
        pool,
        tableName: 'session'   // Use the table we created
    }),
    secret: process.env.SESSION_SECRET || 'rootbeerclubsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    },
    name: 'sessionId'
}));

// Add this right after session middleware to debug session data
app.use((req, res, next) => {
    console.log('🔍 Current session:', {
        id: req.sessionID,
        cookie: req.session.cookie,
        user: req.session.user
    });
    next();
});

// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
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

// Test endpoint that doesn't require database
app.get("/test", (req, res) => {
    res.json({ message: "Server is running!", timestamp: new Date().toISOString() })
})

// get all rootbeers with paging
app.get("/rootbeers", async (req, res) => {
  if (req.query.all === 'true') {
    const allResult = await pool.query('SELECT * FROM rootbeers ORDER BY name ASC');
    return res.json({ data: allResult.rows });
  }
    try {
        let page = parseInt(req.query.page) || 1;
        let pageSize = parseInt(req.query.pageSize) || 15;
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 15;

        const offset = (page - 1) * pageSize;

        // Filtering and sorting
        const search = req.query.search ? String(req.query.search).trim() : '';
        const sortBy = req.query.sortBy === 'rating' ? 'rating' : req.query.sortBy === 'name' ? 'name' : 'rootbeer_id';
        const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
        let isRootbeerFilter = req.query.is_rootbeer;
        let ratedOnly = req.query.rated_only === 'true';

        // Build WHERE clause
        let whereClauses = [];
        let values = [];
        let idx = 1;
        if (search) {
            whereClauses.push(`LOWER(name) LIKE $${idx}`);
            values.push(`%${search.toLowerCase()}%`);
            idx++;
        }
        if (isRootbeerFilter === 'true') {
            whereClauses.push(`is_rootbeer = true`);
        } else if (isRootbeerFilter === 'false') {
            whereClauses.push(`is_rootbeer = false`);
        }
        if (ratedOnly) {
            whereClauses.push(`rating > 0`);
        }
        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Get total count for frontend (with filters)
        const countQuery = `SELECT COUNT(*) FROM rootbeers ${whereSQL}`;
        const countResult = await pool.query(countQuery, values);
        const total = parseInt(countResult.rows[0].count, 10);

        // Main query with filters, sorting, and paging
        const mainQuery = `SELECT * FROM rootbeers ${whereSQL} ORDER BY ${sortBy} ${sortOrder} NULLS LAST LIMIT $${idx} OFFSET $${idx + 1}`;
        values.push(pageSize, offset);
        const result = await pool.query(mainQuery, values);

        res.json({
            data: result.rows,
            total,
            page,
            pageSize
        });
    } catch (err) {
        console.error('Error fetching rootbeers:', err);
        res.status(500).json({ error: 'Internal server error' });
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

// Add new user
app.post("/adduser", async (req, res) => {
    try {
        const { firstname, lastname, email, password, is_admin, about } = req.body
        
        // Basic validation
        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        const result = await pool.query(
            'INSERT INTO userinfo (firstname, lastname, email, password, is_admin, about) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [firstname, lastname, email, password, is_admin === true, about || null]
        )
        
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('Error adding user:', err)
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
        const { rootbeer_id, comment, rating, user_id, is_rootbeer } = req.body  
        // Insert the new rating
        const result = await pool.query('INSERT INTO ratings (rootbeer_id, comment, rating, user_id, is_rootbeer) VALUES ($1, $2, $3, $4, $5) RETURNING *', [rootbeer_id, comment, rating, user_id, is_rootbeer]);

        // Get all ratings for this rootbeer
        const ratingsResult = await pool.query('SELECT is_rootbeer FROM ratings WHERE rootbeer_id = $1', [rootbeer_id]);
        const ratings = ratingsResult.rows;
        if (ratings.length > 0) {
            // Count how many say true/false
            const trueCount = ratings.filter(r => r.is_rootbeer === true).length;
            const falseCount = ratings.filter(r => r.is_rootbeer === false).length;
            const total = ratings.length;
            // If more than 50% agree on true or false, update the rootbeers table
            if (trueCount / total > 0.5) {
                await pool.query('UPDATE rootbeers SET is_rootbeer = true WHERE rootbeer_id = $1', [rootbeer_id]);
            } else if (falseCount / total > 0.5) {
                await pool.query('UPDATE rootbeers SET is_rootbeer = false WHERE rootbeer_id = $1', [rootbeer_id]);
            }
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding rating:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
app.put("/users/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params
        const { firstname, lastname, password, is_admin, about } = req.body
        
        const result = await pool.query(
            'UPDATE userinfo SET firstname = $1, lastname = $2, password = $3, is_admin = $4, about = $5 WHERE user_id = $6 RETURNING *',
            [firstname, lastname, password, is_admin === true, about, id]
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
    console.log('📍 Login attempt:', { email: req.body.email });
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            console.log('❌ Login failed: Missing credentials');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT * FROM userinfo WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Login failed: User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password (in real production, use bcrypt)
        if (user.password !== password) {
            console.log('❌ Login failed: Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        const userSession = {
            id: user.user_id,
            email: user.email,
            isAdmin: user.is_admin,
            firstName: user.firstname,
            lastName: user.lastname
        };

        req.session.user = userSession;
        
        console.log('✅ Login successful:', { userId: user.user_id });
        console.log('📍 Session created:', req.session);

        res.json({
            message: 'Login successful',
            user: userSession
        });
    } catch (err) {
        console.error('💥 Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current logged-in user
app.get('/me', authenticateUser, (req, res) => {
    console.log('📍 /me endpoint hit');
    console.log('📍 Session data:', req.session);
    if (req.session.user) {
        console.log('✅ User found in session:', req.session.user.user_id);
        res.json({ user: req.session.user });
    } else {
        console.log('❌ No user in session');
        res.status(401).json({ error: 'Not logged in' });
    }
});
// Logout endpoint
app.post('/logout', (req, res) => {
    console.log('📍 Logout attempt');
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('❌ Logout error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.clearCookie('sessionId');
            console.log('✅ Logout successful');
            res.json({ message: 'Logged out successfully' });
        });
    } else {
        res.json({ message: 'Already logged out' });
    }
});

// Get top 10 ratings for a user
app.get('/ratings/top10', async (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  try {
    const result = await pool.query(
      `SELECT r.rootbeer_id, rb.name, rb.logo, r.rating
       FROM ratings r
       JOIN rootbeers rb ON r.rootbeer_id = rb.rootbeer_id
       WHERE r.user_id = $1
       ORDER BY r.rating DESC
       LIMIT 10`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top 10 rootbeers:', err);
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
        const { rootbeer_id, comment, rating, user_id, is_rootbeer } = req.body;
        const result = await pool.query(
            'UPDATE ratings SET rootbeer_id = $1, comment = $2, rating = $3, user_id = $4, is_rootbeer = $5 WHERE rating_id = $6 RETURNING *',
            [rootbeer_id, comment, rating, user_id, is_rootbeer, rating_id]
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on localhost:${PORT}`))