import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useTheme,
    Slide,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchPromotions } from '../api';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const PromotionsPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchPromotions();
                const now = new Date();
                const activePromos = res.filter(p => {
                    const start = p.startDate?.seconds ? new Date(p.startDate.seconds * 1000) : null;
                    const end = p.endDate?.seconds ? new Date(p.endDate.seconds * 1000) : null;
                    return (
                        p.active &&
                        (!start || start <= now) &&
                        (!end || end >= now)
                    );
                });
                setPromotions(activePromos);
            } catch (e) {
                console.error('Failed to fetch promotions:', e);
            }
        };
        load();
    }, []);

    const handleOpenModal = (promo) => {
        setSelectedPromo(promo);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedPromo(null);
    };

    return (
        <Container sx={{ py: 6 }}>
            <Typography variant="h3" fontWeight={600} textAlign="center" mb={4}>
                ✨ Акції та пропозиції
            </Typography>
            <Grid container spacing={4}>
                {promotions.map((promo) => (
                    <Grid item xs={12} sm={6} md={4} key={promo.id}>
                        <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
                            {promo.image && (
                                <CardMedia
                                    component="img"
                                    image={promo.image}
                                    alt={promo.title}
                                    sx={{ height: 180, objectFit: 'cover' }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {promo.title}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => handleOpenModal(promo)}
                                    sx={{ mt: 2 }}
                                    fullWidth
                                >
                                    Детальніше
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Transition}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                    }
                }}
            >
                {selectedPromo?.image && (
                    <Box sx={{ height: 200, overflow: 'hidden' }}>
                        <img
                            src={selectedPromo.image}
                            alt={selectedPromo.title}
                            style={{ width: '100%', objectFit: 'cover' }}
                        />
                    </Box>
                )}

                <DialogTitle sx={{ px: 3, pt: 2, pb: 1 }}>
                    <Typography variant="h6">{selectedPromo?.title}</Typography>
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{ position: 'absolute', top: 12, right: 12, height: 50, width: 50 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ px: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedPromo?.description}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default PromotionsPage;
