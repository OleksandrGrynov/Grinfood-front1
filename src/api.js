// src/api.js

import { auth } from './firebase';

const API_URL = process.env.REACT_APP_API_URL;
console.log("🌍 API_URL =", API_URL);

const getToken = async () => {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
};

export async function fetchMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("❌ Failed to fetch menu:", error);
        return [];
    }
}

export async function submitOrder(orderData) {
    try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify(orderData),
        });

        // ⚠️ Не кидаємо помилку — просто лог
        let result;
        try {
            result = await response.json();
        } catch (err) {
            console.warn('⚠️ Не вдалося розпарсити JSON. Сервер міг не повернути тіло.');
            result = {};
        }

        return result;

    } catch (error) {
        console.error("❌ Мережева помилка submitOrder:", error);
        return { error: 'network' };
    }
}




export const fetchLatestMenuItems = async () => {
    const all = await fetchMenu();
    return all
        .filter(item => item.active !== false)
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
        .slice(0, 3);
};

export async function fetchPromotions() {
    try {
        const response = await fetch(`${API_URL}/promotions`);
        if (!response.ok) throw new Error('Failed to fetch promotions');
        return await response.json();
    } catch (error) {
        console.error("❌ Failed to fetch promotions:", error);
        return [];
    }
}

export async function sendOtp(phone) {
    try {
        const response = await fetch(`${API_URL}/verify/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        return await response.json();
    } catch (error) {
        console.error('❌ Failed to send OTP:', error);
        return { error: error.message };
    }
}

export async function verifyOtp(phone, code) {
    try {
        const response = await fetch(`${API_URL}/verify/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
        });
        return await response.json();
    } catch (error) {
        console.error('❌ Failed to verify OTP:', error);
        return { error: error.message };
    }
}

export async function fetchPopularProducts() {
    try {
        const token = await getToken();
        const response = await fetch(`${API_URL}/stats/popular-products`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) throw new Error('❌ Failed to fetch popular products');
        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching popular products:", error);
        return [];
    }
}
export async function fetchProductDemand(startDate, endDate) {
    try {
        const token = await getToken();
        const url = `${API_URL}/stats/demand?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) throw new Error('❌ Failed to fetch product demand');
        return await response.json();
    } catch (error) {
        console.error('❌ fetchProductDemand error:', error);
        return { most: [], least: [] };
    }
}
export async function fetchDailyRevenue(startDate, endDate) {
    try {
        const token = await getToken();
        const url = `${API_URL}/stats/revenue-daily?startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) throw new Error('❌ Daily revenue fetch failed');
        return await response.json(); // Очікується масив [{ date: '2025-05-01', revenue: 1234 }, ...]
    } catch (error) {
        console.error('❌ fetchDailyRevenue error:', error);
        return [];
    }
}
export async function fetchUserOrders() {
    const token = await getToken();
    const res = await fetch(`${API_URL}/my-orders`, {
        headers: {
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });
    if (!res.ok) throw new Error('❌ Failed to fetch user orders');
    return await res.json();
}

export const fetchRevenue = async (startDate, endDate) => {
    try {
        const token = await getToken();
        const url = `${API_URL}/stats/revenue?startDate=${startDate}&endDate=${endDate}`;
        console.log("📤 Revenue fetch:", url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            }
        });

        if (!response.ok) throw new Error(`❌ Revenue fetch failed: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('❌ fetchRevenue error:', error);
        return { revenue: 0 };
    }
};
