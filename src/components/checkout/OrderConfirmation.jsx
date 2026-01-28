import './OrderConfirmation.css';

function OrderConfirmation({
  cartItems,
  formData,
  paymentMethod,
  total,
  formatCurrency,
}) {
  return (
    <div className="checkout-step">
      <h3>✅ Confirmar pedido</h3>

      {/* Productos */}
      <div className="confirmation-section">
        <h4>Productos</h4>
        <div className="confirmation-items">
          {cartItems.map(item => {
            const itemPrice = item.price_cents
              ? item.price_cents / 100
              : item.price;
            const itemImage =
              item.image_url ||
              (item.image
                ? `/images/products/${item.image}`
                : '/images/products/placeholder.svg');
            const itemName = item.name || 'Producto sin nombre';

            return (
              <div key={item.id} className="confirmation-item">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="confirmation-item-image"
                  onError={e => {
                    e.target.src = '/images/products/placeholder.svg';
                  }}
                />
                <div className="confirmation-item-info">
                  <span className="confirmation-item-name">{itemName}</span>
                  <span className="confirmation-item-details">
                    {item.quantity} x {formatCurrency(itemPrice)}
                  </span>
                </div>
                <span className="confirmation-item-total">
                  {formatCurrency(itemPrice * item.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total a pagar */}
      <div className="confirmation-section">
        <div className="confirmation-total">
          <span className="total-label">Total a pagar</span>
          <span className="total-amount">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Información de entrega */}
      <div className="confirmation-section">
        <h4>Información de entrega</h4>
        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-label">Nombre:</span>
            <span className="detail-value">{formData.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Teléfono:</span>
            <span className="detail-value">{formData.customerPhone}</span>
          </div>
          {formData.customerEmail && (
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{formData.customerEmail}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Dirección:</span>
            <span className="detail-value">{formData.deliveryAddress}</span>
          </div>
          {formData.orderNotes && (
            <div className="detail-row">
              <span className="detail-label">Notas:</span>
              <span className="detail-value">{formData.orderNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Método de pago */}
      <div className="confirmation-section">
        <h4>Método de pago</h4>
        <div className="payment-summary">
          <span className="payment-icon">
            {paymentMethod === 'cash' ? '💵' : '💳'}
          </span>
          <span className="payment-text">
            {paymentMethod === 'cash'
              ? 'Pago en efectivo'
              : 'Tarjeta de crédito/débito'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
