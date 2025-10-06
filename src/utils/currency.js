/**
 * Formatea un precio en centavos a formato de moneda mexicana
 * @param {number} cents - Precio en centavos
 * @returns {string} Precio formateado como moneda
 */
export const formatPrice = (cents) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(cents / 100);
};

/**
 * Convierte un precio en pesos a centavos
 * @param {number} pesos - Precio en pesos
 * @returns {number} Precio en centavos
 */
export const pesosTocents = (pesos) => {
  return Math.round(pesos * 100);
};

/**
 * Convierte un precio en centavos a pesos
 * @param {number} cents - Precio en centavos
 * @returns {number} Precio en pesos
 */
export const centsToPesos = (cents) => {
  return cents / 100;
};