/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import App from './src/App';
import { name as appName } from './app.json';
import { setupTypography } from './src/theme/setupTypography';

setupTypography();

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => Root);
