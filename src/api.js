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
