/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  jest.useFakeTimers();
  let component: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    component = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
    component?.unmount();
  });

  jest.useRealTimers();
});
