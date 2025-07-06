# 🏪 Pasargad Prints E-commerce Platform

A full-stack e-commerce platform for custom 3D printed items built with Django REST Framework and React.

## 🚀 Features

- **Product Management**: Browse, search, and filter 3D printed products
- **Shopping Cart**: Add items, update quantities, and manage cart
- **User Authentication**: Register, login, and manage user profiles
- **Secure Checkout**: Multi-step checkout with Stripe payment processing
- **Shipping Integration**: Real-time shipping rates via GoShippo API
- **Order Management**: Track orders and view order history
- **Admin Panel**: Comprehensive admin interface for store management
- **Responsive Design**: Mobile-first, responsive UI

## 🛠️ Technology Stack

**Backend:**
- Django 4.2 & Django REST Framework
- PostgreSQL database
- Redis for caching and sessions
- Stripe for payment processing
- GoShippo for shipping rates
- WhiteNoise for static file serving
- Gunicorn WSGI server

**Frontend:**
- React 19 with TypeScript
- Zustand for state management
- React Router for navigation
- Axios for API communication
- Responsive CSS with modern design

**DevOps:**
- Docker & Docker Compose
- Nginx for frontend serving
- Production-ready configuration

## 📦 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd django-ecom
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.production .env
   # Edit .env with your actual values
   ```

3. **Deploy with one command:**
   ```bash
   ./deploy.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## 🔧 Development Setup

### Backend Development

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Run development server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔐 Environment Variables

### Required Environment Variables

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
DJANGO_SETTINGS_MODULE=pasargadprints.settings_production

# Database
DB_NAME=pasargadprints
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=db
DB_PORT=5432

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Shippo
SHIPPO_API_KEY=shippo_live_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🚀 Production Deployment

### Docker Deployment (Recommended)

1. **Update environment variables in `.env`**
2. **Run deployment script:**
   ```bash
   ./deploy.sh
   ```

### Manual Deployment

1. **Build and start services:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Create superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Collect static files:**
   ```bash
   docker-compose exec backend python manage.py collectstatic
   ```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/register/` - User registration
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `GET /api/profile/` - User profile

### Product Endpoints
- `GET /api/products/` - List products
- `GET /api/products/{slug}/` - Product details

### Cart Endpoints
- `GET /api/cart/` - Get cart
- `POST /api/cart/add/` - Add to cart
- `PUT /api/cart/update/{id}/` - Update cart item
- `DELETE /api/cart/remove/{id}/` - Remove from cart

### Order Endpoints
- `GET /api/orders/` - List user orders
- `POST /api/checkout/` - Create checkout session

### Shipping Endpoints
- `GET /api/shipping-addresses/` - List addresses
- `POST /api/shipping-addresses/` - Create address
- `POST /api/shipping-rates/` - Get shipping rates

## 🔧 Administration

### Admin Panel Access
- URL: `http://localhost:8000/admin`
- Default credentials: `admin` / `admin123`

### Key Admin Features
- Product management with image upload
- Order tracking and status updates
- Customer management
- Inventory control
- Sales analytics

## 🛡️ Security Features

- HTTPS enforcement in production
- CSRF protection
- XSS protection
- SQL injection prevention
- Secure headers implementation
- Token-based authentication
- Input validation and sanitization

## 📱 Mobile Support

The platform is fully responsive and provides an excellent experience on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App capabilities

## 🔄 Backup and Maintenance

### Database Backup
```bash
docker-compose exec db pg_dump -U postgres pasargadprints > backup.sql
```

### Database Restore
```bash
docker-compose exec -i db psql -U postgres pasargadprints < backup.sql
```

### Log Monitoring
```bash
docker-compose logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the logs: `docker-compose logs`
- Review the API documentation
- Contact the development team

## 🔮 Future Enhancements

- Mobile app development
- Advanced analytics dashboard
- Multi-vendor marketplace
- Subscription management
- International shipping
- AI-powered recommendations