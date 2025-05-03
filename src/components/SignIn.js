import React, { useState } from 'react';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignIn = ({ onSuccess, setError, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Вхід не вдався');

            const auth = getAuth();
            await signInWithCustomToken(auth, data.token);

            const idToken = await auth.currentUser.getIdToken();
            localStorage.setItem('token', idToken);

            const roleRes = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const roleData = await roleRes.json();
            const role = roleData.role || 'user';
            localStorage.setItem('role', role);

            console.log('✅ Вхід успішний ➡️ Role:', role);

            if (onSuccess) onSuccess();
            navigate(role === 'manager' ? '/manager' : '/');
        } catch (error) {
            console.error('❌ Помилка входу:', error.message);
            setError('Неправильна пошта або пароль');
        }
    };

    return (
        <form onSubmit={handleSignIn}>
            <input
                type="email"
                placeholder="Електронна пошта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Увійти</button>
            <p className="forgot-password" onClick={onForgotPassword}>
                Забули пароль?
            </p>
        </form>
    );
};

export default SignIn;
