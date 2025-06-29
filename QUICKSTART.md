# Quick Start Guide

Get the Smart Supply Chain Management System up and running in minutes!

## 🚀 Quick Setup

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env file with your settings (see below)

# Start the backend
python run.py
```

### 2. Frontend Setup (3 minutes)

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start the frontend
npm start
```

### 3. Database Setup (2 minutes)

```bash
# In backend directory with venv activated
python init_db.py
```

## ⚙️ Environment Configuration

### Backend (.env in backend directory)
```env
DATABASE_URL=postgresql://postgres:password@localhost/smart_supply_chain
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env in root directory)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## 🔑 Default Login

- **Email**: `admin@example.com`
- **Password**: `admin123`

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🐳 Docker Alternative

If you prefer Docker:

```bash
# Backend with PostgreSQL
cd backend
docker-compose up -d

# Frontend (build and serve)
npm run build
npx serve -s build
```

## ✅ Verification

1. **Backend Health Check**: Visit http://localhost:8000/health
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Frontend Login**: Visit http://localhost:3000 and login
4. **Dashboard**: Should show metrics and navigation

## 🆘 Common Issues

### Backend Issues
- **Port 8000 in use**: Change port in `run.py` or kill existing process
- **Database connection**: Ensure PostgreSQL is running
- **Missing dependencies**: Run `pip install -r requirements.txt`

### Frontend Issues
- **Port 3000 in use**: React will automatically use next available port
- **API connection**: Check `REACT_APP_API_URL` in `.env`
- **Build errors**: Clear `node_modules` and reinstall

### Database Issues
- **PostgreSQL not running**: Start PostgreSQL service
- **Connection refused**: Check DATABASE_URL in backend `.env`
- **Tables missing**: Run `python init_db.py`

## 📚 Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Add test data**: Use the API to create suppliers and products
3. **Customize**: Modify the code to fit your needs
4. **Deploy**: Follow the deployment guide in README.md

## 🎯 What's Working

✅ **Authentication**: JWT-based login/logout  
✅ **User Management**: User CRUD operations  
✅ **Supplier Management**: Supplier data and relationships  
✅ **Product Management**: Product catalog and inventory  
✅ **Dashboard**: Real-time metrics and KPIs  
✅ **Responsive UI**: Material UI components  
✅ **API Integration**: Full frontend-backend communication  

## 🔮 Coming Soon

- Order Management
- Purchase Order System
- Advanced Reporting
- Real-time Notifications
- Mobile App
- Advanced Analytics 