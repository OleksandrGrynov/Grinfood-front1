import React, { useState } from 'react';
import { Container, Tabs, Tab, Box, Typography, Fade } from '@mui/material';
import ManagerOrders from './ManagerOrders';
import ManagerMenu from './ManagerMenu';
import ManagerPromotions from './ManagerPromotions'; // 🆕 імпорт нового компоненту
import ManagerAnalytics from './ManagerAnalytics'; // 🆕 Додали імпорт

const ManagerDashboard = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleChange = (_, newValue) => setActiveTab(newValue);

    return (
        <Container sx={{ pt: 4 }}>
            <Tabs
                value={activeTab}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                    '& .MuiTab-root': {
                        fontSize: '0.85rem',
                        minWidth: '110px',  // або ще менше, якщо потрібно
                        paddingX: 1,
                        textTransform: 'none',
                    },
                    '& .MuiTabs-indicator': {
                        height: 2,
                    }
                }}
            >
                <Tab label="📦 Замовлення" />
                <Tab label="🍔 Меню" />
                <Tab label="🎁 Акції" />
                <Tab label="📊 Статистика" />
            </Tabs>



            <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
                {activeTab === 0 && 'Менеджер: Замовлення'}
                {activeTab === 1 && 'Менеджер: Меню'}
                {activeTab === 2 && 'Менеджер: Акції'}
                {activeTab === 3 && 'Менеджер: Статистика'} {/* 🆕 */}
            </Typography>


            <Fade in={true} timeout={300}>
                <Box>
                    {activeTab === 0 && <ManagerOrders />}
                    {activeTab === 1 && <ManagerMenu />}
                    {activeTab === 2 && <ManagerPromotions />}
                    {activeTab === 3 && <ManagerAnalytics />} {/* 🆕 */}

                </Box>
            </Fade>
        </Container>
    );
};

export default ManagerDashboard;
