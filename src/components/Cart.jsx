import React, { useContext, useState, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/currency';
import Checkout from './Checkout';
import './Cart.css';
import './ProductList.css'; // Importar estilos del ProductList para el bottom sheet

// ProductBottomSheet optimizado para carrito con scroll
const ProductBottomSheet = ({ product, isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setIsExpanded(false);
      setIsImageZoomed(false); // Reset image zoom when opening bottom sheet
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="cart-bottom-sheet-overlay" onClick={handleBackgroundClick}>
      <div className={`cart-bottom-sheet ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="cart-sheet-header">
          <div className="cart-sheet-handle" onClick={toggleExpanded}></div>
          <button className="cart-sheet-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-sheet-content">
          <div className="cart-product-hero-section">
            <div className="cart-hero-image">
              <img 
                src={`/images/products/${product.image}`}
                alt={product.name}
                className="cart-product-image clickable-image"
                onClick={() => setIsImageZoomed(true)}
                onError={(e) => {
                  e.target.src = '/images/products/placeholder.svg';
                }}
              />
            </div>
            <div className="cart-hero-info">
              <h2 className="cart-hero-title">{product.name}</h2>
              <span className="cart-hero-price">{formatPrice(product.price_cents)}</span>
              <div className="cart-hero-brand">Marca: {product.brand}</div>
            </div>
          </div>
          
          <div className="cart-scrollable-content">
            <div className="cart-product-details">
              <div className="cart-detail-row">
                <span className="cart-detail-label">Peso:</span>
                <span className="cart-detail-value">{product.weight}</span>
              </div>
              <div className="cart-detail-row">
                <span className="cart-detail-label">Stock:</span>
                <span className="cart-detail-value">{product.stock} unidades</span>
              </div>
            </div>
            
            <div className="cart-product-description">
              <h4>Descripción</h4>
              <p>{product.description}</p>
            </div>
            
            {product.ingredients && (
              <div className="cart-product-ingredients">
                <h4>Ingredientes</h4>
                <p>{product.ingredients}</p>
              </div>
            )}
            
            {product.allergens && (
              <div className="cart-product-allergens">
                <h4>⚠️ Alérgenos</h4>
                <p>{product.allergens}</p>
              </div>
            )}
            
            {product.nutritional_info && (
              <div className="cart-product-nutrition">
                <h4>Información Nutricional</h4>
                <p>{product.nutritional_info}</p>
              </div>
            )}
          </div>
        </div>

        <div className="cart-sheet-footer">
          <div className="cart-sheet-indicator">
            {isExpanded ? '↓ Tocar para contraer' : '↑ Tocar para expandir'}
          </div>
        </div>
      </div>
      
      {/* Modal de imagen ampliada */}
      {isImageZoomed && (
        <div className="image-zoom-overlay" onClick={() => setIsImageZoomed(false)}>
          <div className="image-zoom-container">
            <img 
              src={`/images/products/${product.image}`}
              alt={product.name}
              className="image-zoomed"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                e.target.src = '/images/products/placeholder.svg';
              }}
            />
            <button 
              className="image-zoom-close"
              onClick={() => setIsImageZoomed(false)}
            >
              ×
            </button>
            <div className="image-zoom-info">
              <h3>{product.name}</h3>
              <p>{product.brand} - {product.weight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
const ProductBottomSheetMemo = memo(ProductBottomSheet, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.onClose === nextProps.onClose
  );
});

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Ordenar items del carrito para asegurar consistencia visual
  const sortedCartItems = [...cartItems].sort((a, b) => {
    if (a.order && b.order) {
      return a.order - b.order;
    }
    if (a.addedAt && b.addedAt) {
      return a.addedAt - b.addedAt;
    }
    return a.id - b.id;
  });

  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleCheckout = useCallback(() => {
    if (user?.isGuest) {
      // Mostrar modal para registrarse
      setShowRegisterPrompt(true);
      return;
    }
    // Mostrar el componente de checkout
    setShowCheckout(true);
  }, [user?.isGuest]);

  const handleCheckoutSuccess = useCallback((result) => {
    setShowCheckout(false);
    // Quitar alert molesto - la información ya se mostró en la página de confirmación
    // alert(`¡Orden completada exitosamente! Número de orden: ${result.order_number}`);
    // Opcional: navegar a una página de confirmación
    // navigate('/orders');
  }, []);

  const handleCheckoutCancel = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const handleGoToRegister = useCallback(() => {
    console.log('🔑 handleGoToRegister called - saving cart for later combination');
    console.log('🔑 Current cart items:', cartItems.length, cartItems);
    
    // Cerrar modal
    setShowRegisterPrompt(false);
    // Guardar el carrito actual para recuperarlo después del registro
    localStorage.setItem('pendingCart', JSON.stringify(cartItems));
    console.log('🔑 Saved pendingCart to localStorage');
    
    // Marcar que quiere ir al registro
    localStorage.setItem('wantsToRegister', 'true');
    console.log('🔑 Set wantsToRegister=true, going to logout and redirect to register');
    
    // Verificar que se guardó correctamente
    const saved = localStorage.getItem('wantsToRegister');
    console.log('🔑 Verification - wantsToRegister saved as:', saved);
    
    // Hacer logout para que regrese a la pantalla de auth
    logout();
    // Redirigir a la página principal
    navigate('/');
  }, [cartItems, logout, navigate]);

  const handleGoToLogin = useCallback(() => {
    console.log('🔑 handleGoToLogin called - saving cart for later combination');
    console.log('🔑 Current cart items:', cartItems.length, cartItems);
    
    // Cerrar modal
    setShowRegisterPrompt(false);
    // Guardar el carrito actual para recuperarlo después del login
    localStorage.setItem('pendingCart', JSON.stringify(cartItems));
    console.log('🔑 Saved pendingCart to localStorage');
    
    // Marcar que quiere ir al login
    localStorage.setItem('wantsToRegister', 'false');
    console.log('🔑 Going to logout and redirect to login');
    
    // Hacer logout para que regrese a la pantalla de auth (login por defecto)
    logout();
    // Redirigir a la página principal
    navigate('/');
  }, [cartItems, logout, navigate]);

  // Si se está mostrando el checkout, renderizar el componente Checkout
  if (showCheckout) {
    return (
      <Checkout 
        onSuccess={handleCheckoutSuccess}
        onCancel={handleCheckoutCancel}
      />
    );
  }

  // Solo mostrar carrito vacío si NO estamos en checkout
  if (sortedCartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <Link to="/" className="back-button">
            ← Volver a la tienda
          </Link>
          <h1>Mi Carrito</h1>
        </div>
        
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>¡Agrega algunos productos deliciosos!</p>
          <Link to="/" className="btn-continue-shopping">
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <Link to="/" className="back-button">
          ← Volver a la tienda
        </Link>
        <h1>Mi Carrito ({sortedCartItems.length} productos)</h1>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {sortedCartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={`/images/products/${item.image}`} 
                  alt={item.name}
                  onClick={() => handleProductClick(item)}
                  onError={(e) => {
                    e.target.src = '/images/products/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-brand">{item.brand}</p>
                <p className="cart-item-weight">{item.weight}</p>
              </div>
              
              <div className="cart-item-controls">
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-price">
                  <span className="unit-price">{formatPrice(item.price_cents)} c/u</span>
                  <span className="total-price">{formatPrice(item.price_cents * item.quantity)}</span>
                </div>
                
                <button 
                  className="btn-remove"
                  onClick={() => removeFromCart(item.id)}
                  title="Eliminar del carrito"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Resumen del Pedido</h3>
            
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <div className="summary-line">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            
            <div className="summary-line total">
              <span>Total:</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            
            <button 
              className={`btn-checkout ${user?.isGuest ? 'guest-disabled' : ''}`}
              onClick={handleCheckout}
            >
              {user?.isGuest ? '🔒 Regístrate para Comprar' : 'Proceder al Pago'}
            </button>
            
            <Link to="/" className="btn-continue-shopping-small">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
      
      <ProductBottomSheetMemo 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
      />

      {/* Modal para prompt de registro */}
      {showRegisterPrompt && (
        <div className="register-prompt-overlay" onClick={() => setShowRegisterPrompt(false)}>
          <div className="register-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="register-prompt-header">
              <h3>🛒 ¡Tu carrito está listo!</h3>
              <button 
                className="register-prompt-close" 
                onClick={() => setShowRegisterPrompt(false)}
              >
                ×
              </button>
            </div>
            <div className="register-prompt-content">
              <p>Para finalizar tu compra y recibir tu pedido, necesitas tener una cuenta.</p>
              <div className="register-prompt-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">✅</span>
                  <span>Guarda tu información para futuras compras</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📦</span>
                  <span>Rastrea el estado de tus pedidos</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎁</span>
                  <span>Accede a ofertas exclusivas</span>
                </div>
              </div>
            </div>
            <div className="register-prompt-actions">
              <button 
                className="btn-register-now"
                onClick={handleGoToRegister}
              >
                Registrarme Ahora
              </button>
              <button 
                className="btn-login-now"
                onClick={handleGoToLogin}
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;