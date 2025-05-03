import React, { useEffect, useState } from 'react';
import {
    Container, TextField, Button, Card, CardContent,
    Grid, Snackbar, Alert, Stack, Typography, Switch, FormControlLabel
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const ManagerPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [form, setForm] = useState({
        title: '',
        description: '',
        image: '',
        startDate: '',
        endDate: '',
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const token = localStorage.getItem('token');

    const fetchPromotions = async () => {
        try {
            const res = await fetch(`${API_URL}/promotions/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPromotions(data);
        } catch {
            showSnackbar('❌ Помилка завантаження акцій', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async () => {
        const { title, description, image, startDate, endDate, active } = form;
        if (!title || !description || !image || !startDate || !endDate) {
            return showSnackbar('⚠️ Заповніть усі поля', 'warning');
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/promotions/${editingId}` : `${API_URL}/promotions`;

        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ title, description, image, startDate, endDate, active })
        });

        if (res.ok) {
            showSnackbar(editingId ? '📝 Акцію оновлено' : '✅ Акцію додано');
            setForm({
                title: '', description: '', image: '',
                startDate: '', endDate: '', active: true
            });
            setEditingId(null);
            fetchPromotions();
        } else {
            showSnackbar('❌ Помилка збереження', 'error');
        }
    };

    const handleEdit = (item) => {
        const formatDate = (value) => {
            if (value?.toDate) return value.toDate().toISOString().slice(0, 10);
            if (typeof value === 'string') return value;
            return '';
        };

        setForm({
            title: item.title,
            description: item.description,
            image: item.image,
            startDate: formatDate(item.startDate),
            endDate: formatDate(item.endDate),
            active: !!item.active
        });
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('❗ Видалити акцію?')) return;

        const res = await fetch(`${API_URL}/promotions/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            showSnackbar('🗑 Акцію видалено');
            fetchPromotions();
        } else {
            showSnackbar('❌ Помилка видалення', 'error');
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    return (
        <Container sx={{ py: 4 }}>

            <Stack spacing={2} my={3}>
                <TextField label="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
                <TextField label="Опис" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
                <TextField label="Зображення (URL)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} fullWidth />
                <TextField label="Початок" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="Завершення" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
                <FormControlLabel
                    control={
                        <Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    }
                    label="Активна"
                />
                <Button variant="contained" onClick={handleSubmit}>{editingId ? 'Оновити' : 'Додати'}</Button>
            </Stack>

            <Grid container spacing={2}>
                {promotions.map(promo => (
                    <Grid item xs={12} sm={6} md={4} key={promo.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{promo.title}</Typography>
                                <Typography variant="body2">{promo.description}</Typography>
                                <img src={promo.image} alt={promo.title} style={{ width: '100%', marginTop: 10, borderRadius: 6 }} />
                                <Stack direction="row" spacing={1} mt={2}>
                                    <Button onClick={() => handleEdit(promo)}>✏️ Редагувати</Button>
                                    <Button color="error" onClick={() => handleDelete(promo.id)}>🗑 Видалити</Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ManagerPromotions;
