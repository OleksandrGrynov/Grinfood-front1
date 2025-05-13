import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Card, CardContent, Button,
    Grid, Chip, Stack, CircularProgress, Snackbar, Alert, Box
} from '@mui/material';
import { getAuth } from "firebase/auth";

const API_URL = process.env.REACT_APP_API_URL;

const CourierOrders = () => {
    const [freeOrders, setFreeOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [filter, setFilter] = useState('all');

    const getToken = async () => {
        const user = getAuth().currentUser;
        return user ? await user.getIdToken() : null;
    };

    const normalizeOrderDates = (orders) =>
        orders.map(order => ({
            ...order,
            createdAt: order.createdAt?.seconds
                ? new Date(order.createdAt.seconds * 1000)
                : typeof order.createdAt === 'string'
                    ? new Date(order.createdAt)
                    : null
        }));

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('No token');

            const [freeRes, myRes] = await Promise.all([
                fetch(`${API_URL}/courier/available-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_URL}/courier/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            const free = await freeRes.json();
            const my = await myRes.json();

            setFreeOrders(normalizeOrderDates(free));
            setMyOrders(normalizeOrderDates(my));
        } catch (error) {
            showSnackbar('Не вдалося завантажити замовлення', 'error');
        } finally {
            setLoading(false);
        }
    };

    const takeOrder = async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/courier/orders/${id}/assign`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('Замовлення взято', 'success');
            fetchOrders();
        } catch {
            showSnackbar('Помилка взяття замовлення', 'error');
        }
    };

    const completeOrder = async (id) => {
        try {
            const token = await getToken();
            await fetch(`${API_URL}/courier/orders/${id}/deliver`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar('Доставлено!', 'success');
            fetchOrders();
        } catch {
            showSnackbar('Помилка завершення доставки', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const filteredMyOrders = myOrders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>🚚 Курʼєр – Замовлення</Typography>

            {loading ? (
                <Stack alignItems="center" mt={6}><CircularProgress size={50} /></Stack>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mt: 3 }}>🆓 Вільні замовлення</Typography>
                    <Grid container spacing={2}>
                        {freeOrders.map(order => (
                            <Grid item xs={12} md={6} key={order.id}>
                                <Card>
                                    <CardContent>
                                        <Typography fontWeight="bold">{order.customer?.name}</Typography>
                                        <Typography
                                            component="a"
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ textDecoration: 'none', color: 'primary.main' }}
                                        >
                                            📍 {order.address}
                                        </Typography>
                                        <Typography>💳 {order.paymentMethod} — {order.total} грн</Typography>
                                        <Typography>🕒 {order.createdAt ? order.createdAt.toLocaleString('uk-UA') : '—'}</Typography>
                                        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => takeOrder(order.id)}>
                                            Взяти замовлення
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>Усі</Button>
                        <Button variant={filter === 'confirmed' ? 'contained' : 'outlined'} onClick={() => setFilter('confirmed')}>В роботі</Button>
                        <Button variant={filter === 'delivered' ? 'contained' : 'outlined'} onClick={() => setFilter('delivered')}>Завершені</Button>
                    </Stack>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                        ✅ Доставлено: {myOrders.filter(o => o.status === 'delivered').length}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 5 }}>📦 Мої замовлення</Typography>
                    <Grid container spacing={2}>
                        {filteredMyOrders.map(order => (
                            <Grid item xs={12} md={6} key={order.id}>
                                <Card>
                                    <CardContent>
                                        <Typography fontWeight="bold">{order.customer?.name}</Typography>
                                        {order.customer?.phone && (
                                            <Typography
                                                component="a"
                                                href={`tel:${order.customer.phone}`}
                                                sx={{ display: 'block', color: 'primary.main', textDecoration: 'none', mb: 1 }}
                                            >
                                                📞 {order.customer.phone}
                                            </Typography>
                                        )}

                                        <Typography
                                            component="a"
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ textDecoration: 'none', color: 'primary.main' }}
                                        >
                                            📍 {order.address}
                                        </Typography>
                                        <Typography>💰 {order.total} грн</Typography>
                                        <Typography>🕒 {order.createdAt ? order.createdAt.toLocaleString('uk-UA') : '—'}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <Typography component="span">📦 Статус:</Typography>
                                            <Chip
                                                label={order.status}
                                                color={order.status === 'delivered' ? 'success' : 'warning'}
                                            />
                                        </Box>
                                        {order.status === 'confirmed' && (
                                            <Button variant="contained" color="success" sx={{ mt: 2 }} onClick={() => completeOrder(order.id)}>
                                                ✅ Завершити доставку
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
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

export default CourierOrders;
