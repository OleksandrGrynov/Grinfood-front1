import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Box
} from '@mui/material';
import { useCart } from './CartContext';

const UpsellModal = ({ open, onClose, suggestions, onProceed }) => {
    const { addItem } = useCart();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>🍽 Можливо, вам сподобається:</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    {suggestions.map((dish) => (
                        <Box
                            key={dish.id}
                            display="flex"
                            alignItems="center"
                            gap={2}
                            sx={{ borderBottom: '1px solid #eee', pb: 1 }}
                        >
                            <img
                                src={dish.image}
                                alt={dish.name}
                                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
                            />
                            <Box flexGrow={1}>
                                <Typography variant="subtitle1">{dish.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{dish.price} ₴</Typography>
                            </Box>
                            <Button
                                onClick={() => addItem(dish)}
                                variant="outlined"
                                size="small"
                            >
                                Додати
                            </Button>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Скасувати</Button>
                <Button variant="contained" color="primary" onClick={onProceed}>
                    Перейти в кошик
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpsellModal;
