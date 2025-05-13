import React from 'react';
import '../styles/Footer.scss';
import { FaFacebookF, FaInstagram, FaYoutube, FaTelegramPlane, FaTiktok } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-left">
                    <div className="logo">GrinFood</div>
                    <div className="city">м. Хмельницький</div>
                    <div className="phone">096 000 00 00</div>
                    <div className="address">вул. Прикладна, 1А</div>
                    <div className="payments">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" />
                        <img src="data:image/png;base64,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" alt="MasterCard" />
                    </div>

                </div>

                <div className="footer-right">
                    <div className="manager">
                        <img src="https://i.pravatar.cc/44" alt="Менеджер" className="avatar" />
                        <div>
                            <span className="name">Марік</span>
                            <span className="status online">Онлайн</span>
                        </div>
                    </div>
                    <div className="message-text">
                        Є що сказати чи <br /> запропонувати?
                    </div>
                    <button
                        className="message-btn"
                        onClick={() => window.open('https://t.me/S_A_N_I_A_GRN', '_blank')}
                    >
                        Напиши нам
                    </button>

                    <div className="socials">
                        <a href="https://www.tiktok.com/@s_a_n_i_a_grn?_t=ZM-8w1MEyl0exi&_r=1" target="_blank" rel="noopener noreferrer">
                            <FaTiktok />
                        </a>
                        <a href="https://www.instagram.com/s_a_n_i_a_grn?igsh=bW1vZHgzYjNqZGs4&utm_source=qr" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
