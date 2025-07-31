import { useState, useEffect } from 'react';

export function useCart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        setCart(storedCart ? JSON.parse(storedCart) : []);
    }, []);

    const addToCart = (product) => {
        let updatedCart = [];
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            updatedCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + product.quantity }
                    : item
            );
        } else {
            updatedCart = [...cart, product];
        }
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const removeFromCart = (id) => {
        const updatedCart = cart.filter(item => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    return { cart, addToCart, removeFromCart, clearCart, setCart };
}
