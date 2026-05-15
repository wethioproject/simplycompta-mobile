import React from 'react';
import { StatusBar } from 'react-native';
import './i18n/i18n';
import AppNavigator from './navigation';
import RestrictedAccessModal from './components/RestrictedAccessModal';
import OnboardingChecklistModal from './components/onboarding/OnboardingChecklistModal';
import { SecurityProvider } from './contexts/SecurityContext';
import SecurityGate from './components/security/SecurityGate';

const App = () => {
  return (
    <SecurityProvider>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <AppNavigator />
      <RestrictedAccessModal />
      <OnboardingChecklistModal />
      <SecurityGate />
    </SecurityProvider>
  );
};

export default App;
