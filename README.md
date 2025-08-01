# Brazucas em Cork - Community Web Platform

A full-stack web platform built for the Brazilian community in Cork, Ireland. This project features a modern React frontend with TypeScript and a serverless backend using Netlify Functions.

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

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **SCSS** for styling
- **AnimeJS** for animations
- **Axios** for API calls
- **Jest + React Testing Library** for testing

### Backend
- **Netlify Serverless Functions**
- **TypeScript** for type safety
- **JWT** for authentication
- **Zod** for input validation
- **bcryptjs** for password hashing
- **Jest** for testing

### Development & Deployment
- **Netlify** for hosting and deployment
- **ESLint + Prettier** for code quality
- **Concurrently** for development workflow

## 📁 Project Structure

```
brazucas/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── styles/          # SCSS stylesheets
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Netlify serverless functions
│   ├── src/
│   │   ├── __tests__/       # Test files
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── repositories.ts  # Data access layer
│   │   ├── services.ts      # Business logic layer
│   │   ├── types.ts         # Type definitions
│   │   ├── utils.ts         # Utility functions
│   │   ├── validation.ts    # Input validation schemas
│   │   ├── register.ts      # Registration endpoint
│   │   ├── login.ts         # Login endpoint
│   │   ├── me.ts           # User profile endpoint
│   │   ├── news.ts         # News CRUD endpoints
│   │   └── ads.ts          # Advertisement endpoints
│   └── package.json
├── netlify.toml            # Netlify configuration
└── package.json            # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
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
   JWT_SECRET=your-super-secure-jwt-secret-key
   JWT_EXPIRES_IN=24h
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend dev server on `http://localhost:3000`
   - Backend functions on `http://localhost:8888`

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
```

## 🔧 API Endpoints

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

## 🚀 Deployment

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
3. **Set environment variables** in Netlify dashboard
4. **Deploy**

The `netlify.toml` file is already configured for:
- Frontend build process
- Serverless function directory
- Redirects for SPA routing and API endpoints

### Environment Variables
Set these in your Netlify dashboard:
```
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=24h
```

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

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Email notifications
- [ ] Image upload functionality
- [ ] Advanced user profiles
- [ ] Content commenting system
- [ ] Multi-language support (PT/EN)
- [ ] PWA capabilities
- [ ] Push notifications

---

Made with ❤️ for the Brazilian community in Cork, Ireland
