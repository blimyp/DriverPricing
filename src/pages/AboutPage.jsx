import {
    Calculator,
    CheckCircle2,
    Clock3,
    Database,
    FileText,
    Flag,
    Lightbulb,
    Route,
    ShieldCheck,
    Sparkles,
    Target,
} from "lucide-react";

import "./AboutPage.css";

const principles = [
    {
        id: 1,
        icon: FileText,
        title: "מידע ברור",
        description:
            "המערכת מציגה את פרטי הנסיעה ואת תוצאת החישוב בצורה מסודרת וללא מידע מיותר.",
    },
    {
        id: 2,
        icon: Calculator,
        title: "חישוב פשוט",
        description:
            "המטרה היא לצמצם פעולות ידניות ולאפשר קבלת הערכה מתוך מספר נתונים בסיסיים.",
    },
    {
        id: 3,
        icon: Database,
        title: "שמירת נתונים",
        description:
            "נסיעות שנשמרו מקושרות לחשבון המשתמש וניתן לצפות בהן שוב בעמוד הנסיעות.",
    },
    {
        id: 4,
        icon: ShieldCheck,
        title: "הפרדה בין משתמשים",
        description:
            "כל משתמש יכול לגשת לנתונים השייכים לחשבון שלו בלבד.",
    },
];

const timeline = [
    {
        id: "01",
        title: "הגדרת הצורך",
        description:
            "זוהה צורך בכלי שמרכז את נתוני הנסיעה ומציג הערכת מחיר בצורה ברורה.",
    },
    {
        id: "02",
        title: "בניית מנגנון החישוב",
        description:
            "נבנה טופס המרכז את פרטי המסלול ואת הנתונים הדרושים לצורך החישוב.",
    },
    {
        id: "03",
        title: "חיבור לחשבונות משתמשים",
        description:
            "נוספה אפשרות כניסה למערכת ושמירת נסיעות באופן אישי לכל משתמש.",
    },
    {
        id: "04",
        title: "ניהול נסיעות",
        description:
            "נוסף עמוד המרכז את הנסיעות שנשמרו ומציג את פרטיהן בצורה מסודרת.",
    },
];

function AboutPage() {
    return (
        <main className="about-page" dir="rtl">
            <div className="about-page__container">
                <header className="about-header">
                    <h1 className="about-header__title">
                        <strong>Travel Price</strong>
                    </h1>

                    <p className="about-header__description">
                        מערכת לחישוב, שמירה וניהול של נסיעות על בסיס
                        נתונים שהמשתמש מזין.
                    </p>
                </header>

                <section className="about-overview">
                    <article className="about-overview__main">
                        <div className="about-section-label">
                            <Lightbulb aria-hidden="true" />
                            <span>רקע</span>
                        </div>

                        <h2>למה המערכת נבנתה?</h2>

                        <p>
                            המערכת נבנתה כדי לרכז במקום אחד את הנתונים
                            המרכזיים הקשורים לנסיעה. במקום לבצע חישובים
                            נפרדים או לשמור פרטים באופן ידני, ניתן להזין
                            את המידע בטופס ולקבל תוצאה מסודרת.
                        </p>

                        <p>
                            בנוסף לחישוב עצמו, המערכת מאפשרת למשתמשים
                            רשומים לשמור נסיעות ולצפות בהן מאוחר יותר.
                            כך ניתן לנהל היסטוריה בסיסית של נסיעות מתוך
                            חשבון אישי.
                        </p>

                        <div className="about-overview__points">
                            <div className="about-overview__point">
                                <CheckCircle2 aria-hidden="true" />
                                <span>ריכוז פרטי הנסיעה במקום אחד</span>
                            </div>

                            <div className="about-overview__point">
                                <CheckCircle2 aria-hidden="true" />
                                <span>הצגת הערכת מחיר ברורה</span>
                            </div>

                            <div className="about-overview__point">
                                <CheckCircle2 aria-hidden="true" />
                                <span>שמירת נסיעות לחשבון המשתמש</span>
                            </div>
                        </div>
                    </article>

                    <aside className="about-overview__summary">
                        <div className="about-overview__summary-icon">
                            <Route aria-hidden="true" />
                        </div>

                        <span className="about-overview__summary-label">
                            מטרת המערכת
                        </span>

                        <h2>
                            לפשט את ארגון הנתונים הקשורים לנסיעה
                        </h2>

                        <p>
                            המערכת מתמקדת בהצגת מידע מסודר, שמירת
                            נסיעות וגישה נוחה לנתונים קודמים.
                        </p>

                        <div className="about-overview__summary-data">
                            <div>
                                <strong>01</strong>
                                <span>חישוב</span>
                            </div>

                            <div>
                                <strong>02</strong>
                                <span>שמירה</span>
                            </div>

                            <div>
                                <strong>03</strong>
                                <span>ניהול</span>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="about-purpose">
                    <div className="about-purpose__heading">
                        <div className="about-section-label">
                            <Target aria-hidden="true" />
                            <span>מטרות</span>
                        </div>

                        <h2>מה המערכת נועדה לספק?</h2>

                        <p>
                            המערכת מתמקדת במספר פעולות בסיסיות, ללא
                            העמסה של אפשרויות שאינן נחוצות לתהליך.
                        </p>
                    </div>

                    <div className="about-principles">
                        {principles.map((principle, index) => {
                            const Icon = principle.icon;

                            return (
                                <article
                                    className="about-principle-card"
                                    key={principle.id}
                                    style={{
                                        "--principle-index": index,
                                    }}
                                >
                                    <div className="about-principle-card__top">
                                        <div className="about-principle-card__icon">
                                            <Icon aria-hidden="true" />
                                        </div>

                                        <span>
                                            {String(principle.id).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>
                                    </div>

                                    <h3>{principle.title}</h3>

                                    <p>{principle.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="about-development">
                    <div className="about-development__heading">
                        <div className="about-section-label about-section-label--light">
                            <Clock3 aria-hidden="true" />
                            <span>התפתחות</span>
                        </div>

                        <h2>שלבי בניית המערכת</h2>

                        <p>
                            המערכת נבנתה בהדרגה, כאשר כל שלב הוסיף
                            יכולת נוספת על גבי הבסיס הקיים.
                        </p>
                    </div>

                    <div className="about-timeline">
                        {timeline.map((item, index) => (
                            <article
                                className="about-timeline__item"
                                key={item.id}
                            >
                                <div className="about-timeline__number">
                                    {item.id}
                                </div>

                                <div className="about-timeline__content">
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>

                                {index < timeline.length - 1 && (
                                    <div
                                        className="about-timeline__line"
                                        aria-hidden="true"
                                    />
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="about-status">
                    <div className="about-status__icon">
                        <Flag aria-hidden="true" />
                    </div>

                    <div className="about-status__content">
                        <span>מצב נוכחי</span>

                        <h2>המערכת נמצאת בתהליך פיתוח ושיפור</h2>

                        <p>
                            יכולות נוספות עשויות להתווסף בהמשך בהתאם
                            לצרכים שיעלו במהלך השימוש.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AboutPage;
