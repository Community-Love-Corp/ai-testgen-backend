import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App.js';

describe('Frontend Basic Tests', () => {
  it('should render the main application', () => {
    render(<App />);
    
    // Replace "AI TestGen" with a piece of text that actually exists in your App.js component
    const headingElement = screen.getByText(/AI Test Case Generator/i);
    expect(headingElement).toBeInTheDocument();
  });
});
