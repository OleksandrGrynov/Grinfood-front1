import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // ✅ Завантаження з localStorage з перевірками
    useEffect(() => {
        try {
            const stored = localStorage.getItem('cart');
            if (stored && stored !== 'undefined') {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setCartItems(parsed);
                }
            }
        } catch (error) {
            console.error('❌ Error parsing localStorage cart:', error);
            setCartItems([]);
        }
    }, []);

    // ✅ Збереження в localStorage
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (err) {
            console.error('❌ Error saving cart to localStorage:', err);
        }
    }, [cartItems]);

    // ✅ Безпечне клонування об'єктів
    const deepClone = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (err) {
            console.error('❌ deepClone error:', err);
            return obj;
        }
    };

    // ✅ Додавання товару
    const addItem = (item, quantity = 1) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: (i.quantity || 1) + quantity }
                        : i
                );
            }
            return [...prev, { ...deepClone(item), quantity }];
        });
    };

    // ✅ Видалення за індексом
    const removeItem = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ Зміна кількості за індексом
    const updateQuantity = (index, quantity) => {
        setCartItems(prev => {
            if (!prev[index]) return prev;
            const updated = [...prev];
            updated[index] = {
                ...deepClone(updated[index]),
                quantity
            };
            return updated;
        });
    };

    // ✅ Очистити кошик
    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider
            value={{ cartItems, addItem, removeItem, updateQuantity, clearCart, setCartItems }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
