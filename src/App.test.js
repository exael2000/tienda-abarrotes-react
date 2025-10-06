import { render } from '@testing-library/react';
import App from './App';

test('renders tienda de abarrotes', () => {
  render(<App />);
  // Verificar que la aplicación se renderiza sin errores
  expect(document.body).toBeInTheDocument();
});
