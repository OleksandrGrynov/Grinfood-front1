import React, { useState, useEffect } from 'react';
import { useCart } from './components/CartContext';
import { toast } from 'react-toastify';
import './OrderForm.scss';
import MapView from './MapView';
import { sendOtp, verifyOtp, submitOrder } from './api';

const OrderForm = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+380');
    const [street, setStreet] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [showPaymentButtons, setShowPaymentButtons] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [total, setTotal] = useState(0);

    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const { cartItems, clearCart, updateQuantity, removeItem } = useCart();

    const address = `${street} ${houseNumber}`.trim();

    useEffect(() => {
        const newTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotal(newTotal);
    }, [cartItems]);

    const sendVerificationCode = async () => {
        if (!phone || phone.length < 13) {
            setPhoneError('❗ Введіть коректний номер телефону');
            return;
        }

        const data = await sendOtp(phone);

        if (data.status === 'pending') {
            toast.success('📲 Код відправлено!');
        } else {
            toast.error('❌ Не вдалося надіслати код');
        }
    };

    const confirmCode = async () => {
        if (!verificationCode.trim()) {
            toast.error('❗ Введіть код підтвердження');
            return;
        }

        const data = await verifyOtp(phone, verificationCode);

        if (data.status === 'approved') {
            setPhoneVerified(true);
            toast.success('✅ Номер підтверджено!');
        } else {
            toast.error('❌ Невірний код');
        }
    };

    const sendOrder = async (paymentStatus) => {
        try {
            const order = {
                items: cartItems,
                total,
                customer: { name, phone },
                address: `Хмельницький, ${address}`,
                paymentMethod: paymentStatus
            };

            const response = await submitOrder(order);

            if (response.error) throw new Error(response.error);

            clearCart();
            setShowPaymentButtons(false);
            toast.success('✅ Замовлення успішно створено!');
            setName('');
            setPhone('+380');
            setStreet('');
            setHouseNumber('');
            setPaymentMethod('');
            setPhoneVerified(false);
            setVerificationCode('');
        } catch (error) {
            toast.error('❌ Помилка при створенні замовлення');
        }
    };

    const handleFakePayment = async (provider) => {
        setLoadingPayment(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await sendOrder(`card (${provider} оплачено)`);
            alert(`✅ Оплата через ${provider} успішна! Замовлення створено.`);
        } finally {
            setLoadingPayment(false);
        }
    };

    const handleSubmit = async () => {
        setNameError('');
        setPhoneError('');
        setAddressError('');
        setPaymentError('');

        if (!name.trim() || /\d/.test(name)) {
            setNameError('❗ Введіть коректне ім’я без цифр');
            return;
        }
        if (!phone.trim() || phone.length < 13) {
            setPhoneError('❗ Введіть коректний номер телефону');
            return;
        }
        if (!street.trim() || !houseNumber.trim()) {
            setAddressError('❗ Введіть вулицю та номер будинку');
            return;
        }
        if (!paymentMethod) {
            setPaymentError('❗ Оберіть метод оплати');
            return;
        }
        if (!phoneVerified) {
            setPhoneError('📲 Підтвердіть номер телефону через SMS');
            return;
        }

        if (paymentMethod === 'card') {
            setShowPaymentButtons(true);
        } else {
            await sendOrder('готівка');
        }
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^\d+]/g, '');
        if (!value.startsWith('+380')) value = '+380';
        if (value.length > 13) value = value.slice(0, 13);
        setPhone(value);
    };

    const buttonStyle = (backgroundColor) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '10px', width: '100%', maxWidth: '300px', padding: '12px 20px',
        margin: '10px 0', borderRadius: '8px', fontSize: '16px',
        fontWeight: 'bold', cursor: 'pointer', border: 'none', color: 'white',
        transition: 'all 0.3s ease', backgroundColor
    });

    const spinnerStyle = {
        width: '40px', height: '40px', border: '5px solid #f3f3f3',
        borderTop: '5px solid #4285F4', borderRadius: '50%',
        animation: 'spin 1s linear infinite', margin: '20px auto'
    };

    const spinnerKeyframes = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <div className="orderFormWrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <style>{spinnerKeyframes}</style>
            <div className="orderForm" style={{ flex: 1, minWidth: '350px' }}>
                <h2>Оформлення замовлення</h2>
                <h3>🛒 Товари в кошику:</h3>
                {cartItems.length === 0 ? (
                    <p>Кошик порожній</p>
                ) : (
                    cartItems.map((item, index) => (
                        <div className="cartItem" key={item.id}>
                            <img src={item.image} alt={item.name} />
                            <div className="details">
                                <strong>{item.name}</strong>
                                <p>{item.price}₴</p>
                            </div>
                            <div className="quantityControls">
                                <button onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}>−</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                            </div>
                            <button onClick={() => removeItem(index)} className="removeBtn">🗑</button>
                        </div>
                    ))
                )}

                <p><strong>Загальна сума:</strong> {total}₴</p>

                <input placeholder="Ваше ім’я" value={name} onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))} />
                {nameError && <p style={{ color: 'red' }}>{nameError}</p>}

                <input placeholder="Номер телефону" value={phone} onChange={handlePhoneChange} />
                {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}

                {!phoneVerified && (
                    <>
                        <input placeholder="Код" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                        <button onClick={confirmCode} className="smsButton confirm">✅ Підтвердити код</button>
                        <button onClick={sendVerificationCode} className="smsButton send">📲 Надіслати SMS-код</button>

                    </>
                )}
                {phoneVerified && <p style={{ color: 'green' }}>✅ Підтверджено</p>}

                <input placeholder="Вулиця" value={street} onChange={(e) => setStreet(e.target.value)} />
                <input placeholder="№ будинку" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
                {addressError && <p style={{ color: 'red' }}>{addressError}</p>}

                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Оберіть метод оплати</option>
                    <option value="cash">Готівка</option>
                    <option value="card">Карта (Google/Apple Pay)</option>
                </select>
                {paymentError && <p style={{ color: 'red' }}>{paymentError}</p>}

                {!showPaymentButtons ? (
                    <button
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0}
                        className="submitOrderBtn"
                    >
                        Замовити
                    </button>

                ) : loadingPayment ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={spinnerStyle}></div>
                        <p><strong>Оплата триває...</strong></p>
                    </div>
                ) : (
                    <div>
                        <button onClick={() => handleFakePayment('Google Pay')} style={buttonStyle('#4285F4')}>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROIppzLqCf0VqsxIo3tBzMe2OzdipG3iIMIg&s" alt="Google" width="20" />
                            Оплатити через Google Pay
                        </button>
                        <button onClick={() => handleFakePayment('Apple Pay')} style={buttonStyle('#000')}>
                            <img src="https://cdn-icons-png.flaticon.com/512/5968/5968279.png" alt="Apple" width="20" />
                            Оплатити через Apple Pay
                        </button>
                    </div>
                )}
            </div>
            <div style={{ flex: 1, minWidth: '350px', height: '600px' }}>
                <MapView address={`Хмельницький, ${address}`} />
            </div>
        </div>
    );
};

export default OrderForm;
