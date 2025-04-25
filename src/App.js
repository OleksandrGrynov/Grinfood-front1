import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import HomePage from './HomePage';
import MenuPage from './MenuPage';
import OrderForm from './OrderForm'; // 👈 додано
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('signin');

    const openAuth = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    return (
        <BrowserRouter>
            <Header onAuthClick={openAuth} />
            <Routes>
                <Route
                    path="/"
                    element={
                        <PrivateRoute openAuth={openAuth}>
                            <HomePage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/menu"
                    element={
                        <PrivateRoute openAuth={openAuth}>
                            <MenuPage />
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
            </Routes>

            {authModalOpen && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setAuthModalOpen(false)}
                    switchMode={openAuth}
                />
            )}
        </BrowserRouter>
    );
}

export default App;
