# Archivo de configuración unificado para la aplicación
import os
from datetime import timedelta

class Config:
    """Configuración base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tu-clave-secreta-super-segura'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'tu-clave-jwt-super-segura'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 24)))
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///db-microservice/db.sqlite3'
    
    # Configuración de Stripe
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY')
    
class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    CORS_ORIGINS = ['https://exael.pythonanywhere.com']
    
class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    DATABASE_URL = 'sqlite:///test.db'

# Mapeo de configuraciones
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}