import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, sendEmailVerification, reload, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await reload(firebaseUser); // ensure latest data
                setUser(firebaseUser);
                setName(firebaseUser.displayName || '');
                setEmail(firebaseUser.email || '');
                setIsEmailVerified(firebaseUser.emailVerified);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    const handleSendVerification = async () => {
        try {
            if (user) {
                await sendEmailVerification(user);
                alert('✅ Лист підтвердження надіслано на вашу пошту.');
                setTimeout(async () => {
                    await reload(user);
                    setIsEmailVerified(user.emailVerified);
                }, 3000);
            }
        } catch (error) {
            console.error('❌ Error sending verification email:', error);
            alert('Помилка при надсиланні листа підтвердження.');
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

                const response = await fetch('http://localhost:5000/api/update-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ newEmail })
                });

                const contentType = response.headers.get('content-type');
                const isJSON = contentType && contentType.includes('application/json');
                const result = isJSON ? await response.json() : await response.text();

                if (!response.ok) {
                    console.error('❌ Backend response:', result);
                    throw new Error(isJSON ? result.error : `Server returned HTML: ${result.slice(0, 100)}...`);
                }

                await user.getIdToken(true);  // оновити токен ще раз після зміни
                await reload(user);

                setEmail(user.email || newEmail);
                setNewEmail('');
                setIsEmailVerified(user.emailVerified || false);

                await sendEmailVerification(user);
                alert('✅ Лист підтвердження на нову пошту відправлено!');
            }
        };

        try {
            await tryUpdateProfile();
            setSuccessMessage('✅ Профіль оновлено успішно!');
        } catch (error) {
            console.error('❌ Error updating profile:', error);

            // 🛡️ Якщо токен протермінований — спробувати оновити токен і повторити ще раз
            if (error.code === 'auth/user-token-expired' || error.message.includes('token-expired')) {
                try {
                    console.log('🔄 Token expired, refreshing...');
                    await user.getIdToken(true);
                    await tryUpdateProfile();  // повторно викликати
                    setSuccessMessage('✅ Профіль оновлено після оновлення токена!');
                } catch (innerError) {
                    console.error('❌ Retry after token refresh failed:', innerError);
                    setErrorMessage(innerError.message || 'Помилка при повторній спробі оновлення профілю.');
                }
            } else {
                setErrorMessage(error.message || 'Помилка при оновленні профілю.');
            }
        }
    };


    if (loading) return <p>Завантаження профілю...</p>;

    return (
        <div style={{
            maxWidth: '500px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: '#fff'
        }}>
            <h2>Мій профіль</h2>

            <label style={{ display: 'block', marginBottom: '10px' }}>
                Ім'я:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                        width: '100%', padding: '10px', marginTop: '5px',
                        borderRadius: '6px', border: '1px solid #ccc'
                    }}
                />
            </label>

            <label style={{ display: 'block', marginBottom: '10px' }}>
                Поточний Email:
                <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '10px', marginTop: '5px'
                }}>
                    <input
                        type="email"
                        value={email}
                        disabled
                        style={{
                            flexGrow: 1, padding: '10px',
                            borderRadius: '6px', border: '1px solid #ccc',
                            background: '#eee'
                        }}
                    />
                    {isEmailVerified ? (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Підтверджено</span>
                    ) : (
                        <button
                            onClick={handleSendVerification}
                            style={{
                                color: 'red',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🔴 Не підтверджено
                        </button>
                    )}
                </div>
            </label>

            <label style={{ display: 'block', marginBottom: '20px' }}>
                Новий Email:
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Введіть нову пошту"
                    style={{
                        width: '100%', padding: '10px', marginTop: '5px',
                        borderRadius: '6px', border: '1px solid #ccc'
                    }}
                />
            </label>

            <button
                onClick={handleSave}
                style={{
                    width: '100%', padding: '12px',
                    backgroundColor: '#4CAF50', color: 'white',
                    border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '16px',
                    marginBottom: '15px'
                }}
            >
                Зберегти зміни
            </button>

            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <Link to="/" style={{
                display: 'block',
                marginTop: '20px',
                textAlign: 'center',
                textDecoration: 'none',
                color: '#4285F4',
                fontWeight: 'bold'
            }}>
                ⬅️ Повернутися на головну
            </Link>
        </div>
    );
};

export default ProfilePage;
