import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar productos');
        setLoading(false);
        console.error(err);
      });
  }, []);

  const formatPrice = (priceCents) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list">
      <h2>Productos Disponibles</h2>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img 
                src={`/images/products/${product.image}`} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = '/images/products/placeholder.svg';
                }}
              />
            </div>
            
            <div className="product-info">
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-brand">{product.brand}</span>
              </div>
              
              <p className="product-description">{product.description}</p>
              
              <div className="product-details">
                <span className="product-weight">Peso: {product.weight}</span>
                <span className="product-supplier">Proveedor: {product.supplier}</span>
              </div>
              
              <div className="product-price">
                <span className="price">{formatPrice(product.price_cents)}</span>
                <span className="stock">Stock: {product.stock}</span>
              </div>
              
              <div className="product-extra-info">
                <details className="ingredients">
                  <summary>Ingredientes</summary>
                  <p>{product.ingredients}</p>
                </details>
                
                {product.allergens && (
                  <div className="allergens">
                    <strong>Alérgenos:</strong> {product.allergens}
                  </div>
                )}
                
                <details className="nutritional-info">
                  <summary>Información Nutricional</summary>
                  <p>{product.nutritional_info}</p>
                </details>
              </div>
              
              <button 
                className="add-to-cart-btn"
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;