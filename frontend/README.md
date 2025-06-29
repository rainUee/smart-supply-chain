# Smart Supply Chain Management System

A comprehensive web-based supply chain management platform designed for small to medium businesses to improve inventory visibility, supplier relationships, and operational efficiency.

## 🎯 Project Overview

### Problem Statement
Small to medium businesses struggle with supply chain visibility and inventory management. Manual tracking leads to stockouts, overstocking, and poor supplier relationships. Traditional systems are expensive and complex to implement.

### Business Case
- **Target Users**: Small retail businesses, warehouse managers, procurement teams
- **Value Proposition**:
  - Reduce inventory costs by 20% through better tracking
  - Prevent stockouts with automated alerts
  - Improve supplier relationships with performance tracking
  - Real-time visibility across multiple locations

## ✨ Key Features

### 📦 Inventory Management
- **Real-time Stock Tracking**: Track inventory levels across multiple warehouses
- **Product Management**: Add/edit product information (SKU, description, price)
- **Automated Alerts**: Low stock notifications and reorder point management
- **Category Organization**: Categorize products for better organization
- **Cost Tracking**: Monitor product costs and pricing

### 🏢 Supplier Management
- **Supplier Portal**: Maintain supplier contact information and performance ratings
- **Performance Tracking**: Monitor delivery rates, quality ratings, and responsiveness
- **Purchase Order System**: Create and track purchase orders with suppliers
- **Invoice Management**: Track supplier invoices and payment status

### 📋 Order Processing
- **Order Management**: Process customer orders with inventory availability checks
- **Shipping Integration**: Calculate shipping costs and generate labels
- **Status Tracking**: Real-time order status updates
- **Picking Lists**: Generate warehouse picking lists

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Real-time metrics and KPIs
- **Inventory Reports**: Stock levels, aging, and turnover analysis
- **Sales Performance**: Revenue trends and product performance
- **Supplier Analytics**: Performance metrics and cost analysis
- **Custom Reports**: Generate and schedule custom reports

### 🔔 Notification System
- **Real-time Alerts**: Low stock, order updates, and supplier alerts
- **Automated Notifications**: System-generated alerts for critical events
- **Filterable Notifications**: Organize notifications by type and priority

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Python 3.8+ (for backend)
- PostgreSQL (for database)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database and JWT settings
   ```

5. **Start the backend**
   ```bash
   # Option 1: Using the start script
   chmod +x start.sh
   ./start.sh
   
   # Option 2: Manual start
   python run.py
   ```

6. **Initialize database**
   ```bash
   python init_db.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..  # If you're in backend directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env to set REACT_APP_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Default Login Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🏗️ System Architecture

### Backend Technologies
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **Alembic**: Database migrations
- **Pydantic**: Data validation
- **JWT**: Authentication and authorization
- **Boto3**: AWS SDK integration

### Frontend Technologies
- **React 19**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Material UI**: Professional UI components
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Axios**: HTTP client for API communication

### Key Components

#### Backend Modules
- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: User CRUD operations
- **Supplier Management**: Supplier data and relationships
- **Product Management**: Product catalog and inventory
- **Database Models**: SQLAlchemy ORM models
- **API Routes**: RESTful API endpoints

#### Frontend Modules
- **Dashboard**: Real-time analytics and KPIs
- **Inventory Management**: Product and stock management
- **Supplier Management**: Supplier relationships and performance
- **Order Management**: Customer order processing
- **Purchase Order Management**: Supplier purchase orders
- **Reports**: Comprehensive reporting system

### Data Flow
1. **API Service Layer**: Centralized API communication with authentication
2. **State Management**: React Query for server state
3. **Component State**: Local component state management
4. **Real-time Updates**: Polling and WebSocket integration (planned)

## 📱 User Interface

### Dashboard
- **Key Metrics**: Inventory value, low stock items, pending orders
- **Charts**: Revenue trends, inventory distribution, warehouse utilization
- **Real-time Updates**: Live data refresh

### Inventory Management
- **Product List**: Searchable and filterable product table
- **Stock Updates**: Real-time quantity updates
- **Status Indicators**: Visual stock level indicators
- **Bulk Operations**: Mass update capabilities

### Supplier Management
- **Supplier Cards**: Visual supplier information display
- **Performance Metrics**: Rating and delivery performance
- **Contact Information**: Easy access to supplier details

### Order Management
- **Order Tracking**: Real-time order status
- **Customer Information**: Integrated customer data
- **Payment Status**: Payment tracking and management

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/smart_supply_chain

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:3000"]

# AWS Settings (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### Frontend Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_DEBUG=false
```

### API Configuration
The system uses a RESTful API backend with JWT authentication. The API configuration is handled in `src/services/apiService.ts`:

```typescript
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

## 📊 Business Intelligence

### Key Performance Indicators (KPIs)
- **Inventory Turnover Rate**: How quickly inventory is sold
- **Order Fulfillment Rate**: Percentage of orders delivered on time
- **Supplier Performance**: Delivery reliability and quality metrics
- **Cost Analysis**: Inventory carrying costs and supplier costs
- **Revenue Trends**: Sales performance and growth metrics

### Reporting Capabilities
- **Scheduled Reports**: Automated report generation
- **Export Formats**: PDF, Excel, and CSV export options
- **Custom Filters**: Date ranges, categories, and status filters
- **Chart Integration**: Visual data representation

## 🔒 Security Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh
- **Role-based Access Control**: Different permissions for different user roles
- **Secure API Communication**: HTTPS and proper headers

### Data Protection
- **Input Validation**: Client-side and server-side validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery protection

## 📈 Scalability & Performance

### Performance Optimizations
- **React Query Caching**: Intelligent data caching
- **Lazy Loading**: Component and route lazy loading
- **Optimized Bundles**: Code splitting and tree shaking
- **Responsive Design**: Mobile-first responsive layout
- **Database Indexing**: Optimized database queries

### Scalability Features
- **Modular Architecture**: Scalable component structure
- **Microservices Ready**: Backend designed for microservices
- **Database Migrations**: Version-controlled database schema
- **API Versioning**: Backward-compatible API changes

## 🐳 Docker Deployment

### Backend Docker
```bash
cd backend
docker-compose up -d
```

### Frontend Docker
```bash
# Build the frontend
npm run build

# Serve with nginx or similar
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
npm test
```

## 📝 API Documentation

Once the backend is running, you can access:
- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if PostgreSQL is running
   - Verify environment variables in `.env`
   - Ensure all dependencies are installed

2. **Frontend can't connect to backend**
   - Verify backend is running on port 8000
   - Check CORS settings in backend
   - Ensure `REACT_APP_API_URL` is set correctly

3. **Database connection issues**
   - Check PostgreSQL service status
   - Verify database credentials in `.env`
   - Run database migrations: `alembic upgrade head`

4. **Authentication issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify SECRET_KEY in backend `.env`

## 🔮 Roadmap

### Upcoming Features
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Third-party system integrations
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: Custom report builder

### Performance Improvements
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Progressive Web App features
- **Advanced Caching**: Intelligent data caching strategies

---

**Built with ❤️ for modern supply chain management**