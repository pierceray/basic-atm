import React, { createContext, useContext, useState } from 'react';
import { CustomerType, type ITransaction } from '@/types';
import CustomerLedger from '@/data/CustomerLedger.json';
import { useRouter } from 'next/router';

type CustomerInfo = Omit<CustomerType, 'pin'>;

interface CustomerDataProvider extends CustomerInfo {
    children: React.ReactNode;
}

interface CustomerContext extends CustomerInfo {
    addDeposit: Function;
    addDebit: Function;
    getBalance: Function;
    isUnderWithdrawalTransactionLimit: () => boolean;
}

const DAILY_DEBIT_TRANSACTION_LIMIT = 3;

export const CustomerContext = createContext({} as CustomerContext);

export const CustomerProvider: React.FC<CustomerDataProvider> = ({
    children,
}) => {
    const router = useRouter();

    const customerInfo = {
        firstName: router.query.firstName,
        lastName: router.query.lastName,
        account: router.query.account,
    } as Omit<CustomerType, 'pin'>;

    const accountTransactions = CustomerLedger.filter(
        (transaction) => transaction.account === customerInfo.account
    );
    const [transactions, setTransactions] =
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
            amount,
            type: 'DEPOSIT',
            date: new Date(Date.now()).toISOString(),
        };

        // using concat because push is mutative
        setTransactions(transactions.concat(depositTransaction));
    };

    const addDebit = (amount: number) => {
        if (getBalance() - amount < 0) {
            return new Error('Insufficient Funds');
        }

        if (!isUnderWithdrawalTransactionLimit()) {
            return new Error('Exceeded Debit Transaction Limit');
        }

        const debitTransaction: ITransaction = {
            account: customerInfo.account,
            amount,
            type: 'DEBIT',
            date: new Date(Date.now()).toISOString(),
        };

        // using concat because push is mutative
        setTransactions(transactions.concat(debitTransaction));
    };

    const isUnderWithdrawalTransactionLimit = () => {
        const numberOfWithdrawals = transactions.reduce(
            (withdrawal, transaction) => {
                if (transaction.type === 'DEBIT') {
                    return withdrawal + 1;
                } else {
                    return withdrawal;
                }
            },
            0
        );

        return numberOfWithdrawals <= DAILY_DEBIT_TRANSACTION_LIMIT;
    };

    const customerData = {
        ...customerInfo,
        addDeposit,
        addDebit,
        getBalance,
        isUnderWithdrawalTransactionLimit,
    };

    return (
        <CustomerContext.Provider value={customerData}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerData = () => useContext(CustomerContext);
