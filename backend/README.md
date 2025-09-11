# Scoop Unit Backend CRM System

A comprehensive backend system for Scoop Unit's dog waste removal service, featuring client and employee portals, billing automation, route optimization, and franchise management.

## 🚀 Features

### Core Functionality
- **Multi-tenant Authentication** - Separate portals for clients, employees, and admins
- **Billing & Subscriptions** - Automated recurring billing with Stripe integration
- **Route Optimization** - AI-powered route planning and optimization
- **Real-time Tracking** - GPS tracking for field technicians
- **Mobile API** - Full mobile app support for iOS/Android
- **QuickBooks Sync** - Seamless accounting integration

### Client Portal
- Service subscription management
- Payment method management
- Service history and feedback
- Real-time service tracking
- Invoice access and payments
- Estimation tool for service upgrades

### Employee Portal
- Daily job management and dispatch
- Route optimization and navigation
- Time tracking and payroll calculation
- Performance analytics
- Equipment and vehicle management
- Real-time communication

### Admin Features
- Comprehensive business analytics
- Client and staff management
- Dispatch board and scheduling
- Financial reporting
- Franchise royalty management
- QuickBooks integration

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with refresh tokens
- **Payments**: Stripe for billing and subscriptions
- **Maps**: Google Maps API for routing and geocoding
- **File Storage**: AWS S3
- **Real-time**: Socket.IO for live updates
- **Email**: Nodemailer for notifications
- **Accounting**: QuickBooks Online API

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with PostGIS extension
- Redis 7+
- Docker (optional but recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/K1NGJ4W5/scoopunit-website.git
   cd scoopunit-website/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb scoopunit_db
   
   # Install PostGIS extension
   psql -d scoopunit_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   
   # Run database migrations
   psql -d scoopunit_db -f database/schema.sql
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Deployment

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your .env file with production values
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Check service health**
   ```bash
   docker-compose ps
   curl http://localhost:5000/health
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scoopunit_db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_or_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-s3-bucket-name

# QuickBooks
QB_CONSUMER_KEY=your_quickbooks_consumer_key
QB_CONSUMER_SECRET=your_quickbooks_consumer_secret
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register/client` - Client registration
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/logout` - User logout

### Client Portal API
- `GET /api/client-portal/dashboard` - Client dashboard data
- `GET /api/client-portal/subscription` - Subscription details
- `POST /api/client-portal/payments` - Make payment
- `GET /api/client-portal/service-history` - Service history

### Employee Portal API
- `GET /api/employee-portal/today-jobs` - Today's job assignments
- `PUT /api/employee-portal/jobs/:id/start` - Start job
- `PUT /api/employee-portal/jobs/:id/complete` - Complete job
- `GET /api/employee-portal/routes/today` - Today's optimized route

### Mobile API
- `GET /api/mobile/sync` - Sync data for offline use
- `POST /api/mobile/location/update` - Update GPS location
- `GET /api/mobile/jobs/today` - Today's jobs for mobile app

### Admin API
- `GET /api/admin/analytics/dashboard` - Business analytics
- `GET /api/admin/dispatch/board` - Dispatch board
- `POST /api/admin/routes/optimize` - Optimize routes
- `GET /api/admin/reports/performance` - Performance reports

## 🔄 Route Optimization

The system includes an advanced route optimization engine that:

- Uses Google Maps Distance Matrix API for accurate travel times
- Implements Traveling Salesman Problem (TSP) algorithms
- Considers job priorities (emergency > initial > regular)
- Factors in real-time traffic conditions
- Supports re-optimization when jobs are added/removed
- Provides turn-by-turn navigation for mobile apps

## 💳 Billing & Payments

### Stripe Integration Features
- Automated recurring billing for subscriptions
- One-time payment processing
- Payment method management
- Invoice generation and delivery
- Webhook handling for payment events
- Refund processing
- Failed payment retry logic

### Supported Payment Methods
- Credit/Debit Cards (Visa, Mastercard, Amex)
- ACH Bank Transfers
- Digital Wallets (Apple Pay, Google Pay)

## 📱 Mobile App Support

The backend provides comprehensive APIs for iOS and Android field tech apps:

- Offline job management with sync capabilities
- Real-time GPS tracking and breadcrumbs
- Photo upload for before/after service documentation
- Time tracking with automatic payroll calculation
- Push notifications for job assignments
- Emergency alert system

## 📈 Analytics & Reporting

### Business Intelligence Features
- Revenue analytics and forecasting
- Client retention and churn analysis
- Field technician performance metrics
- Route efficiency optimization
- Customer satisfaction tracking
- Franchise royalty calculations

### Available Reports
- Profit & Loss statements
- Cash flow analysis
- Performance benchmarks
- Growth metrics
- Operational efficiency reports

## 🔗 QuickBooks Integration

Seamless synchronization with QuickBooks Online:

- Automatic customer sync
- Invoice creation and management
- Payment recording
- Chart of accounts mapping
- Real-time financial data sync
- Webhook support for bi-directional updates

## 🏢 Franchise Management

Built-in support for franchise operations:

- Multi-location management
- Territory-based client assignment
- Automated royalty calculations
- Franchise performance analytics
- Revenue sharing reports
- Centralized billing and payments

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- HTTPS enforcement
- Secure password hashing with bcrypt

## 🚀 Deployment

### Production Deployment Options

1. **Vercel (Recommended)**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Automatic deployments on git push

2. **AWS ECS/Fargate**
   - Use provided Dockerfile
   - Set up RDS for PostgreSQL
   - Configure ElastiCache for Redis

3. **DigitalOcean App Platform**
   - Deploy directly from GitHub
   - Managed database options available

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
STRIPE_SECRET_KEY=sk_test_...
QB_SANDBOX=true
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=info
STRIPE_SECRET_KEY=sk_live_...
QB_SANDBOX=false
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: dev@scoopunit.com
- Documentation: [Internal Wiki]
- Issue Tracker: GitHub Issues

---

**Built with ❤️ for Scoop Unit - Professional Pet Waste Removal Services**