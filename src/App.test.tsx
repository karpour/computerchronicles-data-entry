import React from 'react';
import { render, screen } from '@testing-library/react';
import ComputerChroniclesOriginalEpisodeComponent from './components/ComputerChroniclesOriginalEpisodeComponent';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
