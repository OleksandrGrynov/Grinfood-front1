import React, { useState, useEffect } from 'react';

const OrderForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+380');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [paymentError, setPaymentError] = useState('');

    // Завантажити кошик
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartWithQuantity = storedCart.map(item => ({ ...item, quantity: item.quantity || 1 }));
        setItems(cartWithQuantity);
    }, []);

    // Перерахунок загальної суми
    useEffect(() => {
        const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const updateQuantity = (index, value) => {
        const updatedItems = [...items];
        updatedItems[index].quantity = Math.max(1, parseInt(value) || 1);
        setItems(updatedItems);
    };

    const removeItem = (index) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const handleSubmit = async () => {
        setNameError('');
        setPhoneError('');
        setAddressError('');
        setPaymentError('');

        // Перевірка імені (не можна вводити цифри)
        if (!name.trim() || /\d/.test(name)) {
            setNameError('❗ Введіть коректне ім’я без цифр');
            return;
        }

        // Перевірка телефону (лише чи введено значення)
        if (!phone.trim()) {
            setPhoneError('❗ Введіть номер телефону');
            return;
        }

        // Перевірка адреси
        if (!address.trim()) {
            setAddressError('❗ Введіть вашу адресу');
            return;
        }

        // Перевірка методу оплати
        if (!paymentMethod) {
            setPaymentError('❗ Оберіть метод оплати');
            return;
        }

        const order = {
            customer: { name, phone, address, paymentMethod },
            items,
            total,
        };

        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order),
        });

        if (res.ok) {
            alert('✅ Замовлення відправлено');
            localStorage.removeItem('cart');
            setItems([]);
            setTotal(0);
        } else {
            alert('❌ Помилка при надсиланні замовлення');
        }
    };

    // Маска для телефону, дозволяє тільки цифри після +380
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^\d+]/g, ''); // дозволяємо тільки цифри і '+'

        if (value.startsWith('+380') && value.length <= 13) {
            value = value.replace(/(\+380)(\d{3})(\d{3})(\d{3})/, '+380 $2 $3 $4');
        }

        if (value.length <= 13) {
            setPhone(value);
        }
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    // Обробка зміни імені (щоб не вводились цифри)
    const handleNameChange = (e) => {
        const value = e.target.value.replace(/[0-9]/g, ''); // видаляємо всі цифри
        setName(value);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Оформлення замовлення</h2>

            {items.length === 0 ? (
                <p>Кошик порожній 🛒</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {items.map((item, idx) => (
                        <li key={idx} style={{
                            marginBottom: '15px',
                            padding: '10px',
                            background: '#fff',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px'
                        }}>
                            <img src={item.image} alt={item.name} width="70" height="70" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ flexGrow: 1 }}>
                                <strong>{item.name}</strong><br />
                                <span>{item.price}₴</span>
                            </div>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(idx, e.target.value)}
                                style={{ width: '60px' }}
                            />
                            <button onClick={() => removeItem(idx)} style={{ color: 'red' }}>✖</button>
                        </li>
                    ))}
                </ul>
            )}

            <p><strong>Загальна сума:</strong> {total}₴</p>

            <input
                placeholder="Ваше ім’я"
                value={name}
                onChange={handleNameChange}
            />
            {nameError && <p style={{ color: 'red' }}>{nameError}</p>}

            <input
                placeholder="Номер телефону"
                value={phone}
                onChange={handlePhoneChange}
            />
            {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}

            <input
                placeholder="Ваша адреса"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            {addressError && <p style={{ color: 'red' }}>{addressError}</p>}

            <div>
                <label>
                    <select value={paymentMethod} onChange={handlePaymentChange}>
                        <option value="">Оберіть метод оплати</option>
                        <option value="cash">Готівка</option>
                        <option value="card">Карта</option>
                    </select>
                </label>
            </div>
            {paymentError && <p style={{ color: 'red' }}>{paymentError}</p>}

            <button onClick={handleSubmit} disabled={items.length === 0}>
                Замовити
            </button>
        </div>
    );
};

export default OrderForm;
