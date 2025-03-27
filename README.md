# User Exercise Tracker

A web application for managing, sharing, and discovering exercises.

## Features

- Create, edit, and delete exercises
- Public and private exercise visibility
- Favorite and save exercises
- Search and filter exercises
- Sort by various criteria
- User authentication

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jinqili0310/user_exercise.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

`.env` file already exists.

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

### Database Migrations

#### Creating a New Migration

When you make changes to the Prisma schema (`prisma/schema.prisma`), create a new migration:

```bash
npx prisma migrate dev --name <migration-name>
```

#### Applying Migrations in Production

To apply migrations in production:

```bash
npx prisma migrate deploy
```

### Running Tests

Run the test suite:

```bash
npm test
```

For coverage report:

```bash
npm test -- --coverage
```

## API Documentation

Raw specification in `docs/api.yaml`.

## Database Indexes

1. Combined index on `isPublic` and `createdAt` for efficient listing of public exercises
2. Combined index on `creatorId` and `createdAt` for efficient user exercise queries
3. Combined index on `name` and `description` for text search functionality
