import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const StripeCheckoutForm = ({ amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        const card = elements.getElement(CardElement);
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card,
        });

        if (error) {
            toast.error(`❌ ${error.message}`);
            return;
        }

        const res = await fetch(`${process.env.REACT_APP_API_URL}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ amount }),
        });

        const { clientSecret } = await res.json();

        const confirm = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id,
        });

        if (confirm.error) {
            toast.error(`❌ ${confirm.error.message}`);
        } else if (confirm.paymentIntent.status === 'succeeded') {
            toast.success('✅ Оплата пройшла успішно!');
            onSuccess(); // call sendOrder
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" className="payButton" disabled={!stripe}>
                Сплатити
            </button>
        </form>

    );
};

export default StripeCheckoutForm;