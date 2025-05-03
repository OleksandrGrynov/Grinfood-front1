import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import GoogleLoginButton from './GoogleLoginButton';
import './AuthModal.scss';

const AuthModal = ({ mode, onClose, switchMode }) => {
    const [error, setError] = useState('');

    const handleSuccess = () => {
        setError('');
        onClose();
    };

    const handleForgotPassword = () => {
        const email = prompt('Введіть вашу електронну пошту для скидання пароля:');
        if (email) {
            fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
                .then(res => res.json())
                .then(data => {
                    alert('📧 Інструкції надіслано на вашу пошту');
                })
                .catch(err => {
                    console.error('❌ Помилка скидання пароля:', err);
                    setError('Не вдалося надіслати інструкції. Спробуйте ще раз.');
                });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <h2>{mode === 'signin' ? 'Вхід' : 'Реєстрація'}</h2>

                {mode === 'signin' ? (
                    <>
                        <SignIn onSuccess={handleSuccess} setError={setError} onForgotPassword={handleForgotPassword} />
                        {error && <p className="error-text">❌ {error}</p>}
                        <GoogleLoginButton onSuccess={handleSuccess} setError={setError} />
                        <p className="switch-text">
                            Немає акаунта?
                            <span className="switch-link" onClick={() => switchMode('signup')}> Зареєструватись</span>
                        </p>
                    </>
                ) : (
                    <>
                        <SignUp onSuccess={handleSuccess} setError={setError} />
                        {error && <p className="error-text">❌ {error}</p>}
                        <p className="switch-text">
                            Вже маєш акаунт?
                            <span className="switch-link" onClick={() => switchMode('signin')}> Увійти</span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
