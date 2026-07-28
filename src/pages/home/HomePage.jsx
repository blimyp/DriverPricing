import { Link } from 'react-router-dom'

import './HomePage.css'

import SmartSteps from './components/traffic_lights/traffic_lights'
import ProductPreview from './components/product_preview/product_preview'
import BenefitCard from './components/benefit_card/benefit_card'
import Reveal from '../../components/reveal/reveal'
import { Images } from '../../constants/images'
import BackgroundSection from '../../components/background_section/background_section'

function HomePage() {
    const benefits = [
        {
            number: '01',
            title: 'חיסכון משמעותי בזמן',
            text: 'במקום לבצע שוב ושוב חישובים ידניים, המערכת מרכזת את הנתונים ומאפשרת להגיע לתמחור במהירות.',
            icon: Images.benefits.benefit1
        },
        {
            number: '02',
            title: 'תהליך עבודה מסודר',
            text: 'כל פרטי הנסיעה נמצאים במקום אחד, בצורה ברורה ונוחה, בלי להתפזר בין מסמכים וכלים שונים.',
            icon: Images.benefits.benefit2
        },
        {
            number: '03',
            title: 'פחות טעויות בחישוב',
            text: 'תהליך קבוע ואחיד מפחית פספוסים ועוזר לשמור על עקביות בין תמחור אחד לתמחור הבא.',
            icon: Images.benefits.benefit3
        },
        {
            number: '04',
            title: 'גישה נוחה מכל מקום',
            text: 'התחברות מאובטחת מאפשרת להיכנס לממשק ולגשת לנתונים האישיים בצורה פשוטה ומהירה.',
            icon: Images.benefits.benefit4
        },
        {
            number: '05',
            title: 'שליטה טובה יותר בנתונים',
            text: 'אפשר לראות בצורה ברורה מה הוזן, מה חושב ומה התקבל, וכך לקבל החלטות בצורה מסודרת יותר.',
            icon: Images.benefits.benefit5
        },
        {
            number: '06',
            title: 'מערכת שיכולה לגדול איתך',
            text: 'הממשק בנוי כך שבהמשך ניתן להוסיף היסטוריית נסיעות, דוחות, כללי תמחור ותכונות נוספות.',
            icon: Images.benefits.benefit6
        },
    ]

    return (
        <main dir="rtl" className="home-page">
            <Reveal
                className="component-reveal-wrapper"
                direction="up"
                threshold={0.08}
            >
                <SmartSteps />
            </Reveal>

            <ProductPreview />

            <section
                id="benefits"
                className="home-section benefits-section"
            >
                <Reveal direction="right">
                    <div className="section-heading">
                        <span className="section-label">
                            היתרונות של המערכת
                        </span>

                        <h2>
                            כל מה שצריך כדי להפוך את התמחור
                            <span> לפשוט ויעיל יותר</span>
                        </h2>

                        <p>
                            המערכת נועדה לצמצם פעולות חוזרות, לשפר את סדר
                            העבודה ולרכז את כל הנתונים במקום אחד.
                        </p>
                    </div>
                </Reveal>

                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <Reveal
                            key={benefit.number}
                            className="benefit-reveal-item"
                            direction="up"
                            delay={index * 110}
                            threshold={0.08}
                        >
                            <BenefitCard
                                icon={benefit.icon}
                                number={benefit.number}
                                title={benefit.title}
                                text={benefit.text}
                                delay={benefit.number}
                            />
                        </Reveal>
                    ))}
                </div>
            </section>

            <Reveal
                className="final-cta-reveal-wrapper"
                direction="up"
                threshold={0.12}
            >
                <BackgroundSection className='final-cta-section'>
                    <div className="final-cta-content">
                        <Reveal direction="up" delay={150}>
                            <span>מוכנים להתחיל?</span>
                        </Reveal>

                        <Reveal direction="up" delay={270}>
                            <h2>
                                תמחור מסודר מתחיל
                                <strong> בממשק הנכון</strong>
                            </h2>
                        </Reveal>

                        <Reveal direction="up" delay={390}>
                            <p>
                                הזיני את פרטי הנסיעה, התחילי את התהליך וקבלי
                                תמחור בצורה פשוטה וברורה.
                            </p>
                        </Reveal>

                        <Reveal direction="up" delay={510}>
                            <Link
                                to="/pricing"
                                className="final-cta-button"
                            >
                                מעבר לתמחור נסיעה
                                <span aria-hidden="true">←</span>
                            </Link>
                        </Reveal>
                    </div>
                </BackgroundSection>
            </Reveal>

            <footer className="home-footer">
                <Reveal direction="right">
                    <Link to="/home" className="footer-logo">
                        <img src="/logo.png" alt="" />
                        <span>Travel Price</span>
                    </Link>
                </Reveal>

                <Reveal direction="up" delay={100}>
                    <p>מערכת תמחור נסיעות — סדר, יעילות ושליטה.</p>
                </Reveal>

                <Reveal direction="left" delay={200}>
                    <div className="footer-links">
                        <a href="#benefits">יתרונות</a>
                        <a href="#process">תהליך העבודה</a>
                        <Link to="/pricing">תמחור נסיעה</Link>
                    </div>
                </Reveal>
            </footer>
        </main >
    )
}

export default HomePage