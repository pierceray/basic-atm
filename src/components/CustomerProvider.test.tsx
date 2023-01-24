import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import mockRouter from 'next-router-mock';
import { CustomerProvider, useCustomerData } from './CustomerProvider';

jest.mock('next/router', () => require('next-router-mock'));

const MockComponent = () => {
    const { firstName, lastName, account, getBalance } = useCustomerData();

    return (
        <>
            <div>{firstName}</div>
            <div>{lastName}</div>
            <div>{account}</div>
            <div>{getBalance()}</div>
        </>
    );
};
describe('CustomerProvider', () => {
    it('should render content on the root path', () => {
        mockRouter.push('/');
        render(<CustomerProvider>Content</CustomerProvider>);

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render content on the /atm without query params', () => {
        mockRouter.push('/atm');

        render(
            <CustomerProvider>
                <MockComponent />
            </CustomerProvider>
        );

        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should render content on the /atm with query params', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=1');

        render(
            <CustomerProvider>
                <MockComponent />
            </CustomerProvider>
        );

        expect(screen.getByText('Ray')).toBeInTheDocument();
        expect(screen.getByText('Pierce')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('950')).toBeInTheDocument();
    });

    it('should be under daily balance by default', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=1');

        const DailyBalance = () => {
            const { isUnderWithdrawalAmountLimit } = useCustomerData();

            return (
                <>
                    <div>{isUnderWithdrawalAmountLimit(10).toString()}</div>
                </>
            );
        };
        render(
            <CustomerProvider>
                <DailyBalance />
            </CustomerProvider>
        );

        expect(screen.getByText('true')).toBeInTheDocument();
    });

    it('should increment balance', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=1');

        const DailyBalance = () => {
            const { addDeposit, getBalance } = useCustomerData();

            return (
                <>
                    <div>{getBalance()}</div>
                    <button onClick={() => addDeposit(100)} />
                </>
            );
        };
        render(
            <CustomerProvider>
                <DailyBalance />
            </CustomerProvider>
        );

        expect(screen.getByText('950')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('1050')).toBeInTheDocument();
    });

    it('should decrement balance', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=1');

        const DailyBalance = () => {
            const { addDebit, getBalance } = useCustomerData();

            return (
                <>
                    <div>{getBalance()}</div>
                    <button onClick={() => addDebit(100)} />
                </>
            );
        };
        render(
            <CustomerProvider>
                <DailyBalance />
            </CustomerProvider>
        );

        expect(screen.getByText('950')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByText('850')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('750')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('650')).toBeInTheDocument();
    });

    it('should throw exceeds debit limit error', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=1');
        jest.spyOn(console, 'log').mockImplementation(() => {});

        const ThrowError = () => {
            const { addDebit } = useCustomerData();

            try {
                addDebit(500);
            } catch (e: any) {
                console.log(e.message);
            }
            return <></>;
        };
        render(
            <CustomerProvider>
                <ThrowError />
            </CustomerProvider>
        );
        expect(console.log).toBeCalledWith('Exceeds Debit Amount Limit');
    });

    it('should throw insufficient funds error', () => {
        mockRouter.push('/atm?firstName=Ray&lastName=Pierce&account=2');
        jest.spyOn(console, 'log').mockImplementation(() => {});

        const ThrowError = () => {
            const { addDebit } = useCustomerData();

            try {
                addDebit(500);
            } catch (e: any) {
                console.log(e.message);
            }
            return <></>;
        };
        render(
            <CustomerProvider>
                <ThrowError />
            </CustomerProvider>
        );
        expect(console.log).toBeCalledWith('Insufficient Funds');
    });
});
