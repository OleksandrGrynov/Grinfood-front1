import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignIn = ({ onSuccess, setError, onForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        const auth = getAuth();

        try {
            // 🔐 Вхід через Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // 💾 Зберігаємо токен у localStorage
            localStorage.setItem('token', idToken);

            // 📌 Отримання ролі з бекенду
            const roleRes = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            const roleData = await roleRes.json();
            const role = roleData.role || 'user';
            localStorage.setItem('role', role);

            console.log('✅ Успішний вхід ➡️ Роль:', role);

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
