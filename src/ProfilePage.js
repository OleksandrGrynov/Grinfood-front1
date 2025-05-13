import React, { useState, useEffect } from 'react';
import {
    getAuth,
    updateProfile,
    reload,
    onAuthStateChanged
} from 'firebase/auth';
import { Link } from 'react-router-dom';
import './styles/ProfilePage.scss';

const ProfilePage = () => {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isCheckingVerification, setIsCheckingVerification] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await reload(firebaseUser);
                setUser(firebaseUser);
                setName(firebaseUser.displayName || '');
                setEmail(firebaseUser.email || '');
                setIsEmailVerified(firebaseUser.emailVerified);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    // ✅ ДОДАНО: перевірка, якщо повернулися з email-посилання
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('mode') === 'verifyEmail') {
            const checkEmailVerification = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    await reload(currentUser);
                    setIsEmailVerified(currentUser.emailVerified);
                }
            };
            setTimeout(checkEmailVerification, 2000); // дати Firebase 2с
        }
    }, []);

    useEffect(() => {
        setIsCheckingVerification(true);
        let attempts = 0;
        const maxAttempts = 20;

        const interval = setInterval(async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await reload(currentUser);
                const refreshedUser = getAuth().currentUser;
                if (refreshedUser?.emailVerified) {
                    setIsEmailVerified(true);
                    setIsCheckingVerification(false);
                    clearInterval(interval);
                }
            }

            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("⏱ Перевірка email закінчилась — таймаут.");
                setIsCheckingVerification(false);
                clearInterval(interval);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            setIsCheckingVerification(false);
        };
    }, [auth]);

    const handleSendVerification = async () => {
        try {
            if (user) {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/send-verification-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, uid: user.uid })
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Не вдалося надіслати лист');

                alert('✅ Лист підтвердження надіслано на вашу пошту.');
            }
        } catch (error) {
            console.error('❌ Error sending verification email:', error);
            alert('Помилка при надсиланні листа підтвердження.');
        }
    };
    const handleDeleteAccount = async () => {
        if (!window.confirm('Ви справді хочете видалити акаунт? Цю дію не можна скасувати.')) return;

        try {
            const token = await user.getIdToken(true);

            // 1. Видалення з бази (бекенд)
            const res = await fetch(`${process.env.REACT_APP_API_URL}/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Помилка видалення на бекенді');

            // 2. Видалення акаунта у Firebase
            await user.delete();

            // 3. Очистка і редірект
            localStorage.clear();
            alert('✅ Ваш акаунт успішно видалено.');
            window.location.href = '/';

        } catch (error) {
            console.error('❌ Error deleting account:', error);

            if (error.code === 'auth/requires-recent-login') {
                alert('⚠️ Увійдіть повторно, щоб видалити акаунт.');
            } else {
                // можливо, акаунт уже був видалений — спробуємо перевірити
                try {
                    await reload(user); // якщо видасть помилку — значить, акаунта вже нема
                    alert('❌ Помилка при видаленні акаунта.');
                } catch {
                    localStorage.clear();
                    alert('⚠️ Акаунт уже був видалений. Вас буде перенаправлено.');
                    window.location.href = '/';
                }
            }
        }
    };




    const handleSave = async () => {
        setSuccessMessage('');
        setErrorMessage('');

        if (!user) return;

        const tryUpdateProfile = async () => {
            if (user.displayName !== name && name.trim() !== '') {
                await updateProfile(user, { displayName: name });
            }

            if (newEmail.trim() !== '' && newEmail !== email) {
                const token = await user.getIdToken(true);

                const response = await fetch(`${process.env.REACT_APP_API_URL}/update-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ newEmail })
                });

                const contentType = response.headers.get('content-type');
                const isJSON = contentType && contentType.includes('application/json');
                const result = isJSON ? await response.json() : await response.text();

                if (!response.ok) {
                    console.error('❌ Backend response:', result);
                    throw new Error(isJSON ? result.error : 'Server error');
                }

                await user.getIdToken(true);
                await reload(user);

                setEmail(user.email || newEmail);
                setNewEmail('');
                setIsEmailVerified(user.emailVerified || false);

                await fetch(`${process.env.REACT_APP_API_URL}/send-verification-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newEmail, uid: user.uid })
                });

                alert('✅ Лист підтвердження на нову пошту відправлено!');
            }
        };

        try {
            await tryUpdateProfile();
            setSuccessMessage('✅ Профіль оновлено успішно!');
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            if (
                error.code === 'auth/user-token-expired' ||
                error.message.includes('token-expired')
            ) {
                try {
                    await user.getIdToken(true);
                    await tryUpdateProfile();
                    setSuccessMessage('✅ Профіль оновлено після оновлення токена!');
                } catch (innerError) {
                    setErrorMessage(innerError.message || 'Помилка при повторній спробі.');
                }
            } else {
                setErrorMessage(error.message || 'Помилка при оновленні профілю.');
            }
        }
    };

    if (loading) return <p>Завантаження профілю...</p>;

    return (
        <div className="profile-container">
            <h2>Мій профіль</h2>

            <label>
                Ім'я:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>

            <label>
                Поточний Email:
                <div className="email-row">
                    <input type="email" value={email} disabled />
                    {isEmailVerified ? (
                        <span className="verified">✅ Підтверджено</span>
                    ) : (
                        <div className="not-verified-wrapper">
                            <button onClick={handleSendVerification} className="not-verified">
                                🔴 Не підтверджено
                            </button>
                            {isCheckingVerification && (
                                <span className="checking">⏳ Перевіряємо...</span>
                            )}
                        </div>
                    )}
                </div>
            </label>

            <label>
                Новий Email:
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Введіть нову пошту"
                />
            </label>

            <button
                onClick={handleSave}
                className="save-button"
                disabled={!isEmailVerified}
                title={!isEmailVerified ? 'Підтвердіть email, щоб зберегти' : ''}
            >
                Зберегти зміни
            </button>


            {successMessage && <p className="success">{successMessage}</p>}
            {errorMessage && <p className="error">{errorMessage}</p>}

            <Link to="/" className="back-link">⬅️ Повернутися на головну</Link>
            <button
                onClick={handleDeleteAccount}
                className="delete-button"
                style={{ background: '#c62828', color: 'white', marginTop: '20px' }}
            >
                ❌ Видалити акаунт
            </button>

        </div>
    );
};

export default ProfilePage;
