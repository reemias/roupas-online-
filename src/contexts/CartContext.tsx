import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  maxStock?: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Persistir no localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Abrir/fechar drawer
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  // Calcular totais
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Adicionar item (e abrir o drawer automaticamente)
  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    // Abre o drawer automaticamente
    openDrawer();
  };

  const removeItem = (id: string, color: string, size: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.color === color && item.size === size))
    );
  };

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};