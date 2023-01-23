import React, { createContext, useContext, useEffect, useState } from 'react';
import { CustomerType, type ITransaction } from '@/types';
import CustomerLedger from '@/data/CustomerLedger.json';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

type CustomerInfo = Omit<CustomerType, 'pin'>;

interface CustomerDataProvider extends CustomerInfo {
    children: React.ReactNode;
}

interface CustomerContext extends CustomerInfo {
    addDeposit: Function;
    addDebit: Function;
    getBalance: Function;
    isUnderWithdrawalAmountLimit: (amount: number) => boolean;
}

export const DAILY_DEBIT_AMOUNT_LIMIT = 300;

export const CustomerContext = createContext({} as CustomerContext);

export const CustomerProvider: React.FC<CustomerDataProvider> = ({
    children,
}) => {
    const router = useRouter();

    if (router.pathname === '/') {
        return <>{children}</>;
    }

    const customerInfo = {
        account: router.query.account,
        firstName: router.query.firstName,
        lastName: router.query.lastName,
    } as Omit<CustomerType, 'pin'>;

    const accountTransactions = CustomerLedger.filter(
        (transaction) => transaction.account === customerInfo.account
    );

    const [transactions, setTransactions] =
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useState<ITransaction[]>(accountTransactions);

    const getBalance = () => {
        if (!transactions.length) {
            return 0;
        }

        const balance = transactions.reduce((total, currentTransaction) => {
            if (currentTransaction.type === 'DEPOSIT') {
                return total + currentTransaction.amount;
            } else {
                return total - currentTransaction.amount;
            }
        }, 0);

        return balance;
    };

    const addDeposit = (amount: number) => {
        const depositTransaction: ITransaction = {
            account: customerInfo.account,
            amount: Number(amount),
            type: 'DEPOSIT',
            date: dayjs().toISOString(),
        };

        setTransactions([...transactions, depositTransaction]);
    };

    const addDebit = (amount: number) => {
        if (getBalance() - amount < 0) {
            throw new Error('Insufficient Funds');
        }

        if (!isUnderWithdrawalAmountLimit(amount)) {
            throw new Error('Exceeds Debit Amount Limit');
        }

        const debitTransaction: ITransaction = {
            account: customerInfo.account,
            amount: Number(amount),
            type: 'DEBIT',
            date: dayjs().toISOString(),
        };

        setTransactions([...transactions, debitTransaction]);
    };

    const isUnderWithdrawalAmountLimit = (amount: number) => {
        const withdrawalAmountToday = transactions.reduce(
            (withdrawal, transaction) => {
                const isToday = dayjs().isSame(dayjs(transaction.date), 'day');
                if (transaction.type === 'DEBIT' && isToday) {
                    return withdrawal + transaction.amount;
                } else {
                    return withdrawal;
                }
            },
            0
        );

        const withdrawalAmountTodayTotal = withdrawalAmountToday + amount;

        return withdrawalAmountTodayTotal <= DAILY_DEBIT_AMOUNT_LIMIT;
    };

    const customerData = {
        ...customerInfo,
        addDeposit,
        addDebit,
        getBalance,
        isUnderWithdrawalAmountLimit,
    };

    return (
        <CustomerContext.Provider value={customerData}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerData = () => useContext(CustomerContext);
