import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import Layout from './Layout';

jest.mock('next/router', () => require('next-router-mock'));

describe('Layout', () => {
    it('render the layout with content', () => {
        render(<Layout>Content</Layout>);

        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
