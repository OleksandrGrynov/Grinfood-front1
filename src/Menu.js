import React, { useState, useEffect } from 'react';
import { fetchMenu } from "./api";

function Menu() {
    const [menu, setMenu] = useState([]);

    useEffect(() => {
        fetchMenu().then(setMenu);
    }, []);

    const addToCart = (item) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(item);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${item.name} додано до кошика!`);
    };

    return (
        <div className="menu-container">
            <h2>Меню</h2>
            <div className="menu-grid">
                {menu.map(item => (
                    <div key={item.id} className="menu-card">
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="menu-image"
                            />
                        )}
                        <h3>{item.name}</h3>
                        <p>{item.price}₴</p>
                        <button onClick={() => addToCart(item)}>🛒 Додати в кошик</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Menu;
