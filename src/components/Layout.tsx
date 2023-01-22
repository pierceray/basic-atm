import { CustomerProvider } from './CustomerProvider';

interface LayoutType {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutType> = ({ children }) => {
    return <CustomerProvider>{children}</CustomerProvider>;
};

export default Layout;
