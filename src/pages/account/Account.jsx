import { useMemo, useState } from "react";
import "./Account.css";

const transactions = [
    {
        id: 1,
        date: "2026-07-30",
        type: "income",
        action: "תשלום עבור נסיעה",
        amount: 185,
    },
    {
        id: 2,
        date: "2026-07-30",
        type: "expense",
        action: "עמלת מערכת",
        amount: 25,
    },
    {
        id: 3,
        date: "2026-07-29",
        type: "income",
        action: "תשלום עבור נסיעה",
        amount: 320,
    },
    {
        id: 4,
        date: "2026-07-15",
        type: "expense",
        action: "הוצאות רכב",
        amount: 80,
    },
    {
        id: 5,
        date: "2026-06-20",
        type: "income",
        action: "תשלום עבור נסיעה",
        amount: 450,
    },
    {
        id: 6,
        date: "2025-12-10",
        type: "income",
        action: "תשלום עבור נסיעה",
        amount: 280,
    },
];

const groupOptions = [
    {
        value: "day",
        label: "לפי יום",
    },
    {
        value: "month",
        label: "לפי חודש",
    },
    {
        value: "year",
        label: "לפי שנה",
    },
];

function getDateParts(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return {
        year,
        month,
        day,
        date: new Date(year, month - 1, day),
    };
}

function getGroupKey(dateString, groupBy) {
    const { year, month, day } = getDateParts(dateString);

    if (groupBy === "year") {
        return `${year}`;
    }

    if (groupBy === "month") {
        return `${year}-${String(month).padStart(2, "0")}`;
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
    )}`;
}

function getGroupTitle(dateString, groupBy) {
    const { date, year } = getDateParts(dateString);

    if (groupBy === "year") {
        return `שנת ${year}`;
    }

    if (groupBy === "month") {
        return date.toLocaleDateString("he-IL", {
            month: "long",
            year: "numeric",
        });
    }

    return date.toLocaleDateString("he-IL", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatDate(dateString) {
    return getDateParts(dateString).date.toLocaleDateString("he-IL");
}

function formatMoney(amount) {
    return new Intl.NumberFormat("he-IL", {
        style: "currency",
        currency: "ILS",
        maximumFractionDigits: 2,
    }).format(amount);
}

function AccountPage() {
    const [groupBy, setGroupBy] = useState("day");

    const groupedTransactions = useMemo(() => {
        const sortedTransactions = [...transactions].sort(
            (firstTransaction, secondTransaction) =>
                secondTransaction.date.localeCompare(firstTransaction.date)
        );

        const groups = sortedTransactions.reduce((result, transaction) => {
            const groupKey = getGroupKey(transaction.date, groupBy);

            if (!result[groupKey]) {
                result[groupKey] = {
                    key: groupKey,
                    title: getGroupTitle(transaction.date, groupBy),
                    transactions: [],
                };
            }

            result[groupKey].transactions.push(transaction);

            return result;
        }, {});

        return Object.values(groups).map((group) => {
            const totals = group.transactions.reduce(
                (result, transaction) => {
                    if (transaction.type === "income") {
                        result.income += transaction.amount;
                    } else {
                        result.expense += transaction.amount;
                    }

                    return result;
                },
                {
                    income: 0,
                    expense: 0,
                }
            );

            return {
                ...group,
                income: totals.income,
                expense: totals.expense,
                profit: totals.income - totals.expense,
            };
        });
    }, [groupBy]);

    return (
        <main className="account-page" dir="rtl">
            <section className="account-card">
                <div className="account-header">
                    <h1 className="account-title">פירוט תנועות</h1>

                    <div className="group-select-wrapper">
                        <label htmlFor="groupBy" className="group-select-label">
                            מיון לפי:
                        </label>

                        <select
                            id="groupBy"
                            className="group-select"
                            value={groupBy}
                            onChange={(event) => setGroupBy(event.target.value)}
                        >
                            <option value="day">יום</option>
                            <option value="month">חודש</option>
                            <option value="year">שנה</option>
                        </select>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="account-table">
                        <thead>
                            <tr>
                                <th>תאריך</th>
                                <th>סוג פעולה</th>
                                <th>הפעולה</th>
                                <th>סכום</th>
                            </tr>
                        </thead>

                        {groupedTransactions.map((group) => (
                            <tbody
                                className="transaction-group"
                                key={group.key}
                            >
                                <tr className="group-title-row">
                                    <td colSpan="4">
                                        <div className="group-title-content">
                                            <div className="group-summary">
                                                <span className="group-title">
                                                    {group.title}
                                                </span>

                                                <span className="group-count">
                                                    {group.transactions.length}{" "}
                                                    פעולות
                                                </span>
                                            </div>

                                            <div className="group-summary">
                                                <div className="summary-item">
                                                    <span className="summary-label">
                                                        סך הכנסות
                                                    </span>

                                                    <strong className="summary-value summary-income">
                                                        {formatMoney(group.income)}
                                                    </strong>
                                                </div>

                                                <div className="summary-item">
                                                    <span className="summary-label">
                                                        סך הוצאות
                                                    </span>

                                                    <strong className="summary-value summary-expense">
                                                        {formatMoney(group.expense)}
                                                    </strong>
                                                </div>

                                                <div className="summary-item">
                                                    <span className="summary-label">
                                                        סה״כ רווח
                                                    </span>

                                                    <strong
                                                        className={`summary-value ${group.profit >= 0
                                                            ? "summary-income"
                                                            : "summary-expense"
                                                            }`}
                                                    >
                                                        {formatMoney(group.profit)}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                {group.transactions.map((transaction) => (
                                    <tr
                                        className="transaction-row"
                                        key={transaction.id}
                                    >
                                        <td>
                                            {formatDate(transaction.date)}
                                        </td>

                                        <td>
                                            <span
                                                className={`transaction-type ${transaction.type}`}
                                            >
                                                {transaction.type === "income"
                                                    ? "הכנסה"
                                                    : "הוצאה"}
                                            </span>
                                        </td>

                                        <td>{transaction.action}</td>

                                        <td>
                                            <span
                                                className={`amount ${transaction.type}`}
                                            >
                                                {formatMoney(
                                                    transaction.amount
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ))}
                    </table>
                </div>
            </section>
        </main>
    );
}

export default AccountPage;