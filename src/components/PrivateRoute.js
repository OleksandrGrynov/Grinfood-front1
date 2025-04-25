import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
    const [user, setUser] = useState(undefined);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, [auth]);

    if (user === undefined) {
        return <div>Завантаження...</div>;
    }

    if (!user) {
        return <Navigate to="/" />; // просто редірект, без модалки
    }

    return children;
};

export default PrivateRoute;
