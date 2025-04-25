import React, { useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';

const SignUp = ({ onSuccess, setError }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Не вдалося зареєструватися');

            console.log('✅ Реєстрація успішна:', data);

            // ✅ Після бекенду — оновлюємо displayName через Firebase Auth
            const auth = getAuth();
            await auth.currentUser.reload(); // оновлюємо дані користувача
            await updateProfile(auth.currentUser, { displayName: name });

            // ⟳ Перезавантаження, щоб Header показав нове ім'я
            window.location.reload();

        } catch (err) {
            console.error('❌ Реєстрація помилка:', err.message);
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSignUp}>

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
            <button type="submit">Зареєструватися</button>
        </form>
    );
};

export default SignUp;
