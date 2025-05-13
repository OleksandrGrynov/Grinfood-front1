import React, { useState, useEffect } from 'react';
import { useCart } from './components/CartContext';
import { toast } from 'react-toastify';
import './styles/OrderForm.scss';
import MapView from './MapView';
import { sendOtp, verifyOtp, submitOrder } from './api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from './components/StripeCheckoutForm';
const RESTAURANT_COORDS = { lat: 49.422983, lng: 26.987133 };

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
    const [total, setTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [deliveryCost, setDeliveryCost] = useState(0);
    const [userCoords, setUserCoords] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [availablePromos, setAvailablePromos] = useState([]);
    const [selectedPromoId, setSelectedPromoId] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const { cartItems, clearCart, updateQuantity, removeItem } = useCart();

    const address = `${street} ${houseNumber}`.trim();

    const getCoordsFromAddress = async (address) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data.length === 0) return null;
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        } catch {
            return null;
        }
    };

    const calculateDistanceMeters = (coord1, coord2) => {
        const R = 6371000;
        const toRad = deg => deg * Math.PI / 180;
        const dLat = toRad(coord2.lat - coord1.lat);
        const dLon = toRad(coord2.lng - coord1.lng);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const calculateDeliveryCost = (meters) => {
        return Math.ceil(meters / 50);
    };

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/promotions`);
                const data = await res.json();
                setAvailablePromos(data);
            } catch (err) {
                console.error('❌ Error fetching promotions:', err);
            }
        };
        fetchPromos();
    }, []);


    useEffect(() => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountedTotal = subtotal - discount;
        const final = discountedTotal + deliveryCost;
        setTotal(final > 0 ? final : 0);
    }, [cartItems, discount, deliveryCost]);

    useEffect(() => {
        const selectedPromo = availablePromos.find(p => p.id === selectedPromoId);
        if (selectedPromo && selectedPromo.title.includes('-10%')) {
            const raw = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setDiscount(Math.floor(raw * 0.1));
        } else {
            setDiscount(0);
        }
    }, [selectedPromoId, cartItems, availablePromos]);

    const confirmCode = async () => {
        try {
            const success = await verifyOtp(phone, verificationCode);
            if (success) {
                setPhoneVerified(true);
                toast.success('📲 Номер підтверджено!');
            } else {
                toast.error('❌ Невірний код');
            }
        } catch (error) {
            toast.error('❌ Помилка при перевірці коду');
        }
    };

    const sendVerificationCode = async () => {
        try {
            await sendOtp(phone);
            toast.info('📩 SMS-код надіслано');
        } catch (error) {
            toast.error('❌ Не вдалося надіслати SMS');
        }
    };

    const locateAddress = async () => {
        if (!street.trim() || !houseNumber.trim()) return;
        const fullAddress = `Хмельницький, ${street} ${houseNumber}`;
        const coords = await getCoordsFromAddress(fullAddress);
        if (!coords) return;
        setUserCoords(coords);
        const distance = calculateDistanceMeters(RESTAURANT_COORDS, coords);
        const cost = calculateDeliveryCost(distance);
        setDeliveryCost(cost);
    };

    const applyPromoCode = () => {
        if (promoCode.trim().toUpperCase() === 'GRIN10') {
            setDiscount(50);
            toast.success('🎉 Промокод GRIN10 застосовано! -50₴');
        } else {
            setDiscount(0);
            toast.error('❌ Невірний промокод');
        }
    };

    const sendOrder = async (paymentStatus) => {
        const order = {
            items: cartItems,
            total,
            discount,
            customer: { name, phone },
            address: `Хмельницький, ${address}`,
            paymentMethod: paymentStatus
        };

        const response = await submitOrder(order);

        if (response?.error && response.error !== 'network') {
            console.warn('⚠️ Некритична помилка:', response.error);
        }

        if (response?.error === 'network') {
            toast.error('❌ Не вдалося надіслати замовлення. Перевірте з’єднання.');
            return;
        }

        toast.success('✅ Замовлення успішно створено!');
        clearCart();


        setName('');
        setPhone('+380');
        setStreet('');
        setHouseNumber('');
        setPaymentMethod('');
        setVerificationCode('');
        setPromoCode('');
        setSelectedPromoId('');
        setDiscount(0);
        setPhoneVerified(false);
        setShowPaymentButtons(false);
    };





    const handleSubmit = async () => {
        setNameError(''); setPhoneError(''); setAddressError(''); setPaymentError('');

        if (!name.trim() || /\d/.test(name)) {
            setNameError('❗ Введіть коректне ім’я без цифр'); return;
        }
        if (!phone.trim() || phone.length < 13) {
            setPhoneError('❗ Введіть коректний номер телефону'); return;
        }
        if (!street.trim() || !houseNumber.trim()) {
            setAddressError('❗ Введіть вулицю та номер будинку'); return;
        }
        if (!paymentMethod) {
            setPaymentError('❗ Оберіть метод оплати'); return;
        }
        if (!phoneVerified) {
            setPhoneError('📲 Підтвердіть номер телефону через SMS'); return;
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

    return (
        <div className="orderFormWrapper" >
            <div className="orderForm">
                <h2>Оформлення замовлення</h2>
                <h3>🛒 Товари в кошику:</h3>
                {cartItems.length === 0 ? <p>Кошик порожній</p> : cartItems.map((item, index) => (
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
                ))}
                <p><strong>Доставка:</strong> {deliveryCost}₴</p>
                <p><strong>Загальна сума:</strong> {total}₴</p>

                <input placeholder="Вулиця" value={street} onChange={(e) => setStreet(e.target.value)} />
                <div className="address-group">
                    <input placeholder="№ будинку" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} />
                    <button className="locate-btn" onClick={locateAddress}>Прокласти</button>
                </div>
                {addressError && <p className="errorText">{addressError}</p>}

                <input placeholder="Ваше ім’я" value={name} onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))} />
                {nameError && <p className="errorText">{nameError}</p>}

                <input placeholder="Номер телефону" value={phone} onChange={handlePhoneChange} />
                {phoneError && <p className="errorText">{phoneError}</p>}

                {!phoneVerified && (
                    <>
                        <input placeholder="Код" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                        <button onClick={confirmCode} className="smsButton confirm">✅ Підтвердити код</button>
                        <button onClick={sendVerificationCode} className="smsButton send">📲 Надіслати SMS-код</button>
                    </>
                )}
                {phoneVerified && <p style={{ color: 'green' }}>✅ Підтверджено</p>}

                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="">Оберіть метод оплати</option>
                    <option value="cash">Готівка</option>
                    <option value="card">Карта (Stripe)</option>

                </select>
                {paymentError && <p className="errorText">{paymentError}</p>}

                <div className="promoSection">
                    <input type="text" placeholder="Промокод" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                    <select value={selectedPromoId} onChange={(e) => setSelectedPromoId(e.target.value)}>
                        <option value="">Акція</option>
                        {availablePromos.map(promo => (
                            <option key={promo.id} value={promo.id}>{promo.title}</option>
                        ))}
                    </select>
                    <button className="applyBtn" onClick={applyPromoCode}>Застосувати</button>
                    {discount > 0 && <div className="discountNotice">Знижка: {discount}₴</div>}
                </div>

                <button onClick={handleSubmit} disabled={cartItems.length === 0} className="submitOrderBtn">
                    Замовити
                </button>

                {showPaymentButtons && paymentMethod === 'card' && (
                    <div style={{ marginTop: '1rem' }}>
                        <Elements stripe={loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY)}>
                            <StripeCheckoutForm
                                amount={total * 100}
                                onSuccess={() => sendOrder('card (Stripe тест)')}
                            />
                        </Elements>
                    </div>
                )}

            </div>
            <div className="mapContainer">
                <MapView address={`${street} ${houseNumber}`.trim()} />
            </div>
        </div>
    );
};

export default OrderForm;