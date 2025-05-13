import React, { useState, useEffect } from 'react';
import '../styles/Header.scss';
import { onAuthStateChanged, signOut, getIdToken } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import UpsellModal from './UpsellModal';
import { fetchMenu } from '../api';
import logo from '../logo.png';

function Header({ onAuthClick }) {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [upsellOpen, setUpsellOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const { cartItems, clearCart } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const token = await getIdToken(firebaseUser);
                const res = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setRole(data.role);
            } else {
                setRole(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setDropdownOpen(false);
            setRole(null);
            setMobileMenuOpen(false);
            localStorage.clear();
            clearCart();
            navigate('/');
        } catch (err) {
            console.error('❌ Logout error:', err);
        }
    };

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleCartClick = async () => {
        try {
            const all = await fetchMenu();
            const recommended = all
                .filter((item) => item.active !== false)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            setSuggestions(recommended);
            setUpsellOpen(true);
            closeMobileMenu();
        } catch (err) {
            console.error('❌ Upsell load error:', err);
            navigate('/order');
        }
    };

    return (
        <header className="header">
            <nav className="navbar">
                <div className="nav-logo">
                    <Link to="/" onClick={closeMobileMenu}>
                        <img src={logo} alt="Grinfood Logo" />
                    </Link>
                </div>

                <button
                    className={`burger ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label="Toggle menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="nav-section left">
                        <Link to="/" onClick={closeMobileMenu}>🏠 Головна</Link>
                        <Link to="/promotions" onClick={closeMobileMenu}>🎁 Акції</Link>
                        <Link to="/reviews" onClick={closeMobileMenu}>Відгуки</Link>
                        <Link to="/delivery" onClick={closeMobileMenu}>Доставка</Link>
                    </div>

                    <div className="nav-section right">
                        <span onClick={handleCartClick}>
                            🛒 {cartCount > 0 && <span>({cartCount})</span>}
                        </span>

                        {role === 'manager' && (
                            <Link to="/manager" className="manager-btn" onClick={closeMobileMenu}>
                                🧑‍💼 Менеджер
                            </Link>
                        )}
                        {role === 'courier' && (
                            <Link to="/courier/orders" className="manager-btn" onClick={closeMobileMenu}>
                                🚚 Кур’єру
                            </Link>
                        )}

                        <div className="header-profile-container">
                            {user ? (
                                <>
                                    <span
                                        className="profile-name"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                    >
                                        👤 {user.displayName || user.email}
                                    </span>

                                    {dropdownOpen && (
                                        <div className="dropdown-menu">
                                            <Link to="/profile" onClick={() => {
                                                setDropdownOpen(false);
                                                closeMobileMenu();
                                            }}>
                                                ✏️ Профіль
                                            </Link>
                                            <div onClick={handleLogout}>🚪 Вийти</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <span
                                    className="auth-link"
                                    onClick={() => {
                                        onAuthClick('signin');
                                        closeMobileMenu();
                                    }}
                                >
                                    👤
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <UpsellModal
                open={upsellOpen}
                onClose={() => setUpsellOpen(false)}
                suggestions={suggestions}
                onProceed={() => {
                    setUpsellOpen(false);
                    navigate('/order');
                }}
            />
        </header>
    );
}

export default Header;
