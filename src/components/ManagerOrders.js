import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Card, CardContent, Button,
    Grid, Chip, Stack, CircularProgress, Snackbar, Alert, Grow
} from '@mui/material';
import { getAuth } from "firebase/auth";

const API_URL = process.env.REACT_APP_API_URL;

const ManagerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const getToken = async () => {
        const user = getAuth().currentUser;
        return user ? await user.getIdToken() : null;
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            const [pendingRes, confirmedRes] = await Promise.all([
                fetch(`${API_URL}/orders/by-status/pending`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/orders/by-status/confirmed`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            const pending = await pendingRes.json();
            const confirmed = await confirmedRes.json();

            const normalized = [...pending, ...confirmed]
                .filter(o => o.createdAt)
                .map(o => ({
                    ...o,
                    createdAt: o.createdAt?.seconds
                        ? new Date(o.createdAt.seconds * 1000)
                        : typeof o.createdAt === 'string'
                            ? new Date(o.createdAt)
                            : null
                }))
                .sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime());

            setOrders(normalized);
        } catch (error) {
            showSnackbar('Не вдалося завантажити замовлення', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Помилка відповіді від сервера');

            showSnackbar(`Замовлення оновлено: ${newStatus === 'confirmed' ? 'Підтверджено' : 'Скасовано'}`, 'success');
            fetchOrders();
        } catch (error) {
            showSnackbar('Помилка зміни статусу', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const pendingOrders = orders.filter(order => order.status === 'pending');
    const confirmedOrders = orders.filter(order => order.status === 'confirmed');

    return (
        <Container sx={{ py: 4 }}>
            {loading ? (
                <Stack alignItems="center" mt={8}>
                    <CircularProgress size={60} color="primary" />
                    <Typography mt={2}>Завантаження замовлень...</Typography>
                </Stack>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mt: 4 }}>🕒 Очікують підтвердження</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {pendingOrders.map(order => (
                            <Grow in key={order.id}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderLeft: '6px solid orange' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="bold">Клієнт: {order.customer?.name}</Typography>
                                            <Typography>📞 Телефон: {order.customer?.phone}</Typography>
                                            <Typography>📍 Адреса: {order.address}</Typography>
                                            <Typography>💰 Сума: {order.total} грн</Typography>
                                            <Typography>💳 Оплата: {order.paymentMethod}</Typography>

                                            <Typography variant="subtitle2" sx={{ mt: 2 }}>🧾 Замовлені товари:</Typography>
                                            <ul style={{ marginTop: '5px', marginBottom: '10px', paddingLeft: '20px' }}>
                                                {order.items?.map((item, idx) => (
                                                    <li key={idx}>{item.name} — <strong>{item.quantity}</strong> шт.</li>
                                                ))}
                                            </ul>

                                            <Stack direction="row" spacing={2} mt={2}>
                                                <Button variant="contained" color="success" onClick={() => updateStatus(order.id, 'confirmed')}>✅ Підтвердити</Button>
                                                <Button variant="outlined" color="error" onClick={() => updateStatus(order.id, 'cancelled')}>❌ Скасувати</Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grow>
                        ))}
                    </Grid>

                    <Typography variant="h6" sx={{ mt: 6 }}>✅ Підтверджені</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {confirmedOrders.map(order => (
                            <Grow in key={order.id}>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ borderLeft: '6px solid green' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" fontWeight="bold">Клієнт: {order.customer?.name}</Typography>
                                            <Typography>📞 Телефон: {order.customer?.phone}</Typography>
                                            <Typography>📍 Адреса: {order.address}</Typography>
                                            <Typography>💰 Сума: {order.total} грн</Typography>
                                            <Typography>💳 Оплата: {order.paymentMethod}</Typography>
                                            <Typography>
                                                🕒 Створено: {order.createdAt ? order.createdAt.toLocaleString('uk-UA') : '—'}
                                            </Typography>






                                            <Typography variant="subtitle2" sx={{ mt: 2 }}>🧾 Замовлені товари:</Typography>
                                            <ul style={{ marginTop: '5px', marginBottom: '10px', paddingLeft: '20px' }}>
                                                {order.items?.map((item, idx) => (
                                                    <li key={idx}>{item.name} — <strong>{item.quantity}</strong> шт.</li>
                                                ))}
                                            </ul>

                                            <Chip label="Підтверджено" color="success" sx={{ mt: 1 }} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grow>
                        ))}
                    </Grid>
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ManagerOrders;
