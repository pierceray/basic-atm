import React, { createContext, useContext, useState } from 'react';
import { CustomerType, type ITransaction } from '../types';
import CustomerLedger from '../data/CustomerLedger.json';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

type CustomerInfo = Omit<CustomerType, 'pin'>;

interface CustomerDataProvider {
    children: React.ReactNode;
}

interface CustomerContext extends CustomerInfo {
    addDeposit: (amount: number) => void;
    addDebit: (amount: number) => void;
    getBalance: () => number;
    isUnderWithdrawalAmountLimit: (amount: number) => boolean;
}

// I could probably abstracted this to a constants file
export const DAILY_DEBIT_AMOUNT_LIMIT = 300;

// Provides a mechanism to share the information to multiple components
// this was probably overkill for this problem, but I believe that this is how I
// would have done this for a more complex applications
export const CustomerContext = createContext({} as CustomerContext);

// Set up the provider and add the data to the context.
// This will need to wrap the application
export const CustomerProvider: React.FC<CustomerDataProvider> = ({
    children,
}) => {
    const router = useRouter();

    // This is a bad practice, providers should be the same for all child pages
    if (router.pathname === '/') {
        return <>{children}</>;
    }

    // Normally I would have pull this information from GraphQL
    // This is horribly insecure
    const customerInfo = {
        account: router.query.account,
        firstName: router.query.firstName,
        lastName: router.query.lastName,
    } as Omit<CustomerType, 'pin'>;

    // Get all of the transactions for the user
    const accountTransactions = CustomerLedger.filter(
        (transaction) => transaction.account === customerInfo.account
    );

    // store the transaction so that we can mutate them
    const [transactions, setTransactions] =
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useState<ITransaction[]>(accountTransactions);

    /**
     * Gets the customers balance based off of all of their transactions
     * @returns number
     */
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

    /**
     * Adds an object to the transactions array for a deposit
     * @param amount
     */
    const addDeposit = (amount: number) => {
        const depositTransaction: ITransaction = {
            account: customerInfo.account,
            amount: Number(amount),
            type: 'DEPOSIT',
            date: dayjs().toISOString(),
        };

        setTransactions([...transactions, depositTransaction]);
    };

    /**
     * Adds an object to the transactions array for a debit
     *
     * ensures that the user is not going over their daily limit and that they
     * have enough money
     * @param amount
     */
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

    /**
     * Check to see if a user has gone over their Withdrawal limit on a given day
     * @param amount
     * @returns boolean
     */
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

// expose a React hook where you can pull all of this data off
export const useCustomerData = () => useContext(CustomerContext);
