# AI Recipe Builder

An AI-powered web application that generates custom recipes based on user ingredients, preferences, and dietary needs. Built with Next.js 14, TypeScript, and Google Gemini AI.

## Features

- **AI Recipe Generation**: Get personalized recipe suggestions using Google Gemini AI
- **Nutritional Tracking**: Accurate nutritional information via USDA FoodData Central API
- **Dual Authentication**: Sign in with Google OAuth or Email/Password
- **Pantry Management**: Save your staple ingredients for better recipe suggestions
- **Dietary Preferences**: Set vegetarian, vegan, pescatarian options and allergies
- **Recipe Book**: Save and organize your favorite recipes
- **Smart Search**: Filter recipes by name, ingredient, cuisine type, and more

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Vercel Postgres
- **AI**: Google Gemini API (1.5 Flash)
- **Nutrition**: USDA FoodData Central API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google OAuth credentials
- Google Gemini API key
- USDA API key
- Vercel Postgres database (or compatible PostgreSQL)

### Installation

1. **Clone the repository** (or use your existing directory):
   ```bash
   cd recipe-builder-v3
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `GOOGLE_GEMINI_API_KEY`: From Google AI Studio
   - `USDA_API_KEY`: From https://fdc.nal.usda.gov/api-key-signup.html
   - Postgres credentials: Automatically provided by Vercel

4. **Set up the database**:

   If using Vercel Postgres:
   - Create a Postgres database in your Vercel dashboard
   - Environment variables will be automatically populated
   - Run the schema:
     ```bash
     # Connect to your database and run:
     psql $POSTGRES_URL < lib/db/schema.sql
     ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
recipe-builder-v3/
├── app/
│   ├── api/
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── recipes/      # Recipe generation APIs
│   │   └── nutrition/    # Nutrition calculation
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── my-kitchen/       # Pantry management (TO BE BUILT)
│   ├── builder/          # Recipe builder interface (TO BE BUILT)
│   ├── recipe-ideas/     # Generated recipe ideas (TO BE BUILT)
│   ├── recipe/           # Recipe display pages (TO BE BUILT)
│   └── recipe-book/      # Saved recipes (TO BE BUILT)
├── components/
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Auth-related components (TO BE BUILT)
│   ├── recipe/           # Recipe components (TO BE BUILT)
│   ├── pantry/           # Pantry components (TO BE BUILT)
│   └── builder/          # Builder components (TO BE BUILT)
├── lib/
│   ├── db/               # Database queries & schema
│   ├── auth/             # NextAuth configuration
│   ├── ai/               # Gemini API integration (TO BE BUILT)
│   ├── nutrition/        # USDA API & calculations (TO BE BUILT)
│   └── utils/            # Helper functions (TO BE BUILT)
└── types/                # TypeScript type definitions
```

## Current Implementation Status

### ✅ Completed
- [x] Next.js 14+ project setup with TypeScript
- [x] Tailwind CSS configuration
- [x] Environment variables structure
- [x] TypeScript types and interfaces
- [x] Database schema with indexes
- [x] NextAuth configuration (Google OAuth + Email/Password)
- [x] User authentication API routes
- [x] Login and Signup pages
- [x] Basic UI components (Button, Input, Card)
- [x] Database query functions

### 🚧 To Be Built (Next Steps)
- [ ] My Kitchen page (pantry + dietary preferences)
- [ ] Recipe Builder page with icon selectors
- [ ] Gemini AI integration for recipe generation
- [ ] SessionStorage state management utilities
- [ ] Recipe Ideas display page
- [ ] Full Recipe generation and display
- [ ] USDA API integration for nutrition
- [ ] Ingredient mapping file
- [ ] Unit conversion utilities
- [ ] Save recipe functionality
- [ ] Recipe Book page with search/filter
- [ ] Navigation bar component
- [ ] Error boundaries and loading states

## API Keys Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy to `.env.local`

### USDA FoodData Central
1. Go to https://fdc.nal.usda.gov/api-key-signup.html
2. Sign up for a free API key
3. Copy to `.env.local`

## Development Notes

- The project uses the Next.js App Router (not Pages Router)
- Authentication is handled via NextAuth.js with JWT strategy
- Recipe generation uses sessionStorage for temporary state
- Database queries use Vercel Postgres SDK with SQL template literals
- All API routes are in the `app/api` directory

## Database Schema

The database includes four main tables:
- `users`: User accounts (supports both OAuth and email/password)
- `pantry_items`: User's saved pantry staples
- `dietary_preferences`: User dietary restrictions and preferences
- `saved_recipes`: User's saved recipes with full nutrition data

See `lib/db/schema.sql` for complete schema.

## Next Development Steps

1. Build the My Kitchen page for pantry management
2. Create the Recipe Builder interface with icon selectors
3. Integrate Google Gemini API for recipe generation
4. Implement USDA API for nutritional calculations
5. Build recipe display and saving functionality
6. Add search and filtering to Recipe Book

## License

ISC

## Support

For issues or questions, please check the specification file: `recipe-app-spec.md`
