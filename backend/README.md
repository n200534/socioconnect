# SocioConnect Backend API

A modern, scalable FastAPI backend for the SocioConnect social media platform.

## 🚀 Features

- **FastAPI Framework**: High-performance async API with automatic documentation
- **PostgreSQL Database**: Robust data persistence with SQLAlchemy ORM
- **JWT Authentication**: Secure token-based authentication system
- **Redis Caching**: Fast data caching and session management
- **Clean Architecture**: Well-structured, maintainable codebase
- **Type Safety**: Full TypeScript-like type hints with Pydantic
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## 🛠 Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **PostgreSQL** - Advanced open-source database
- **Redis** - In-memory data structure store
- **JWT** - JSON Web Token authentication
- **Pydantic** - Data validation using Python type annotations
- **Alembic** - Database migration tool

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints/     # API endpoint routes
│   ├── core/                 # Core functionality (config, security)
│   ├── db/                   # Database configuration
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   └── main.py              # FastAPI application
├── tests/                    # Test files
├── requirements.txt          # Python dependencies
├── run.py                   # Development server runner
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### Installation

1. **Clone and navigate to backend**
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
   # Edit .env with your database and Redis credentials
   ```

5. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb socioconnect_db
   
   # Run the application to create tables
   python run.py
   ```

6. **Start the development server**
   ```bash
   python run.py
   ```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `GET /api/v1/users/{user_id}` - Get user profile by ID
- `GET /api/v1/users/` - Search users

### Posts
- `POST /api/v1/posts/` - Create new post
- `GET /api/v1/posts/` - Get posts feed
- `GET /api/v1/posts/{post_id}` - Get specific post
- `GET /api/v1/posts/user/{user_id}` - Get user's posts

### Interactions
- `POST /api/v1/interactions/posts/{post_id}/like` - Like/unlike post
- `POST /api/v1/interactions/posts/{post_id}/comments` - Create comment
- `GET /api/v1/interactions/posts/{post_id}/comments` - Get post comments
- `POST /api/v1/interactions/posts/{post_id}/repost` - Repost/un-repost
- `POST /api/v1/interactions/users/{user_id}/follow` - Follow/unfollow user

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT secret key | Required |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry | `7` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000` |
| `DEBUG` | Debug mode | `True` |

### Database Models

- **User**: User accounts and profiles
- **Post**: Posts and content
- **Like**: Post likes
- **Comment**: Post comments
- **Repost**: Post reposts
- **Follow**: User follow relationships

## 🧪 Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 📦 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t socioconnect-api .

# Run container
docker run -p 8000:8000 socioconnect-api
```

### Manual Deployment

1. Set `DEBUG=False` in environment
2. Use production database and Redis
3. Set strong `SECRET_KEY`
4. Configure proper CORS origins
5. Use production ASGI server (Gunicorn + Uvicorn)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt password hashing
- **CORS Protection**: Configurable CORS policies
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM protection
- **Rate Limiting**: Built-in rate limiting (configurable)

## 🚧 Development

### Code Style
- Follow PEP 8 guidelines
- Use type hints throughout
- Write docstrings for functions
- Use meaningful variable names

### Adding New Features
1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Add endpoints in `app/api/v1/endpoints/`
4. Update API router in `app/api/v1/api.py`
5. Write tests in `tests/`

## 📈 Performance

- **Async/Await**: Full async support for high concurrency
- **Connection Pooling**: Database connection pooling
- **Redis Caching**: Fast data caching
- **Pagination**: Efficient data pagination
- **Database Indexing**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the social media community**
