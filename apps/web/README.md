# RunState Frontend

Modern Next.js frontend for RunState website monitoring platform.

## Setup

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

## Build & Deploy

```bash
npm run build
npm start
```

## Architecture

### Directory Structure

- **app/** - Next.js pages and layouts (App Router)
- **components/** - Reusable React components
- **lib/** - Utilities, API client, helpers
- **stores/** - Zustand state management
- **types/** - TypeScript type definitions
- **hooks/** - Custom React hooks

### State Management

Three Zustand stores:

1. **auth-store** - User authentication & tokens
2. **websites-store** - Website data & monitoring info
3. **ui-store** - UI state (modals, toasts, sidebar)

### API Integration

- Single API client in `lib/api.ts`
- Typed API responses matching backend DTOs
- Automatic Bearer token injection
- Error handling with custom `APIError` class

### Styling

- Tailwind CSS for styling
- Custom components with variant support
- Mobile-responsive design

## Key Features

- ✅ User authentication (signin/signup)
- ✅ Protected dashboard
- ✅ Website CRUD operations
- ✅ Real-time status monitoring
- ✅ Response time tracking
- ✅ Incident history
- ✅ Notification logs
- ✅ Public status page
- ✅ Toast notifications
- ✅ Loading/error states

## Development Tips

1. Run both backend and frontend:
   ```bash
   # Terminal 1 - Backend
   cd apps/api-go
   go run main.go

   # Terminal 2 - Frontend
   cd apps/web
   npm run dev
   ```

2. Frontend runs on `http://localhost:3000`
3. Backend API on `http://localhost:8080/api/v1`

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```