import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/VerifyEmail.scss';

const VerifyEmail = () => {
    const [params] = useSearchParams();
    const uid = params.get('uid');
    const [status, setStatus] = useState('⏳ Перевірка...');
    const navigate = useNavigate();

    useEffect(() => {
        if (!uid) {
            setStatus('❌ Недійсне посилання.');
            return;
        }

        // ВАЖЛИВО: бекенд очікує GET /verify-email?uid=...
        fetch(`${process.env.REACT_APP_API_URL}/verify-email?uid=${uid}`)
            .then(res => {
                if (!res.ok) throw new Error('Сервер повернув помилку');
                return res.text(); // неважливо що повертає, ми редіректимо
            })
            .then(() => {
                setStatus('✅ Пошта успішно підтверджена!');
                setTimeout(() => navigate('/profile?verified=true'), 3000);
            })
            .catch(() => setStatus('❌ Не вдалося підтвердити пошту.'));
    }, [uid, navigate]);

    return (
        <div className="verify-container">
            <div className="verify-card">
                <h2>{status}</h2>
                <p style={{ marginTop: '10px' }}>Ви будете автоматично перенаправлені...</p>
            </div>
        </div>
    );
};

export default VerifyEmail;
