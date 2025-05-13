import React, { useState } from 'react';
import {
    Box, Typography, CircularProgress, TextField, Button,
    Grid, Card, CardContent, Stack
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchProductDemand, fetchRevenue, fetchDailyRevenue } from '../api';

const ManagerAnalytics = () => {
    const [demand, setDemand] = useState({ most: [], least: [] });
    const [revenue, setRevenue] = useState(null);
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const toISO = (value) => {
        const d = new Date(value);
        if (isNaN(d)) return null;
        return d.toISOString().slice(0, 10);
    };

    const handleFetch = async () => {
        const start = toISO(startDate);
        const end = toISO(endDate);

        if (!start || !end) return alert('📅 Вкажи коректні дати');

        setLoading(true);
        try {
            const [demandData, revenueData, dailyData] = await Promise.all([
                fetchProductDemand(start, end),
                fetchRevenue(start, end),
                fetchDailyRevenue(start, end)
            ]);
            setDemand(demandData);
            setRevenue(revenueData.revenue);
            setDailyRevenue(dailyData);
        } catch (err) {
            console.error("❌ Fetch error:", err);
            alert('❌ Не вдалося отримати аналітику');
        } finally {
            setLoading(false);
        }
    };

    const renderProductList = (items) => (
        <Grid container spacing={2}>
            {items.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                            <Typography variant="body2">Замовлено: {item.count}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>📊 Аналітика менеджера</Typography>

            <Stack direction="row" spacing={2} mb={3}>
                <TextField
                    label="Початок"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="Кінець"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <Button variant="contained" onClick={handleFetch}>🔍 Пошук</Button>
            </Stack>

            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        💰 Виручка за період: <strong>{revenue?.toLocaleString('uk-UA') || '—'} ₴</strong>
                    </Typography>

                    {dailyRevenue.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>📅 Динаміка виручки</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [`${value} ₴`, 'Виручка']}
                                        labelFormatter={(label) => `Дата: ${label}`}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>

                        </Box>
                    )}

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>📈 ТОП-5 найпопулярніших</Typography>
                        {demand.most.length > 0 ? renderProductList(demand.most) : <Typography>Немає даних</Typography>}
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>📉 ТОП-5 найменш популярних</Typography>
                        {demand.least.length > 0 ? renderProductList(demand.least) : <Typography>Немає даних</Typography>}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ManagerAnalytics;
