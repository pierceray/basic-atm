import { useRouter } from 'next/router';
import { CustomerProvider } from './CustomerProvider';

interface LayoutType {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutType> = ({ children }) => {
    const router = useRouter();

    const customerInfo = {
        firstName: router.query.firstName,
        lastName: router.query.lastName,
        account: router.query.account,
    };
    return (
        <CustomerProvider customerInfo={customerInfo}>
            {children}
        </CustomerProvider>
    );
};

export default Layout;
