import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import "./Account.css";
import AccountActions from "./components/account_actions";

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
        maximumFractionDigits: 1,
    }).format(amount);
}

function AccountPage() {
    const { user } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [groupBy, setGroupBy] = useState("day");

    async function handleAddTransaction(transaction) {
        const { error } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                trip_id: null,
                type: transaction.type,
                source_type: "manual",
                action: transaction.action,
                amount: transaction.amount,
                transaction_date: transaction.date,
            });

        if (error) {
            throw error;
        }

        await loadAccountData();
    }

    async function loadAccountData() {
        try {
            const [
                transactionsResult,
                tripsResult,
            ] = await Promise.all([
                supabase
                    .from("transactions")
                    .select(`
                        id,
                        user_id,
                        trip_id,
                        type,
                        source_type,
                        action,
                        amount,
                        transaction_date
                    `)
                    .eq("user_id", user.id),

                supabase
                    .from("trips")
                    .select("*")
                    .eq("user_id", user.id),
            ]);

            if (transactionsResult.error) {
                throw transactionsResult.error;
            }

            if (tripsResult.error) {
                throw tripsResult.error;
            }

            const manualTransactions =
                (transactionsResult.data ?? []).map((transaction) => ({
                    id: `transaction-${transaction.id}`,
                    originalId: transaction.id,
                    date: transaction.transaction_date,
                    type: transaction.type,
                    sourceType: transaction.source_type,
                    action: transaction.action,
                    amount: Number(transaction.amount),
                    tripId: transaction.trip_id,
                }));

            const tripTransactions =
                (tripsResult.data ?? []).map((trip) => ({
                    id: `trip-${trip.id}`,
                    originalId: trip.id,
                    date: trip.created_at?.split("T")[0],
                    type: "income",
                    sourceType: "trip",
                    action: `נסיעה מ-${trip.origin} ל-${trip.destination}`,
                    amount: Number(trip.calculated_price ?? 0),
                    tripId: trip.id,
                }));

            setTransactions([
                ...manualTransactions,
                ...tripTransactions,
            ]);
        } catch (loadError) {
            console.error("Failed to load account data:", loadError);
        }
    }

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
    }, [groupBy, transactions]);

    useEffect(() => {
        if (!user?.id) {
            setTransactions([]);
            return;
        }

        loadAccountData();
    }, [user?.id]);

    return (
        <main className="account-page" dir="rtl">
            <section className="account-card">
                <div className="account-header">
                    <div className="account-header-top">
                        <h1 className="account-title">פירוט תנועות</h1>
                        <AccountActions
                            onSubmit={handleAddTransaction}
                        />
                    </div>
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
                                            <span className={`amount ${transaction.type}`}>
                                                {formatMoney(transaction.amount)}
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