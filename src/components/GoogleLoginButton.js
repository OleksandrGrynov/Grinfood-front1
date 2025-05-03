import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const GoogleLoginButton = ({ onSuccess, setError }) => {
    const handleGoogleSignIn = async () => {
        try {
            const auth = getAuth();
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // 🛑 Перевірка: чи існує користувач у Firestore
            const checkRes = await fetch(`${process.env.REACT_APP_API_URL}/check-user-exists`, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            if (!checkRes.ok) {
                throw new Error('Користувача не знайдено. Спочатку зареєструйтесь через email.');
            }

            localStorage.setItem('token', idToken);

            const roleRes = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            const role = (await roleRes.json()).role || 'user';
            localStorage.setItem('role', role);

            onSuccess?.();
        } catch (error) {
            console.error('❌ Google Sign-In error:', error.message);
            setError?.(error.message);
        }
    };

    return <button onClick={handleGoogleSignIn}>🔐 Увійти через Google</button>;
};

export default GoogleLoginButton;
