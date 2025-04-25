import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './AuthModal.css';

const AuthModal = ({ mode, onClose, switchMode }) => {
    const [error, setError] = useState('');

    const handleSuccess = () => {
        setError('');
        onClose(); // закриваємо модалку
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                {mode === 'signin' ? (
                    <>
                        <h2>Вхід</h2>
                        <SignIn onSuccess={handleSuccess} setError={setError} />
                        {error && <p style={{ color: 'red' }}>❌ {error}</p>}
                        <p>
                            Немає акаунта?{' '}
                            <span className="switch-link" onClick={() => switchMode('signup')}>
                                Зареєструватись
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Реєстрація</h2>
                        <SignUp onSuccess={handleSuccess} setError={setError} />
                        {error && <p style={{ color: 'red' }}>❌ {error}</p>}
                        <p>
                            Вже маєш акаунт?{' '}
                            <span className="switch-link" onClick={() => switchMode('signin')}>
                                Увійти
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
