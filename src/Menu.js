// ✅ ОНОВЛЕНИЙ Menu.js з однаковими розмірами карток
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container, Grid, Card, CardContent, CardMedia, Typography,
    Button, TextField, Stack, Chip, Select, MenuItem, InputLabel,
    FormControl, Box
} from '@mui/material';
import { fetchMenu } from './api';
import { useCart } from './components/CartContext';
import { toast } from 'react-toastify';
import DishModal from './components/DishModal';

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

    return (
        <Container sx={{ py: 5 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                🍽 Меню
            </Typography>

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
                                sx={{ mb: { xs: 1, sm: 0 } }}
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

            <Grid container spacing={3} alignItems="stretch">
                {filteredMenu.map(item => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} sx={{ display: 'flex' }}>
                        <Card
                            onClick={() => setSelectedDish(item)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                height: '100%',
                                justifyContent: 'space-between',
                                borderRadius: 3,
                                boxShadow: 4,
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.02)' }
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={item.image}
                                alt={item.name}
                                sx={{
                                    height: 180,
                                    objectFit: 'cover',
                                    borderTopLeftRadius: 12,
                                    borderTopRightRadius: 12
                                }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    💰 {item.price} ₴
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    📂 {item.category}
                                </Typography>
                            </CardContent>
                            <Box sx={{ p: 2 }}>
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

            <DishModal
                open={!!selectedDish}
                onClose={() => setSelectedDish(null)}
                dish={selectedDish}
            />
        </Container>
    );
};

export default Menu;