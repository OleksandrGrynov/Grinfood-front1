import React, { useEffect, useState, useRef } from 'react';
import './styles/HomePage.scss';
import { fetchPromotions, fetchMenu } from './api';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HomePage = () => {
    const [promotions, setPromotions] = useState([]);
    const [latestDishes, setLatestDishes] = useState([]);
    const [categoryImages, setCategoryImages] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [showFullText, setShowFullText] = useState(false);
    const navigate = useNavigate();
    const fullTextRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [promoRes, menuRes] = await Promise.all([fetchPromotions(), fetchMenu()]);
                const now = new Date();

                const activePromos = promoRes.filter(p => {
                    const start = p.startDate?.seconds ? new Date(p.startDate.seconds * 1000) : null;
                    const end = p.endDate?.seconds ? new Date(p.endDate.seconds * 1000) : null;
                    return p.active && (!start || start <= now) && (!end || end >= now);
                });
                setPromotions(activePromos);

                const activeDishes = menuRes.filter(d => d.active !== false);
                const sorted = [...activeDishes].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds).slice(0, 3);
                setLatestDishes(sorted);

                const categoryMap = {};
                for (const item of activeDishes) {
                    if (!categoryMap[item.category]) {
                        categoryMap[item.category] = item;
                    }
                }

                const categoryList = Object.entries(categoryMap).map(([name, item]) => ({
                    name,
                    image: item.image,
                    size: (name === 'Піца' || name === 'Бургери') ? 'large' : ''
                }));

                setCategoryImages(categoryList);
            } catch (e) {
                console.error('Loading data error:', e);
            }
        };

        loadData();
    }, []);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        centerMode: true,
        centerPadding: '20px',
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2, centerMode: false } },
            { breakpoint: 600, settings: { slidesToShow: 1, centerMode: false } }
        ]
    };

    const openPromoModal = (promo) => {
        setSelectedPromo(promo);
        setOpenModal(true);
    };

    const toggleText = () => {
        setShowFullText(!showFullText);
        if (!showFullText && fullTextRef.current) {
            setTimeout(() => {
                fullTextRef.current.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    };

    return (
        <main className="homepage">
            {promotions.length > 0 && (
                <div className="promo-carousel">
                    <Slider {...sliderSettings}>
                        {promotions.map((promo) => (
                            <div key={promo.id} className="carousel-card" onClick={() => openPromoModal(promo)}>
                                <img src={promo.image} alt={promo.title} />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
            <section className="section">
            <h2>Новинки</h2>
            <div className="product-grid">
                {latestDishes.map((item) => (
                    <div className="product-card" key={item.id}>
                        <img src={item.image} alt={item.name} />
                        <h4>{item.name}</h4>
                        <p>{item.price} грн</p>
                    </div>
                ))}
            </div>
        </section>

            <section className="section">
                <h2>Категорії меню</h2>
                <div className="category-mosaic">
                    {categoryImages.map(cat => (
                        <div
                            key={cat.name}
                            className={`category-tile ${cat.size}`}
                            onClick={() => navigate(`/menu?category=${encodeURIComponent(cat.name)}`)}
                        >
                            <img src={cat.image} alt={cat.name} />
                            <div className="label">{cat.name}</div>
                        </div>
                    ))}
                </div>
                <Link to="/menu" className="view-all">Дивитись усе меню →</Link>
            </section>



            <section className={`section delivery-full ${showFullText ? 'expanded' : ''}`} ref={fullTextRef}>
                <h2 className="delivery-title">Доставка їжі Хмельницький</h2>
                <div className="expandable-content">
                    <p>
                        Ще не так давно доставка їжі у Хмельницькому була чимось новим і незвичним. Сьогодні це популярна і доступна послуга, і обирають її різні категорії людей. Часто це ті, у кого насичений робочий графік, хто веде активний спосіб життя. А про смачну їжу для всієї сім’ї подбає команда GrinFood
                    </p>
                    <p>
                        Їжа на замовлення у Хмельницькому спростить побут, і зекономить багато часу. Тому популярність послуги тільки зростає.
                    </p>

                    <div className={`full-text ${showFullText ? 'visible' : ''}`}>
                        <h3>Доставка у Хмельницькому – замовляйте їжу з доставкою в межах Хмельницького</h3>
                        <ul className="custom-list">
                            <li>коли немає сил готувати;</li>
                            <li>коли хочеться побалувати рідних ароматними стравами, але без зайвого клопоту на кухні;</li>
                            <li>коли день розписаний по хвилинах, і на обід бракує часу;</li>
                            <li>коли запланували зустріч з друзями;</li>
                            <li>коли звичні страви просто набридли, і хочеться чогось нового, пікантного.</li>
                        </ul>
                        <p>Оформити замовлення їжі у Хмельницькому дуже просто: для цього варто обрати страви на сайті, підтвердити замовлення та чекати кур’єра.</p>

                        <h3>Переваги доставки їжі у Хмельницькому від GrinFood</h3>
                        <ul className="advantages-list">
                            <li><strong>Можливість відпочити</strong> — не витрачаєш час на кухню.</li>
                            <li><strong>Економія коштів</strong> — вигідніше за готування.</li>
                            <li><strong>Гарантія якості</strong> — перевірені рецепти.</li>
                            <li><strong>Різноманітне меню</strong> — на будь-який смак.</li>
                            <li><strong>Доставка щодня</strong> — навіть у вихідні.</li>
                        </ul>

                        <h3>Різноманітна їжа з доставкою в Хмельницькому</h3>
                        <p>GrinFood —  це широкий асортимент страв і демократичні ціни. Їжа на замовлення Хмельницький – смачна, поживна і різноманітна. Любите страви з нотками Італії? Тонка італійська піца, з хрусткими бортиками і соковитою начинкою, подарує справжню гастрономічну насолоду. Не уявляєте життя без бургерів? Обирайте улюблені смаки. Ситний перекус швидко тамує голод. Крім того, замовлення їжі у Хмельницькому – це смачна альтернатива звичайним бутербродам на роботі. Обирайте улюблені страви з доставкою!</p>
                        <p>Замовлення займає 2 хвилини — і їжа вже їде до вас!</p>
                        <p><strong>GrinFood — це завжди смачно та швидко!</strong></p>
                    </div>

                    <button className="read-more" onClick={toggleText}>
                        {showFullText ? 'Приховати' : 'Читати більше'}
                    </button>
                </div>
            </section>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{selectedPromo?.title}</Typography>
                    <button
                        onClick={() => setOpenModal(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            height: 50,
                            width:50,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: '#888',
                            cursor: 'pointer'
                        }}
                    >
                        <CloseIcon />
                    </button>
                </DialogTitle>

                <DialogContent>
                    {selectedPromo?.image && (
                        <img
                            src={selectedPromo.image}
                            alt={selectedPromo.title}
                            style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
                        />
                    )}
                    <Typography>{selectedPromo?.description}</Typography>
                </DialogContent>
            </Dialog>

        </main>
    );
};

export default HomePage;
