import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, Typography, IconButton,
    DialogActions, Button, Box, Divider, Stack, Grow, useMediaQuery, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FolderIcon from '@mui/icons-material/Folder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const DishModal = ({ open, onClose, dish }) => {
    const { addItem } = useCart();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (open) setQuantity(1); // Скинути при відкритті
    }, [open]);

    if (!dish) return null;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem(dish);
        }
        toast.success(`${dish.name} ×${quantity} додано до кошика 🛒`);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Grow}
            scroll="body"
            PaperProps={{
                sx: {
                    position: 'relative'
                }
            }}
        >
            {/* Закриття у правому верхньому куті */}
            <IconButton
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    height: 50,
                    width: 50,
                    backgroundColor: 'white',
                    '&:hover': {
                        backgroundColor: '#f5f5f5'
                    },
                    boxShadow: 1
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogTitle sx={{ pr: 6, pl: 3, pt: 3 }}>
                <Typography variant="h6" component="div" noWrap={!isMobile}>
                    {dish.name}
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3 }}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3
                    }}
                >
                    <Box
                        component="img"
                        src={dish.image}
                        alt={dish.name}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: 220,
                            objectFit: 'contain',
                            borderRadius: 2,
                            boxShadow: 2
                        }}
                    />
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {dish.description?.trim() ? dish.description : 'Опис відсутній'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <AttachMoneyIcon color="success" />
                    <Typography variant="body1" fontWeight={600}>
                        {dish.price} ₴
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <FolderIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                        {dish.category}
                    </Typography>
                </Stack>

                <TextField
                    label="Кількість"
                    type="number"
                    size="small"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1 }}
                    fullWidth
                />
            </DialogContent>

            <DialogActions
                sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}
            >
                <Button
                    variant="contained"
                    fullWidth
                    color="success"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                >
                    Додати в кошик
                </Button>
                <Button onClick={onClose} color="inherit" fullWidth>
                    Закрити
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DishModal;
