import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from './Loader';

describe('Loader Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Loader />);
    const loader = container.querySelector('.loader');
    expect(loader).toBeInTheDocument();
  });
});
