import React, { useState, useEffect } from 'react';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './styles/ResetPasswordPage.scss';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const oobCode = searchParams.get('oobCode');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!oobCode) {
            setError('Недійсне або відсутнє посилання.');
        }
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            return setError('Пароль повинен містити щонайменше 6 символів.');
        }

        if (newPassword !== confirmPassword) {
            return setError('Паролі не співпадають.');
        }

        try {
            const auth = getAuth();
            await confirmPasswordReset(auth, oobCode, newPassword);
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            console.error('❌ Error resetting password:', err);
            setError('Не вдалося скинути пароль. Посилання можливо недійсне або прострочене.');
        }
    };

    return (
        <div className="reset-password-container">
            <h2>🔐 Скидання пароля</h2>
            {error && <p className="error-text">❌ {error}</p>}
            {success ? (
                <p className="success-text">✅ Пароль успішно змінено! Переадресація...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Новий пароль"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Підтвердження пароля"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Скинути пароль</button>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordPage;
