from setuptools import setup, find_packages

setup(
    name="socioconnect",
    version="1.0.0",
    description="A modern social media platform",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "sqlalchemy>=2.0.0",
        "alembic>=1.12.0",
        "psycopg2-binary>=2.9.0",
        "python-jose[cryptography]>=3.3.0",
        "passlib[bcrypt]>=1.7.4",
        "python-multipart>=0.0.6",
        "redis>=5.0.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.5.0",
        "pydantic-settings>=2.1.0",
        "aiofiles>=23.2.0",
        "Pillow>=10.0.0",
        "python-dateutil>=2.8.0",
        "fastapi-mail>=1.4.0",
        "gunicorn>=21.2.0",
    ],
)
