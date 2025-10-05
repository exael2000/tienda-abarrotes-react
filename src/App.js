import React from 'react';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Tienda Abarrotes</h1>
      </header>
      <ProductList />
      <Cart />
      <Checkout />
    </div>
  );
}

export default App;
