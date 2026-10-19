import './AccessibilityStatementPage.css'

// פרטים להשלמה לפני העלייה לאוויר
const BUSINESS_NAME = 'Travel Price'
const ACCESSIBILITY_CONTACT = {
    name: 'מאיר ויזל',
    phone: '0527148651',
    email: 'viznitsa@enativ.com',
}
const LAST_UPDATED = '19.10.2026'

function AccessibilityStatementPage() {
    return (
        <main className="accessibility-page" dir="rtl">
            <article className="accessibility-page__container">
                <header className="accessibility-header">
                    <h1>הצהרת נגישות</h1>
                    <p>עודכן לאחרונה: {LAST_UPDATED}</p>
                </header>

                <section>
                    <h2>כללי</h2>
                    <p>
                        {BUSINESS_NAME} רואה חשיבות רבה במתן שירות שוויוני
                        לכלל המשתמשים, ובכלל זה לאנשים עם מוגבלות. השקענו
                        מאמצים כדי שמערכת תמחור הנסיעות תהיה נוחה וזמינה
                        לשימוש עבור כמה שיותר משתמשים.
                    </p>
                </section>

                <section>
                    <h2>רמת הנגישות</h2>
                    <p>
                        אנו פועלים להנגשת המערכת בהתאם לתקנות שוויון זכויות
                        לאנשים עם מוגבלות (התאמות נגישות לשירות),
                        התשע״ג-2013, ולתקן הישראלי 5568. אם תיתקלו בבעיה,
                        נשמח שתפנו אלינו ונפעל לתקן אותה.
                    </p>
                </section>

                <section>
                    <h2>התאמות הנגישות שבוצעו</h2>
                    <ul>
                        <li>
                            רכיב נגישות שנפתח מכפתור במסך ומאפשר הגדלת טקסט,
                            שינוי ניגודיות, הדגשת קישורים ועוד.
                        </li>
                        <li>אפשרות לנווט בכל המערכת באמצעות המקלדת בלבד.</li>
                        <li>
                            התאמה לקוראי מסך: לכל עמוד יש כותרת ברורה, לשדות
                            בטפסים יש תוויות, והודעות חדשות מוקראות באופן
                            אוטומטי.
                        </li>
                        <li>
                            חלונות קופצים מחזיקים את המיקוד בתוכם, ניתנים
                            לסגירה במקש Esc ומחזירים את המיקוד לכפתור שפתח
                            אותם.
                        </li>
                        <li>שפת העמודים וכיוון הכתיבה מוגדרים כעברית, מימין לשמאל.</li>
                        <li>המערכת מותאמת לתצוגה במחשב ובטלפון נייד.</li>
                    </ul>
                </section>

                <section>
                    <h2>חלקים שאינם נגישים במלואם</h2>
                    <p>
                        אנו ממשיכים לשפר את נגישות המערכת. ייתכן שעדיין
                        קיימים חלקים שלא הונגשו במלואם. אם נתקלתם בבעיה,
                        נשמח שתעדכנו אותנו.
                    </p>
                </section>

                <section>
                    <h2>פניות בנושא נגישות</h2>
                    <p>
                        נתקלתם בקושי בשימוש במערכת? יש לכם הצעה לשיפור?
                        ניתן לפנות אלינו:
                    </p>
                    <dl className="accessibility-contact">
                        <dt>איש קשר</dt>
                        <dd>{ACCESSIBILITY_CONTACT.name}</dd>

                        <dt>טלפון</dt>
                        <dd>{ACCESSIBILITY_CONTACT.phone}</dd>

                        <dt>דואר אלקטרוני</dt>
                        <dd>{ACCESSIBILITY_CONTACT.email}</dd>
                    </dl>
                    <p>
                        כדי שנוכל לטפל בפנייה, נשמח לקבל תיאור של הבעיה,
                        העמוד שבו נתקלתם בה, וסוג הדפדפן או המכשיר שבו
                        השתמשתם.
                    </p>
                </section>
            </article>
        </main>
    )
}

export default AccessibilityStatementPage
