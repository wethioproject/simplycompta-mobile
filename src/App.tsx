import React from 'react';
import { StatusBar } from 'react-native';
import './i18n/i18n';
import AppNavigator from './navigation';
import RestrictedAccessModal from './components/RestrictedAccessModal';

const App = () => {
  return (
    <>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <AppNavigator />
      <RestrictedAccessModal />
    </>
  );
};

export default App;