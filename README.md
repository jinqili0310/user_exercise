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
git clone <repository-url>
cd exercise-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database connection string and other configuration.

4. Run database migrations:
```bash
npx prisma migrate dev
```

This will:
- Create the database if it doesn't exist
- Apply all pending migrations
- Generate Prisma Client
- Seed the database with initial data

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

This will:
- Detect schema changes
- Create a new migration file
- Apply the migration to your database
- Regenerate Prisma Client

#### Applying Migrations in Production

To apply migrations in production:

```bash
npx prisma migrate deploy
```

This will apply all pending migrations without modifying the schema or generating the client.

#### Rolling Back Migrations

Prisma doesn't support automatic rollbacks. To roll back:

1. Create a new migration that reverses the changes
2. Or restore from a database backup

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

The API is documented using OpenAPI/Swagger specification. View the documentation at:

- Local development: `http://localhost:3000/api-docs`
- Production: `https://your-domain.com/api-docs`

Or view the raw specification in `docs/api.yaml`.

## Database Indexes

The application uses the following indexes for better performance:

1. Combined index on `isPublic` and `createdAt` for efficient listing of public exercises
2. Combined index on `creatorId` and `createdAt` for efficient user exercise queries
3. Combined index on `name` and `description` for text search functionality

These indexes are automatically created when running migrations.

## Contributing

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
