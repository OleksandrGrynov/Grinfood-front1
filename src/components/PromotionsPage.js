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
import '../styles/PromotionsPage.scss';

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
        <Container className="promotions-page">
            <Typography className="title" variant="h3">
                ✨ Акції та пропозиції
            </Typography>

            <div className="promo-grid">
                {promotions.map((promo) => (
                    <div className="promo-card" key={promo.id} onClick={() => handleOpenModal(promo)} style={{ cursor: 'pointer' }}>

                    {promo.image && (
                            <img
                                src={promo.image}
                                alt={promo.title}
                                className="promo-image"
                            />
                        )}
                        <div className="promo-content">
                            <Typography variant="h6">{promo.title}</Typography>
                            <Button
                                variant="contained"
                                color="warning"
                                fullWidth
                                onClick={() => handleOpenModal(promo)}
                            >
                                Детальніше
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Transition}
                className="promo-dialog"
            >
                {selectedPromo?.image && (
                    <img
                        src={selectedPromo.image}
                        alt={selectedPromo.title}
                    />
                )}
                <DialogTitle>
                    <Typography variant="h6">{selectedPromo?.title}</Typography>
                    <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 12, right: 12, height: 50, width: 50 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body1">
                        {selectedPromo?.description}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default PromotionsPage;
