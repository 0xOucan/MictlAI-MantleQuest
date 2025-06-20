import React, { ReactNode } from 'react';
import styles from './MetallicStyles.module.css';

interface MetallicPanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'turquoise';
  pixelated?: boolean;
  iridescent?: boolean;
}

const MetallicPanel: React.FC<MetallicPanelProps> = ({
  children,
  className = '',
  variant = 'default',
  pixelated = true,
  iridescent = false,
}) => {
  // Determine which class to use based on the props
  const getStyleClass = () => {
    if (pixelated) {
      if (variant === 'gold') return styles.pixelMetallicGold;
      if (variant === 'turquoise') return styles.pixelMetallicTurquoise;
      return styles.pixelMetallic;
    } else {
      if (variant === 'gold') return styles.metallicGold;
      if (variant === 'turquoise') return styles.metallicTurquoise;
      return styles.metallic;
    }
  };

  const styleClass = getStyleClass();
  const iridescenceClass = iridescent ? styles.iridescent : '';

  return (
    <div className={`${styleClass} ${iridescenceClass} ${className}`}>
      {children}
    </div>
  );
};

export default MetallicPanel; 