import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/OrderHistoryDialog.scss';

const OrderHistoryDialog = ({ open, onClose, orders }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                📦 Ваші попередні замовлення
                <IconButton onClick={onClose}
                            sx={{ width: 50, height: 50 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers className="order-history-dialog">
                {orders.length === 0 ? (
                    <Typography>Немає замовлень.</Typography>
                ) : (
                    orders.map(order => (
                        <Box key={order.id} className="order-block">
                            <Typography variant="subtitle1" fontWeight="bold">
                                #{order.id} — {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Сума: {order.total} ₴
                            </Typography>

                            <Grid container spacing={2} className="order-item-grid">
                                {order.items?.map(item => (
                                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                                        <Card className="order-item-card">
                                            <CardMedia
                                                component="img"
                                                image={item.image}
                                                alt={item.name}
                                                className="order-item-image"
                                            />
                                            <CardContent>
                                                <Typography variant="subtitle1">{item.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    💰 {item.price} ₴ × {item.quantity}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
};

export default OrderHistoryDialog;
