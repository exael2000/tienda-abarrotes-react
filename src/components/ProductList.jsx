import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { getProducts } from '../services/api';
import { formatPrice } from '../utils/currency';
import AddToCartNotification from './AddToCartNotification';
import './ProductList.css';

// Componente selector de cantidad inteligente
const QuantitySelector = ({ stock, onQuantityChange, onAdd }) => {
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const selectorRef = React.useRef(null);

  // Cerrar cuando se hace clic fuera del selector
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, stock));
    setQuantity(validQuantity);
    setIsExpanded(false); // Cerrar después de seleccionar
    onQuantityChange && onQuantityChange(validQuantity);
  };

  const handleAdd = () => {
    onAdd && onAdd(quantity);
    setQuantity(1); // Reset después de agregar
    setIsExpanded(false); // Cerrar después de agregar
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (stock === 0) {
    return (
      <button className="btn-out-of-stock" disabled>
        Sin Stock
      </button>
    );
  }

  return (
    <div className="quantity-selector-expandable" ref={selectorRef}>
      {/* Vista colapsada - solo muestra el número actual */}
      <div 
        className={`qty-display ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={toggleExpanded}
      >
        <span className="qty-current">{quantity}</span>
        <span className="qty-arrow">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {/* Vista expandida - lista deslizante */}
      {isExpanded && (
        <div className="qty-expanded-container">
          <div className="qty-scrollable-list">
            {[...Array(stock)].map((_, index) => (
              <button
                key={index + 1}
                className={`qty-scroll-btn ${quantity === index + 1 ? 'active' : ''}`}
                onClick={() => handleQuantityChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="btn-add-with-qty" onClick={handleAdd}>
        Agregar
      </button>
    </div>
  );
};

// Componente para el carrusel de productos por proveedor
const SupplierCarousel = ({ supplier, products, onProductClick, onAddToCart }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainer = React.useRef(null);

  // Función para formatear nombres de proveedores
  const formatSupplierName = (supplierName) => {
    const supplierMap = {
      'bimbo': 'Grupo Bimbo',
      'gamesa': 'Gamesa',
      'sabritas': 'Sabritas',
      'la_costena': 'La Costeña',
      'barcel': 'Barcel'
    };
    
    return supplierMap[supplierName] || 
           supplierName.split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
  };

  const checkScrollButtons = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [products]);

  const scroll = (direction) => {
    if (scrollContainer.current) {
      const scrollAmount = 300;
      const newScrollPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollContainer.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newScrollPosition);
    }
  };

  return (
    <div className="supplier-section">
      <div className="supplier-header">
        <h2 className="supplier-name">{formatSupplierName(supplier)}</h2>
      </div>
      
      <div className="carousel-container">
        {canScrollLeft && (
          <button 
            className="carousel-arrow carousel-arrow-left"
            onClick={() => scroll('left')}
          >
            &#8249;
          </button>
        )}
        
        <div 
          className="products-carousel"
          ref={scrollContainer}
          onScroll={checkScrollButtons}
        >
          {products.map(product => (
            <div key={product.id} className="carousel-product-card">
              <div className="carousel-product-image-container">
                <img 
                  src={`/images/products/${product.image}`} 
                  alt={product.name}
                  className="carousel-product-image"
                  onClick={() => onProductClick(product)}
                  onError={(e) => {
                    e.target.src = '/images/products/placeholder.svg';
                  }}
                />
              </div>
              
              <div className="carousel-product-info">
                <h3 className="carousel-product-name">{product.name}</h3>
                <div className="carousel-product-footer">
                  <span className="carousel-product-price">{formatPrice(product.price_cents)}</span>
                </div>
                
                <div className="carousel-quantity-section">
                  <QuantitySelector
                    stock={product.stock}
                    onQuantityChange={(qty) => console.log(`Cantidad seleccionada: ${qty}`)}
                    onAdd={(qty) => {
                      console.log(`Agregando ${qty} unidades de ${product.name}`);
                      onAddToCart && onAddToCart(product, qty);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {canScrollRight && (
          <button 
            className="carousel-arrow carousel-arrow-right"
            onClick={() => scroll('right')}
          >
            &#8250;
          </button>
        )}
      </div>
    </div>
  );
};

// Componente Bottom Sheet para detalles del producto
const ProductBottomSheet = ({ product, isOpen, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Reset estado cuando se abre
      setIsExpanded(false);
      setCurrentTranslateY(0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    setDragStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    
    // Solo permitir deslizamiento hacia arriba desde estado collapsed
    // o hacia abajo desde cualquier estado
    if (!isExpanded && deltaY < 0) {
      // Deslizando hacia arriba - expandir
      const translateY = Math.max(deltaY, -200);
      setCurrentTranslateY(translateY);
    } else if (deltaY > 0) {
      // Deslizando hacia abajo - contraer o cerrar
      const translateY = Math.min(deltaY, 300);
      setCurrentTranslateY(translateY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Determinar acción basada en la distancia de deslizamiento
    if (currentTranslateY < -100 && !isExpanded) {
      // Expandir
      setIsExpanded(true);
      setCurrentTranslateY(0);
    } else if (currentTranslateY > 100) {
      // Cerrar
      onClose();
    } else if (currentTranslateY > 50 && isExpanded) {
      // Contraer
      setIsExpanded(false);
      setCurrentTranslateY(0);
    } else {
      // Volver a posición original
      setCurrentTranslateY(0);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isOpen || !product) return null;

  const sheetStyle = {
    transform: isDragging 
      ? `translateY(${currentTranslateY}px)` 
      : isExpanded 
        ? 'translateY(0)' 
        : 'translateY(40%)'
  };

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div 
        className={`bottom-sheet ${isExpanded ? 'expanded' : 'collapsed'}`}
        style={sheetStyle}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle para arrastrar */}
        <div className="bottom-sheet-handle" onClick={toggleExpanded}>
          <div className="handle-bar"></div>
        </div>

        {/* Vista compacta */}
        <div className="bottom-sheet-header">
          <div className="product-summary">
            <img 
              src={`/images/products/${product.image}`}
              alt={product.name}
              className="summary-image"
              onError={(e) => {
                e.target.src = '/images/products/placeholder.svg';
              }}
            />
            <div className="summary-info">
              <h3>{product.name}</h3>
              <p className="summary-brand">{product.brand}</p>
              <span className="summary-price">{formatPrice(product.price_cents)}</span>
            </div>
          </div>
          <button className="btn-quick-add">
            {product.stock > 0 ? 'Agregar' : 'Sin Stock'}
          </button>
        </div>

        {/* Vista expandida */}
        <div className="bottom-sheet-content">
          <div className="expanded-info-section">
            <div className="expanded-details">
              <div className="detail-row">
                <strong>Marca:</strong> {product.brand}
              </div>
              <div className="detail-row">
                <strong>Peso:</strong> {product.weight}
              </div>
              <div className="detail-row">
                <strong>Stock:</strong> {product.stock} unidades
              </div>
            </div>
            
            <div className="expanded-description">
              <h4>Descripción</h4>
              <p>{product.description}</p>
            </div>
            
            {product.ingredients && (
              <div className="expanded-ingredients">
                <h4>Ingredientes</h4>
                <p>{product.ingredients}</p>
              </div>
            )}
            
            {product.allergens && (
              <div className="expanded-allergens">
                <h4>⚠️ Alérgenos</h4>
                <p>{product.allergens}</p>
              </div>
            )}
            
            {product.nutritional_info && (
              <div className="expanded-nutrition">
                <h4>Información Nutricional</h4>
                <p>{product.nutritional_info}</p>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de estado */}
        <div className="sheet-indicator">
          {isExpanded ? '↓ Desliza hacia abajo para contraer' : '↑ Desliza hacia arriba para ver más'}
        </div>
      </div>
    </div>
  );
};

function ProductList() {
  const { addToCart, getCartItemsCount } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [notification, setNotification] = useState({ 
    isVisible: false, 
    product: null, 
    quantity: 0 
  });

  useEffect(() => {
    getProducts()
      .then(res => {
        setProducts(res.data);
        
        // Agrupar productos por proveedor
        const grouped = res.data.reduce((acc, product) => {
          const supplier = product.supplier;
          if (!acc[supplier]) {
            acc[supplier] = [];
          }
          acc[supplier].push(product);
          return acc;
        }, {});
        
        // Ordenar productos dentro de cada proveedor por nombre
        Object.keys(grouped).forEach(supplier => {
          grouped[supplier].sort((a, b) => a.name.localeCompare(b.name));
        });
        
        setGroupedProducts(grouped);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar productos');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product, quantity) => {
    addToCart(product, quantity);
    
    // Mostrar notificación
    setNotification({
      isVisible: true,
      product: product,
      quantity: quantity
    });
    
    console.log(`✓ Agregado al carrito: ${quantity}x ${product.name}`);
  };
  
  const handleCloseNotification = () => {
    setNotification({
      isVisible: false,
      product: null,
      quantity: 0
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // Ordenar proveedores alfabéticamente
  const sortedSuppliers = Object.keys(groupedProducts).sort();

  return (
    <div className="product-list-container">
      <div className="main-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Tienda de Abarrotes</h1>
            <p className="total-products">
              {products.length} productos disponibles
            </p>
          </div>
          
          <Link to="/cart" className="cart-button">
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{getCartItemsCount()}</span>
          </Link>
        </div>
      </div>
      
      <div className="suppliers-container">
        {sortedSuppliers.map(supplier => (
          <SupplierCarousel
            key={supplier}
            supplier={supplier}
            products={groupedProducts[supplier]}
            onProductClick={openProductModal}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      <ProductBottomSheet 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
      />
      
      <AddToCartNotification
        isVisible={notification.isVisible}
        product={notification.product}
        quantity={notification.quantity}
        onClose={handleCloseNotification}
      />
    </div>
  );
}

export default ProductList;