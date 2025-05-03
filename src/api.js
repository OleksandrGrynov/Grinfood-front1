const API_URL = process.env.REACT_APP_API_URL;

export async function fetchMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch menu:", error);
        return [];
    }
}

export async function submitOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Failed to submit order');
        return await response.json();
    } catch (error) {
        console.error("Failed to submit order:", error);
        return { error: 'Failed to submit order' };
    }
}

export const fetchLatestMenuItems = async () => {
    const all = await fetchMenu();
    return all
        .filter(item => item.active !== false) // якщо є поле "active"
        .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds) // якщо є поле createdAt
        .slice(0, 3); // тільки 3 останні
};

export async function fetchPromotions() {
    try {
        const response = await fetch(`${API_URL}/promotions`);
        if (!response.ok) throw new Error('Failed to fetch promotions');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch promotions:", error);
        return [];
    }
}
export async function sendOtp(phone) {
    try {
        const response = await fetch(`${API_URL}/verify/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, code }),
        });
        return await response.json();
    } catch (error) {
        console.error('❌ Failed to verify OTP:', error);
        return { error: error.message };
    }
}
