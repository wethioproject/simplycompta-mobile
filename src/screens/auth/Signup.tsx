import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import SignupStep1, { Step1Data } from '../../components/auth/SignupStep1';
import SignupOtpVerification from '../../components/auth/SignupOtpVerification';
import SignupStep2, { Step2Data } from '../../components/auth/SignupStep2';
import SignupStep3, { Step3Data } from '../../components/auth/SignupStep3';
import LanguageToggle from '../../components/auth/LanguageToggle';
import { useAuth } from '../../hooks/useAuth';
import { FadeInView } from '../../components/common/PremiumMotion';
import PremiumSuccessCelebration from '../../components/common/PremiumSuccessCelebration';

interface SignupProps {
  navigation: any;
}

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { checkEmail, signup, verifyOtp, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    companyName: '',
    companyType: '',
    city: '',
  });
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  const finishSignup = () => {
    setShowSuccessCelebration(false);
    navigation.replace('Home');
  };

  const handleStep1Next = async (data: Step1Data) => {
    const result = await checkEmail(data.email);
    if (!result.success) {
      Vibration.vibrate(18);
      Toast.show({
        type: 'error',
        text1: t('signup_error_title'),
        text2: result.error ?? t('signup_error_generic'),
        position: 'top',
      });
      return;
    }
    if (result.exists) {
      Vibration.vibrate(18);
      Toast.show({
        type: 'error',
        text1: t('signup_error_title'),
        text2: t('signup_error_email_taken'),
        position: 'top',
      });
      return;
    }
    setStep1Data(data);
    Vibration.vibrate(10);
    setCurrentStep(1.5 as any);
  };

  const handleOtpVerify = async (otp: string) => {
    return await verifyOtp(step1Data.email, otp);
  };

  const handleOtpResend = async () => {
    return await checkEmail(step1Data.email);
  };

  const handleStep2Next = (data: Step2Data) => {
    setStep2Data(data);
    Vibration.vibrate(10);
    setCurrentStep(3);
  };

  const buildPayload = (step3: Step3Data) => ({
    first_name: step1Data.firstName,
    last_name: step1Data.lastName || undefined,
    email: step1Data.email,
    contact: step1Data.phone,
    password: step1Data.password,
    company_type: step2Data.companyType,
    billing_name: step2Data.companyName,
    billing_city: step2Data.city,
    billing_address: step3.address,
    billing_zip: step3.postalCode,
    website: step3.website,
    ice_number: step3.ice,
    patent_number: step3.patente,
    rc_number: step3.rc,
    cnss: step3.cnss,
    if_number: step3.ifNum,
    rib: step3.rib,
    vat_number: step3.vat,
    avatar: step3.logo,
    signature: step3.signature,
  });

  const handleStep3Complete = async (data: Step3Data) => {
    const result = await signup(buildPayload(data));
    if (result.success) {
      Vibration.vibrate(12);
      setShowSuccessCelebration(true);
    } else {
      Vibration.vibrate(18);
      Toast.show({
        type: 'error',
        text1: t('signup_error_title'),
        text2: result.error ?? t('signup_error_generic'),
        position: 'top',
      });
    }
  };

  const handleStep3Skip = async () => {
    const result = await signup(buildPayload({}));
    if (result.success) {
      Vibration.vibrate(12);
      setShowSuccessCelebration(true);
    } else {
      Vibration.vibrate(18);
      Toast.show({
        type: 'error',
        text1: t('signup_error_title'),
        text2: result.error ?? t('signup_error_generic'),
        position: 'top',
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.langToggleRow}>
        <LanguageToggle />
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      )}

      {currentStep === 1 && (
        <FadeInView style={{ flex: 1 }}>
          <SignupStep1
            onNext={handleStep1Next}
            onSignIn={() => navigation.replace('Login')}
          />
        </FadeInView>
      )}
      {(currentStep as any) === 1.5 && (
        <FadeInView style={{ flex: 1 }}>
          <SignupOtpVerification
            email={step1Data.email}
            onVerified={() => {
              Vibration.vibrate(10);
              setCurrentStep(2);
            }}
            onVerify={handleOtpVerify}
            onResend={handleOtpResend}
            onBack={() => setCurrentStep(1)}
            isLoading={isLoading}
          />
        </FadeInView>
      )}
      {currentStep === 2 && (
        <FadeInView style={{ flex: 1 }}>
          <SignupStep2
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1.5 as any)}
          />
        </FadeInView>
      )}
      {currentStep === 3 && (
        <FadeInView style={{ flex: 1 }}>
          <SignupStep3
            onComplete={handleStep3Complete}
            onBack={() => setCurrentStep(2)}
            onSkip={handleStep3Skip}
          />
        </FadeInView>
      )}
      <PremiumSuccessCelebration
        visible={showSuccessCelebration}
        title={t('success_account_created_title', { defaultValue: 'Welcome to SimplyCompta' })}
        subtitle={t('success_account_created_subtitle', { defaultValue: 'Your workspace is ready.' })}
        continueLabel={t('button_continue', { defaultValue: 'Continue' })}
        onDone={finishSignup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  langToggleRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
});

export default Signup;
