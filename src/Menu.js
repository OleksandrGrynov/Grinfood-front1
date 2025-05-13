import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container, Grid, Typography, Button, TextField, Stack,
    Chip, Select, MenuItem, InputLabel, FormControl, Box, CardContent, CardMedia, Card
} from '@mui/material';
import { fetchMenu, fetchUserOrders } from './api';
import { useCart } from './components/CartContext';
import { toast } from 'react-toastify';
import DishModal from './components/DishModal';
import OrderHistoryDialog from './components/OrderHistoryDialog';
import './styles/Menu.scss';

const categories = ['Усі', 'Бургери', 'Піца', 'Снеки', 'Напої', 'Салати', 'Десерти'];
const sortOptions = [
    { label: 'За назвою (А-Я)', value: 'name_asc' },
    { label: 'За назвою (Я-А)', value: 'name_desc' },
    { label: 'За ціною (дешевше)', value: 'price_asc' },
    { label: 'За ціною (дорожче)', value: 'price_desc' }
];

const Menu = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const categoryFromUrl = query.get('category');

    const [menu, setMenu] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('Усі');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name_asc');
    const [selectedDish, setSelectedDish] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        fetchMenu().then(setMenu);
    }, []);

    useEffect(() => {
        if (categoryFromUrl && categories.includes(categoryFromUrl)) {
            setCategoryFilter(categoryFromUrl);
        }
    }, [categoryFromUrl]);

    const sortMenu = (items) => {
        switch (sortBy) {
            case 'name_asc': return [...items].sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc': return [...items].sort((a, b) => b.name.localeCompare(a.name));
            case 'price_asc': return [...items].sort((a, b) => a.price - b.price);
            case 'price_desc': return [...items].sort((a, b) => b.price - a.price);
            default: return items;
        }
    };

    const filteredMenu = sortMenu(
        menu.filter(item => {
            const byCategory = categoryFilter === 'Усі' || item.category === categoryFilter;
            const bySearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return byCategory && bySearch;
        })
    );

    const handleLoadOrders = async () => {
        try {
            const data = await fetchUserOrders();
            setOrders(data);
            setOrdersOpen(true);
        } catch (err) {
            toast.error('❌ Не вдалося завантажити замовлення');
        }
    };

    return (
        <Container className="menu-wrapper">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                🍽 Меню
            </Typography>

            <Box mb={2}>
                <Button variant="outlined" onClick={handleLoadOrders}>
                    📦 Мої замовлення
                </Button>
            </Box>

            <Stack spacing={2} mb={4}>
                <TextField
                    label="🔍 Пошук страви..."
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {categories.map(cat => (
                            <Chip
                                key={cat}
                                label={cat}
                                clickable
                                variant={cat === categoryFilter ? 'filled' : 'outlined'}
                                color={cat === categoryFilter ? 'primary' : 'default'}
                                onClick={() => setCategoryFilter(cat)}
                            />
                        ))}
                    </Stack>

                    <FormControl sx={{ minWidth: 220 }} size="small">
                        <InputLabel>Сортувати</InputLabel>
                        <Select
                            value={sortBy}
                            label="Сортувати"
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Stack>

            <Grid container spacing={2} className="menu-grid">
                {filteredMenu.map(item => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                        <Card
                            className="menu-item-card"
                            onClick={() => setSelectedDish(item)}
                            style={{ cursor: 'pointer' }}
                        >
                            <CardMedia
                                component="img"
                                image={item.image}
                                alt={item.name}
                                className="menu-item-image"
                            />
                            <CardContent>
                                <Typography variant="subtitle1">{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    💰 {item.price} ₴
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    📂 {item.category}
                                </Typography>
                            </CardContent>
                            <Box px={2} pb={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addItem(item);
                                        toast.success(`${item.name} додано до кошика 🛒`);
                                    }}
                                >
                                    🛒 Додати в кошик
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                ))}
            </Grid>

            <DishModal open={!!selectedDish} onClose={() => setSelectedDish(null)} dish={selectedDish} />
            <OrderHistoryDialog open={ordersOpen} onClose={() => setOrdersOpen(false)} orders={orders} />
        </Container>
    );
};

export default Menu;
