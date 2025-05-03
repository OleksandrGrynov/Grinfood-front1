import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children, openAuth, allowedRoles }) => {
    const [user, setUser] = useState(undefined);
    const [role, setRole] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                const res = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setRole(data.role);
            }
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    if (user === undefined) return <div>Завантаження...</div>;

    if (!user) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Ви не авторизовані ❗</h2>
                <p>Будь ласка, увійдіть або зареєструйтесь, щоб продовжити.</p>
                <button
                    onClick={() => openAuth && openAuth('signin')}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    Увійти
                </button>
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', color: 'crimson' }}>
                <h2>🚫 Недостатньо прав</h2>
                <p>У вас немає доступу до цієї сторінки.</p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
