import { render, screen } from '@testing-library/react';

import { EmptyState } from '@/components/feedback/EmptyState';

describe('EmptyState', () => {
  it('renders the empty state title and description', () => {
    render(<EmptyState title="No APIs registered" description="Add an API to the registry." />);

    expect(screen.getByText('No APIs registered')).toBeInTheDocument();
    expect(screen.getByText('Add an API to the registry.')).toBeInTheDocument();
  });
});
