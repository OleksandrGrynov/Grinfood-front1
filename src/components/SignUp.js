import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const SignUp = ({ onSuccess, setError }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Не вдалося зареєструватися');

            console.log('✅ Реєстрація успішна:', data);

            // 🔐 Вхід через кастомний токен з бекенду
            const auth = getAuth();
            await signInWithCustomToken(auth, data.token);
            const idToken = await auth.currentUser.getIdToken();

            localStorage.setItem('token', idToken);

            if (onSuccess) onSuccess();
            navigate('/');
        } catch (err) {
            console.error('❌ Реєстрація помилка:', err.message);
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSignUp}>
            <input type="text" placeholder="Ім’я" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder="Електронна пошта" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Зареєструватися</button>
        </form>
    );
};

export default SignUp;
