import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ReviewsPage.scss';

const StarRating = ({ value, onChange, name }) => (
    <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={star <= value ? 'filled' : ''}
                onClick={() => onChange(name, star)}
            >
        ★
      </span>
        ))}
    </div>
);

const ReviewsPage = ({ openAuth }) => {
    const [reviews, setReviews] = useState([]);
    const [form, setForm] = useState({
        ratingMenu: 0,
        ratingStaff: 0,
        ratingDelivery: 0,
        comment: '',
    });
    const [loading, setLoading] = useState(false);
    const isAuthenticated = !!localStorage.getItem('token');

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/reviews`);
            setReviews(res.data);
        } catch (err) {
            console.error('❌ Error loading reviews:', err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCommentChange = (e) => {
        setForm((prev) => ({ ...prev, comment: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            openAuth('signin');
            return;
        }

        const { ratingMenu, ratingStaff, ratingDelivery, comment } = form;

        if ([ratingMenu, ratingStaff, ratingDelivery].includes(0)) {
            alert('Будь ласка, оцініть меню, персонал та доставку.');
            return;
        }

        if (!comment.trim()) {
            alert('Коментар не може бути порожнім.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL}/reviews`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForm({ ratingMenu: 0, ratingStaff: 0, ratingDelivery: 0, comment: '' });
            fetchReviews();
        } catch (err) {
            alert('Помилка при збереженні відгуку. Перевірте авторизацію.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reviews-page">
            <h2>Відгуки</h2>

            <form onSubmit={handleSubmit} className="review-form">
                <label>
                    Оцінка меню:
                    <StarRating name="ratingMenu" value={form.ratingMenu} onChange={handleChange} />
                </label>
                <label>
                    Оцінка персоналу:
                    <StarRating name="ratingStaff" value={form.ratingStaff} onChange={handleChange} />
                </label>
                <label>
                    Оцінка доставки:
                    <StarRating name="ratingDelivery" value={form.ratingDelivery} onChange={handleChange} />
                </label>
                <label>
                    Коментар:
                    <textarea value={form.comment} onChange={handleCommentChange} required />
                </label>
                <button type="submit" disabled={loading}>
                    Залишити відгук
                </button>
            </form>

            <div className="review-list">
                {reviews.map((r) => (
                    <div key={r.id} className="review-item">
                        <div className="review-header">
                            <strong>{r.userName || 'Анонім'}</strong>
                            <span className="review-date">
                {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : ''}
              </span>
                        </div>
                        <p><strong>Меню:</strong> {r.ratingMenu} ⭐</p>
                        <p><strong>Персонал:</strong> {r.ratingStaff} ⭐</p>
                        <p><strong>Доставка:</strong> {r.ratingDelivery} ⭐</p>
                        <p>{r.comment}</p>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsPage;
