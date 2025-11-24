# Prisma Database Setup

## Step 1: Create .env file

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="postgresql://root:postgres@localhost:5432/digiwolf?schema=public"
```

**Note:** If your PostgreSQL port is different from 5432, replace `5432` with your actual port (e.g., if `PGSQL_PORT` is 5433, use `localhost:5433`).

## Step 2: Create the database

Make sure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U root -h localhost

# Create the database
CREATE DATABASE digiwolf;

# Exit psql
\q
```

## Step 3: Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `leads` table in your database
- Generate the Prisma Client

## Step 4: Verify the setup

You can verify the setup by checking if the table was created:

```bash
# Connect to your database
psql -U root -h localhost -d digiwolf

# List tables
\dt

# Check the leads table structure
\d leads

# Exit
\q
```

## Server Actions

The project uses Next.js Server Actions for handling lead submissions:

- **`createLead(data)`** - Server action to create a new lead (used by the contact form)
  - Located in `app/actions/leads.ts`
  - Validates required fields and saves to database
  
- **`getLeads()`** - Server action to retrieve all leads (for admin purposes)
  - Located in `app/actions/leads.ts`
  - Returns all leads ordered by creation date (newest first)

## Lead Model

The Lead model includes:
- `id` - Unique identifier (CUID)
- `name` - Lead's full name (required)
- `phone` - Phone number (required)
- `email` - Email address (optional)
- `category` - Business category (required)
- `businessDescription` - Description (optional, required if category is "other")
- `createdAt` - Timestamp when lead was created
- `updatedAt` - Timestamp when lead was last updated

