# Admin Setup Guide

## 1. Run Database Migrations

First, you need to run Prisma migrations to create the new tables for authentication and update the Lead model:

```bash
npx prisma migrate dev --name add_auth_and_lead_tracking
```

This will create:
- `users` table for admin authentication
- `sessions` table for Better Auth sessions
- `accounts` table for OAuth accounts (if needed)
- `verifications` table for email verification
- Updates to `leads` table with browser tracking and abandoned status

## 2. Generate Prisma Client

After migrations, regenerate the Prisma client:

```bash
npx prisma generate
```

## 3. Create First Admin User

You can create the first admin user using one of these methods:

### Method 1: Using Prisma Studio (Recommended)

```bash
npx prisma studio
```

1. Navigate to the `users` table
2. Click "Add record"
3. Fill in:
   - `name`: Admin name
   - `email`: Admin email (must be unique)
   - `emailVerified`: true
   - `password`: You'll need to hash this (see Method 2)

### Method 2: Using a Script

Create a temporary script to hash the password and create the user:

```typescript
// scripts/create-admin.ts
import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'your-secure-password';
  const name = 'Admin User';

  // Hash password (Better Auth uses its own hashing, but for initial setup)
  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: true,
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', user);
}

createAdmin();
```

**Note:** Better Auth handles password hashing automatically when you sign up through the API. The easiest way is to use the sign-up endpoint first.

### Method 3: Using Better Auth Sign-Up Endpoint

You can create an admin user by calling the sign-up endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

## 4. Access Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/login`

3. Login with your admin credentials

4. You'll be redirected to the admin dashboard at: `http://localhost:3000/admin`

## Admin Dashboard Features

- **Stats Overview**: Total leads, active leads, abandoned leads, and leads by time period
- **Browser Analytics**: See which browsers your leads are using
- **Category Breakdown**: View leads grouped by business category
- **Leads Table**: 
  - Search by name, email, or phone
  - Filter by category
  - Filter by status (active/abandoned)
  - View browser information
  - View creation time
  - Mark leads as abandoned or active
- **Responsive Design**: Works on mobile, tablet, and desktop

## Environment Variables

Make sure you have the following in your `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/digiwolf"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"  # Optional, defaults to localhost:3000
```

## Troubleshooting

### "Session not found" error
- Make sure you've run the migrations
- Check that the `sessions` table exists in your database
- Verify your `DATABASE_URL` is correct

### "Invalid credentials" error
- Verify the user exists in the database
- Check that the email matches exactly
- Ensure the password is correct

### Migration errors
- Make sure your database is running
- Check that the `DATABASE_URL` is correct
- Try resetting the database: `npx prisma migrate reset` (WARNING: This will delete all data)

