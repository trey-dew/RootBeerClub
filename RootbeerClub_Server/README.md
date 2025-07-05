# RootBeerClub Server

A Node.js/Express server with PostgreSQL database integration for managing user information.

## Setup Instructions

### 1. Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE rootbeerclub;
   ```
3. **Run the setup script** to create the userinfo table:
   ```bash
   psql -d rootbeerclub -f setup_database.sql
   ```

### 2. Environment Configuration

1. **Update the `.env` file** with your actual PostgreSQL credentials:
   ```
   DB_USER=your_postgres_username
   DB_HOST=localhost
   DB_NAME=rootbeerclub
   DB_PASSWORD=your_actual_password
   DB_PORT=5432
   PORT=5434
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Users

- `GET /users` - Get all users
- `POST /adduser` - Add a new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example Usage

#### Add a new user:
```bash
curl -X POST http://localhost:5434/adduser \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

#### Get all users:
```bash
curl http://localhost:5434/users
```

## Database Schema

The `userinfo` table has the following structure:
- `id` (SERIAL PRIMARY KEY)
- `first_name` (VARCHAR(100))
- `last_name` (VARCHAR(100))
- `email` (VARCHAR(255) UNIQUE)
- `password` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Troubleshooting

1. **Database connection error**: Check your `.env` file and ensure PostgreSQL is running
2. **Port already in use**: Change the PORT in your `.env` file
3. **Table not found**: Run the `setup_database.sql` script

## Security Notes

- This is a basic setup - in production, you should:
  - Hash passwords (use bcrypt)
  - Add input validation
  - Implement proper authentication
  - Use HTTPS
  - Add rate limiting 