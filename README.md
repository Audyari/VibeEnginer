# VibeEnginer API

Backend API built with **Bun**, **Elysia.JS**, **Drizzle ORM**, and **SQLite**.

---

## 🚀 Features

- ⚡ **Bun** - Fast JavaScript runtime
- 🦊 **Elysia.JS** - Fast, friendly HTTP framework
- 🗄️ **Drizzle ORM** - TypeScript ORM with full type safety
- 💾 **SQLite** - Lightweight embedded database
- 📚 **Swagger UI** - Auto-generated API documentation
- 🔥 **Hot Reload** - Development with `--watch`

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| Bun | Runtime |
| Elysia.JS | HTTP Framework |
| Drizzle ORM | Database ORM |
| libsql | SQLite driver |
| TypeScript | Type safety |

---

## 🛠️ Installation

### Prerequisites

- [Bun](https://bun.sh/) installed

### Setup

```bash
# Install dependencies
bun install

# Generate database schema
bun run db:generate

# Push schema to database
bun run db:push

# (Optional) Seed dummy data
bun run src/db/seed.ts
```

---

## 🏃 Running

### Development

```bash
# Start dev server with hot reload
bun run dev
```

### Production

```bash
# Start production server
bun run start
```

Server will run at: **`http://localhost:3000`**

---

## 📚 API Documentation

### Swagger UI

Open in browser: **`http://localhost:3000/swagger`**

### Swagger JSON

```
http://localhost:3000/swagger/json
```

---

## 📖 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Server health status |

### Users CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

---

## 📝 Usage Examples

### Get All Users

```bash
curl http://localhost:3000/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Audyari",
      "email": "audyari@example.com",
      "password": "password123",
      "createdAt": "2026-03-21T16:28:50.120Z",
      "updatedAt": null
    }
  ]
}
```

### Get User by ID

```bash
curl http://localhost:3000/users/1
```

### Create User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"secret123\"}"
```

### Update User

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Updated\",\"email\":\"john.new@example.com\",\"password\":\"newpass\"}"
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/users/1
```

---

## 🗄️ Database Commands

```bash
# Generate migration files
bun run db:generate

# Push schema to database
bun run db:push

# Open Drizzle Studio (GUI)
bun run db:studio

# Run migrations
bun run db:migrate
```

Drizzle Studio: **`http://localhost:3001`**

---

## 📁 Project Structure

```
VibeEnginer/
├── src/
│   ├── index.ts          # Elysia server entry point
│   ├── db/
│   │   ├── index.ts      # Database connection
│   │   ├── schema.ts     # Drizzle table definitions
│   │   ├── seed.ts       # Dummy data seeder
│   │   └── migrate.ts    # Migration script
│   ├── Router/
│   │   └── users-route.ts # API routes
│   ├── services/
│   │   └── users-services.ts # Business logic
│   └── config/
│       └── env.ts        # Environment variables
├── drizzle/              # Migration files
├── drizzle.config.ts     # Drizzle configuration
├── .env                  # Environment variables
├── sqlite.db             # SQLite database file
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
# Database
DB_URL=file:sqlite.db

# Server
PORT=3000
HOST=localhost
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `file:sqlite.db` | SQLite database URL |
| `PORT` | `3000` | Server port |
| `HOST` | `localhost` | Server host |

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/health

# Get all users
curl http://localhost:3000/users

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"123\"}"
```

---

## 📝 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `bun run dev` | Start dev server with watch |
| `start` | `bun run start` | Start production server |
| `db:generate` | `bun run db:generate` | Generate migration files |
| `db:push` | `bun run db:push` | Push schema to database |
| `db:migrate` | `bun run db:migrate` | Run migrations |
| `db:studio` | `bun run db:studio` | Open Drizzle Studio |

---

## 🔧 Troubleshooting

### Database locked error

```bash
# Stop all Bun processes
taskkill /F /IM bun.exe

# Then run db commands
bun run db:push
```

### Reset database

```bash
# Delete database file
del sqlite.db

# Regenerate and push
bun run db:generate
bun run db:push

# Seed data (optional)
bun run src/db/seed.ts
```

---

## 📄 License

MIT

---

## 👤 Author

Made with ❤️ using Bun + Elysia + Drizzle
