import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/app/App';

test('renders without crashing', () => {
  render(<App />);
});
