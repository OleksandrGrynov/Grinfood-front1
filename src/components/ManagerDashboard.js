import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography, Fade } from '@mui/material';
import ManagerOrders from './ManagerOrders';
import ManagerMenu from './ManagerMenu';
import ManagerPromotions from './ManagerPromotions'; // 🆕 імпорт нового компоненту

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (_, newValue) => setActiveTab(newValue);

    return (
        <Container sx={{ pt: 4 }}>
            <Tabs value={activeTab} onChange={handleChange} centered>
                <Tab label="📦 Замовлення" />
                <Tab label="🍔 Меню" />
                <Tab label="🎁 Акції" /> {/* 🆕 */}
            </Tabs>

            <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
                {activeTab === 0 && 'Менеджер: Замовлення'}
                {activeTab === 1 && 'Менеджер: Меню'}
                {activeTab === 2 && 'Менеджер: Акції'} {/* 🆕 */}
            </Typography>

            <Fade in={true} timeout={300}>
                <Box>
                    {activeTab === 0 && <ManagerOrders />}
                    {activeTab === 1 && <ManagerMenu />}
                    {activeTab === 2 && <ManagerPromotions />} {/* 🆕 */}
                </Box>
            </Fade>
        </Container>
    );
};

export default ManagerDashboard;
