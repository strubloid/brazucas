# Brazucas em Cork - Community Web Platform

A full-stack web platform built for the Brazilian community in Cork, Ireland. This project features a modern React frontend with TypeScript and an Express.js backend with MongoDB.

## 🚀 Features

### 🔐 Authentication & Authorization
- **Role-based access control** with 3 user types:
  - **Normal User**: Browse and read news posts
  - **Admin**: Create, edit, and delete news posts
  - **Advertiser**: Submit advertisements for approval
- **JWT-based authentication** with secure token handling
- **Protected routes** based on user roles

### 📰 News Management
- **Admin dashboard** for content management
- **CRUD operations** for news posts
- **Rich text content** with image support
- **Published/draft status** for content control

### 📢 Advertisement System
- **Single ad per advertiser** policy
- **Media support**: Images or YouTube videos
- **Content validation** (500 character limit)
- **Approval workflow** for quality control

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Smooth animations** using AnimeJS
- **Brazilian-inspired color palette**
- **Modern design** targeting 18-40 age group
- **React Router v6** with future flags for v7 compatibility

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router v6** with future flags (v7_startTransition, v7_relativeSplatPath)
- **SCSS** for styling
- **AnimeJS** for animations
- **Axios** for API calls
- **Jest + React Testing Library** for testing

### Backend
- **Express.js** server with TypeScript
- **MongoDB** with custom repository pattern
- **JWT** for authentication
- **Zod** for input validation
- **bcryptjs** for password hashing
- **Jest** for testing
- **CORS** enabled for cross-origin requests

### Development & Deployment
- **ESLint + Prettier** for code quality
- **Concurrently** for development workflow
- **WSL compatibility** with localhost mapping for cross-environment development

## 📁 Project Structure

```
brazucas/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Shared UI components
│   │   │   └── layout/      # Layout components
│   │   ├── context/         # React Context providers
│   │   │   ├── AnimationContext.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAnimateOnMount.ts
│   │   │   ├── useAsync.ts
│   │   │   └── useStatusSystem.ts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   │   ├── apiClient.ts
│   │   │   ├── authService.ts
│   │   │   ├── newsService.ts
│   │   │   ├── serviceCategoryService.ts
│   │   │   └── statusSystemService.ts
│   │   ├── styles/          # SCSS stylesheets
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── __tests__/       # Test files
│   │   ├── database/        # Database configurations
│   │   │   └── migrations/  # Database migration scripts
│   │   ├── routes/          # Express route handlers
│   │   ├── types/           # Backend type definitions
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── database.ts      # Database connection
│   │   ├── server.ts        # Express server configuration
│   │   ├── repositories.ts  # Data access layer
│   │   ├── mongoRepositories.ts # MongoDB repositories
│   │   ├── services.ts      # Business logic layer
│   │   ├── types.ts         # Type definitions
│   │   ├── utils.ts         # Utility functions
│   │   ├── validation.ts    # Input validation schemas
│   │   ├── register.ts      # Registration endpoint
│   │   ├── login.ts         # Login endpoint
│   │   ├── me.ts           # User profile endpoint
│   │   ├── news.ts         # News CRUD endpoints
│   │   ├── ads.ts          # Advertisement endpoints
│   │   ├── service-categories.ts # Service category endpoints
│   │   ├── admin-stats.ts  # Admin statistics
│   │   └── status-system*.ts # Status management system
│   └── package.json
├── postman-collection.json  # Postman API testing collection
├── netlify.toml            # Netlify deployment configuration
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/brazucas.git
   cd brazucas
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```bash
   # Backend/.env
   NODE_ENV=development
   PORT=4444
   MONGODB_URI=mongodb://localhost:27017/brazucas
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRES_IN=24h
   SESSION_SECRET=your-session-secret-key
   ADMIN_SECRET_KEY=your-admin-secret-key
   ```

4. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually:
   # Backend only
   cd backend && npm start
   
   # Frontend only  
   cd frontend && npm start
   ```

   This will start:
   - Frontend dev server on `http://localhost:3000`
   - Backend Express server on `http://localhost:4444`

### WSL (Windows Subsystem for Linux) Setup

If you're using WSL, the project includes automatic localhost mapping:

1. **The backend server binds to `0.0.0.0`** for cross-environment accessibility
2. **WSL curl function** automatically maps `localhost` to Windows host IP
3. **Test connectivity:**
   ```bash
   # From WSL terminal
   curl http://localhost:4444/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

### Development Commands

```bash
# Start development servers
npm run dev

# Build for production
npm run build

# Run all tests
npm run test

# Run linting
npm run lint

# Install dependencies for all packages
npm run install:all

# Backend specific commands
cd backend
npm start          # Start Express server
npm run build      # Build TypeScript
npm test          # Run backend tests

# Frontend specific commands  
cd frontend
npm start         # Start React dev server
npm run build     # Build for production
npm test          # Run frontend tests
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user profile

### News (Admin only for POST/PUT/DELETE)
- `GET /api/news` - Get all published news
- `GET /api/news?id={id}` - Get specific news post
- `POST /api/news` - Create news post (Admin)
- `PUT /api/news` - Update news post (Admin)
- `DELETE /api/news?id={id}` - Delete news post (Admin)

### Advertisements
- `GET /api/ads` - Get all approved ads
- `GET /api/ads?id={id}` - Get specific ad
- `POST /api/ads` - Submit new ad (Advertiser)

### Service Categories
- `GET /api/service-categories` - Get all active service categories
- `POST /api/service-categories` - Create service category (Admin)
- `PUT /api/service-categories` - Update service category (Admin)
- `DELETE /api/service-categories?id={id}` - Delete service category (Admin)

### Admin Statistics
- `GET /api/admin-stats` - Get admin dashboard statistics

### Status System
- `GET /api/status-system-get` - Get complete status system
- `GET /api/status-system-contextual` - Get context-specific statuses
- `POST /api/status-system-change` - Change content status

## 🔬 API Testing

### Postman Collection
A comprehensive Postman collection is included (`postman-collection.json`) with:
- **Health checks** for server connectivity
- **Authentication flows** (register, login, profile)
- **CRUD operations** for all entities
- **Admin operations** with proper authorization
- **Environment variables** for easy configuration

Import the collection into Postman and set these environment variables:
- `baseUrl`: `http://localhost:4444`
- `authToken`: `your-jwt-token-here`

### Manual Testing with curl
```bash
# Health check
curl http://localhost:4444/health

# Get service categories
curl http://localhost:4444/api/service-categories

# Login (get auth token)
curl -X POST http://localhost:4444/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 🧪 Testing

The project includes comprehensive test coverage for both frontend and backend:

### Backend Tests
```bash
cd backend && npm test
```

### Frontend Tests
```bash
cd frontend && npm test
```

### Test Coverage
- **Authentication logic**
- **Role-based access control**
- **CRUD operations**
- **Input validation**
- **Business logic**
- **React components**
- **API integration**

## 🛠️ Development Environment

### Supported Platforms
- **Windows** with PowerShell
- **WSL (Windows Subsystem for Linux)** with automatic localhost mapping
- **macOS** and **Linux** native development

### Cross-Platform Considerations
- **Server binding**: Express server binds to `0.0.0.0` for accessibility across environments
- **WSL networking**: Automatic localhost-to-Windows-host mapping in WSL terminals
- **Environment variables**: Consistent across all platforms
- **Port configuration**: Backend runs on port 4444, frontend on port 3000

### VSCode Extensions (Recommended)
- **TypeScript and JavaScript Language Features**
- **ES7+ React/Redux/React-Native snippets**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Prettier - Code formatter**
- **ESLint**

## 🎨 Design Guidelines

### Color Palette
- **Primary Green**: `#28a745` (Brazilian flag green)
- **Secondary Yellow**: `#ffc107` (Brazilian flag yellow)
- **Accent Blue**: `#007bff`
- **Text**: Various grays for hierarchy

### Typography
- **Font**: Inter (fallback to system fonts)
- **Heading weights**: 700-800
- **Body weight**: 400-600

### Animations
- **Fade in** for page loads
- **Slide in** for content sections
- **Hover effects** for interactive elements
- **Smooth transitions** throughout

## 🔒 Security Features

- **Password hashing** with bcryptjs
- **JWT token authentication**
- **Input validation** with Zod schemas
- **Role-based authorization**
- **CORS protection**
- **XSS protection** via React's built-in sanitization

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🌟 Key Features Implementation

### Role-Based Access Control
```typescript
// Protected route example
<ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
  <Dashboard />
</ProtectedRoute>
```

### Animation System
```typescript
// Animation hook usage
const ref = useAnimateOnMount('fadeIn', 200);
return <div ref={ref}>Content</div>;
```

### Type Safety
- **100% TypeScript** in both frontend and backend
- **Shared type definitions**
- **Compile-time error checking**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation
- Follow TypeScript best practices
- Use SOLID principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation
- Review the test files for usage examples

## 🎯 Future Enhancements

- [ ] Advanced user profiles with profile pictures
- [ ] Content commenting and interaction system
- [ ] Multi-language support (PT/EN)
- [ ] PWA capabilities with offline support
- [ ] Push notifications for new content
- [ ] Advanced search and filtering
- [ ] Content analytics and reporting
- [ ] Social media integration
- [ ] Email newsletter functionality
- [ ] Event management system
- [ ] Job posting board
- [ ] Real-time chat or forum
- [ ] Mobile app development

## 🔄 Recent Updates

### Latest Changes (August 2025)
- ✅ **React Router Future Flags**: Added v7 compatibility (v7_startTransition, v7_relativeSplatPath)
- ✅ **API Endpoint Consistency**: Standardized all endpoints with `/api/` prefix
- ✅ **WSL Networking Support**: Automatic localhost mapping for cross-environment development
- ✅ **Postman Collection**: Comprehensive API testing collection with 685 lines
- ✅ **Server Binding**: Express server now binds to `0.0.0.0` for accessibility
- ✅ **Error Resolution**: Fixed "message port closed" errors and connectivity issues
- ✅ **Documentation Updates**: Complete documentation refresh with current project state

### Technical Improvements
- **TypeScript Error Resolution**: All compilation errors fixed
- **Build Process**: Optimized build pipeline for both frontend and backend
- **Development Workflow**: Improved cross-platform development experience
- **API Testing**: Complete test coverage via Postman collection

---

Made with ❤️ for the Brazilian community in Cork, Ireland
