import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

export const ThemeToggle = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="toggle-track">
        <motion.div
          className="toggle-thumb"
          animate={{
            x: isDark ? 24 : 0,
            backgroundColor: isDark ? '#1e293b' : '#fbbf24'
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30 
          }}
        />
        <div className="toggle-icons">
          <motion.span
            className="sun-icon"
            animate={{
              opacity: isDark ? 0 : 1,
              scale: isDark ? 0.8 : 1,
              rotate: isDark ? 180 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            ☀️
          </motion.span>
          <motion.span
            className="moon-icon"
            animate={{
              opacity: isDark ? 1 : 0,
              scale: isDark ? 1 : 0.8,
              rotate: isDark ? 0 : -180
            }}
            transition={{ duration: 0.3 }}
          >
            🌙
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
};