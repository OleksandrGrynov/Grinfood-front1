import React, { useState } from 'react';
import '../styles/AuthModal.scss';

const ForgotPasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const apiUrl = process.env.REACT_APP_API_URL;

        try {
            const checkRes = await fetch(`${apiUrl}/check-user-by-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!checkRes.ok) {
                setError('❌ Користувача з такою поштою не знайдено');
                setLoading(false);
                return;
            }

            const res = await fetch(`${apiUrl}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Помилка скидання пароля');

            setMessage('📩 Інструкції надіслано на вашу пошту');
            setEmail('');
        } catch (err) {
            setError(err.message || '⚠️ Сталася помилка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <h3>Скидання пароля</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Введіть вашу пошту"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={!!message}
                    />
                    <button type="submit" disabled={loading || !!message}>
                        {loading ? 'Відправка...' : 'Скинути пароль'}
                    </button>
                </form>
                {message && <p className="success-text">{message}</p>}
                {error && <p className="error-text">{error}</p>}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
