import React, { useEffect, useState } from 'react';
import {
    Container, TextField, Button, CardContent,
    Grid, Snackbar, Alert, Typography, Select, MenuItem, InputAdornment
} from '@mui/material';
import { Edit, Delete, Category, Image, Title, AttachMoney, Description } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL;
const CATEGORIES = ['Бургери', 'Піца', 'Снеки', 'Напої', 'Салати', 'Десерти'];

const StyledCard = styled('div')(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 420,
    overflow: 'hidden',
    backgroundColor: '#fff'
}));

const StyledImage = styled('img')({
    width: '100%',
    height: 160,
    objectFit: 'cover'
});

const ManagerMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [form, setForm] = useState({ name: '', price: '', image: '', category: 'Бургери', description: '' });
    const [initialForm, setInitialForm] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const getToken = async () => {
        const user = getAuth().currentUser;
        return user ? await user.getIdToken() : null;
    };

    const fetchMenu = async () => {
        try {
            const res = await fetch(`${API_URL}/menu`);
            const data = await res.json();
            setMenuItems(data);
        } catch {
            showSnackbar('❌ Помилка завантаження меню', 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSubmit = async () => {
        const { name, price, image, category, description } = form;
        if (!name || !price || !image || !category) {
            return showSnackbar('⚠️ Заповніть усі поля', 'warning');
        }

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `${API_URL}/menu/${editingId}` : `${API_URL}/menu`;
        const body = JSON.stringify({ name, price: +price, image, category, description });

        try {
            const token = await getToken();
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body
            });

            if (res.ok) {
                showSnackbar(editingId ? '📝 Оновлено' : '✅ Додано');
                setForm({ name: '', price: '', image: '', category: 'Бургери', description: '' });
                setInitialForm(null);
                setEditingId(null);
                fetchMenu();
            } else {
                showSnackbar('❌ Помилка збереження', 'error');
            }
        } catch (err) {
            console.error('❌ Submit error:', err);
            showSnackbar('❌ Сталася помилка', 'error');
        }
    };

    const handleEdit = (item) => {
        const newForm = { ...item, description: item.description || '' };
        setForm(newForm);
        setInitialForm(newForm);
        setEditingId(item.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('❗ Видалити позицію?')) return;

        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/menu/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                showSnackbar('🗑 Видалено');
                fetchMenu();
            } else {
                showSnackbar('❌ Помилка видалення', 'error');
            }
        } catch (err) {
            console.error('❌ Delete error:', err);
            showSnackbar('❌ Сталася помилка', 'error');
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const isFormUnchanged = editingId && initialForm && JSON.stringify(form) === JSON.stringify(initialForm);

    return (
        <Container sx={{ py: 4 }}>
            <Grid container spacing={2} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Назва" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Title /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Ціна" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Зображення (URL)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><Image /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} displayEmpty fullWidth startAdornment={<InputAdornment position="start"><Category /></InputAdornment>}>
                        {CATEGORIES.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                    </Select>
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Опис" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2} InputProps={{ startAdornment: <InputAdornment position="start"><Description /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleSubmit} disabled={editingId ? isFormUnchanged : false} fullWidth>
                        {editingId ? 'Оновити' : 'Додати'}
                    </Button>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                        <StyledCard>
                            <StyledImage src={item.image} alt={item.name} />
                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" gutterBottom>{item.name}</Typography>
                                <Typography color="text.secondary">💰 {item.price}₴</Typography>
                                <Typography color="text.secondary">📂 {item.category}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 1 }}>
                                    {item.description || 'Без опису'}
                                </Typography>
                            </CardContent>
                            <Grid container spacing={1} sx={{ p: 2 }}>
                                <Grid item xs={6}>
                                    <Button onClick={() => handleEdit(item)} startIcon={<Edit />} fullWidth>
                                        Редагувати
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button color="error" onClick={() => handleDelete(item.id)} startIcon={<Delete />} fullWidth>
                                        Видалити
                                    </Button>
                                </Grid>
                            </Grid>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default ManagerMenu;
