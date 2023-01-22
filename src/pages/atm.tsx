import { useCustomerData } from '@/components/CustomerProvider';
import Link from 'next/link';

const Atm = () => {
    const { firstName, lastName, getBalance } = useCustomerData();

    return (
        <>
            <h1>atm</h1>
            <div>
                Hello, {firstName} {lastName}!
            </div>
            <div>Your Balance: {getBalance()}</div>
            <Link href={'/deposit'}>Deposit</Link>
            <Link href={'/withdrawal'}>Withdrawal</Link>
        </>
    );
};

export default Atm;
