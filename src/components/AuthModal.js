import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import GoogleLoginButton from './GoogleLoginButton';
import ForgotPasswordModal from './ForgotPasswordModal';
import '../styles/AuthModal.scss';

const AuthModal = ({ mode, onClose, switchMode }) => {
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleSuccess = () => {
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <h2>{mode === 'signin' ? 'Вхід' : 'Реєстрація'}</h2>

                {mode === 'signin' ? (
                    <>
                        <SignIn
                            onSuccess={handleSuccess}
                            setError={setError}
                            onForgotPassword={() => setShowForgotModal(true)}
                        />
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

                {showForgotModal && (
                    <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
                )}
            </div>
        </div>
    );
};

export default AuthModal;
