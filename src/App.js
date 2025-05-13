import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import HomePage from './HomePage';
import MenuPage from './MenuPage';
import OrderForm from './OrderForm';
import ProfilePage from './ProfilePage';
import AuthModal from './components/AuthModal';
import { CartProvider } from './components/CartContext';
import ManagerDashboard from './components/ManagerDashboard';
import PromotionsPage from './components/PromotionsPage';
import Footer from './components/Footer';
import ReviewsPage from './ReviewsPage';
import './styles/App.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import DeliveryPage from './DeliveryPage';
import ResetPasswordPage from './ResetPasswordPage';
import VerifyEmail from './components/VerifyEmail';
import CourierOrders from "./components/CourierOrders";

function App() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('signin');
    const [role, setRole] = useState(localStorage.getItem('role'));

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, [authModalOpen]);

    const openAuth = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    return (
        <BrowserRouter>
            <CartProvider>
                <Header onAuthClick={openAuth} />

                <main>
                    <Routes>
                        <Route path="/reviews" element={<ReviewsPage openAuth={openAuth} />} />
                        <Route path="/delivery" element={<DeliveryPage />} />
                        <Route path="/" element={<HomePage />} />
                        <Route path="/menu" element={<MenuPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route
                            path="/courier/orders"
                            element={
                                <PrivateRoute openAuth={openAuth} allowedRoles={['courier']}>
                                    <CourierOrders />
                                </PrivateRoute>
                            }
                        />


                        <Route
                            path="/order"
                            element={
                                <PrivateRoute openAuth={openAuth}>
                                    <OrderForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/manager"
                            element={
                                <PrivateRoute openAuth={openAuth} allowedRoles={['manager']}>
                                    <ManagerDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/promotions" element={<PromotionsPage />} />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute openAuth={openAuth}>
                                    <ProfilePage />
                                </PrivateRoute>
                            }
                        />

                        {role === 'manager' && (
                            <>
                                <Route path="/pending-orders" element={<div>Очікують підтвердження</div>} />
                                <Route path="/confirmed-orders" element={<div>Підтверджені замовлення</div>} />
                            </>
                        )}
                    </Routes>
                </main>

                {authModalOpen && (
                    <AuthModal
                        mode={authMode}
                        onClose={() => setAuthModalOpen(false)}
                        switchMode={openAuth}
                    />
                )}

                <ToastContainer position="top-center" autoClose={3000} />
                <Footer />
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;
