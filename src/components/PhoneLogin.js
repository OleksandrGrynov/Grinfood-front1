import React, { useState } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const PhoneLogin = ({ onSuccess, setError }) => {
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [confirmation, setConfirmation] = useState(null);

    const setupRecaptcha = () => {
        const auth = getAuth();
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                size: 'invisible',
            }, auth);
        }
    };

    const sendCode = async () => {
        try {
            setupRecaptcha();
            const auth = getAuth();
            const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
            setConfirmation(result);
        } catch (error) {
            console.error('❌ SMS error:', error.message);
            setError?.('Помилка відправки SMS');
        }
    };

    const verifyCode = async () => {
        try {
            const result = await confirmation.confirm(code);
            const token = await result.user.getIdToken();
            localStorage.setItem('token', token);

            const res = await fetch(`${process.env.REACT_APP_API_URL}/get-role`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const role = (await res.json()).role || 'user';
            localStorage.setItem('role', role);

            onSuccess?.();
        } catch (err) {
            console.error(err);
            setError?.('Невірний код');
        }
    };

    return (
        <div>
            <input
                type="tel"
                placeholder="Номер телефону (+380...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={sendCode}>Надіслати код</button>
            {confirmation && (
                <>
                    <input
                        type="text"
                        placeholder="SMS код"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <button onClick={verifyCode}>Підтвердити</button>
                </>
            )}
        </div>
    );
};

export default PhoneLogin;
