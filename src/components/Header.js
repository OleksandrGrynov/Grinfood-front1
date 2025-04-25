import React, { useState, useEffect } from 'react';
import './Header.css';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

function Header({ onAuthClick }) {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartCount(cart.length);
        };

        updateCartCount(); // одразу

        // Слухач для змін у localStorage
        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setDropdownOpen(false);
    };

    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-links left">
                    <li><Link to="/">🏠 Головна</Link></li>
                    <li><a href="#">Акції</a></li>
                    <li><a href="#">Відгуки</a></li>
                    <li><a href="#">Доставка</a></li>
                    <li><Link to="/menu">🍔 Меню</Link></li>
                </ul>

                <div className="logo">
                    <Link to="/">
                        <img src="/logo.png" alt="Grinfood Logo" />
                    </Link>
                </div>

                <ul className="nav-links right">
                    <li>📍 Хмельницький</li>
                    <li>
                        <Link to="/order">
                            🛒 Кошик {cartCount > 0 && `(${cartCount})`}
                        </Link>
                    </li>
                    <li style={{ position: 'relative' }}>
                        {user ? (
                            <>
                                <span
                                    style={{ cursor: 'pointer', color: 'purple' }}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    👤 {user.displayName || user.email}
                                </span>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div onClick={() => alert("Редагування профілю ще не реалізовано")}>
                                            ✏️ Редагувати профіль
                                        </div>
                                        <div onClick={handleLogout}>
                                            🚪 Вийти
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span
                                className="auth-link"
                                style={{ cursor: 'pointer', color: 'purple' }}
                                onClick={() => onAuthClick('signin')}
                            >
                                👤 Вхід
                            </span>
                        )}
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
