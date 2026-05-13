import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { forgotPassword, forgotPasswordOtp } = useAuth();

  const handleSendReset = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setShowOtpScreen(true);
      Alert.alert('Success', result.message || 'An OTP code has been sent to your email');
    } else {
      setErrorMessage(result.error || 'An error occurred');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP code');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter a new password');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPasswordOtp(email, otp, password, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Success',
        'Your password has been reset successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      setErrorMessage(result.error || 'An error occurred');
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.innerContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ChevronLeft size={24} color="#1F2937" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={appLogoIcon} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {!showOtpScreen ? (
            <>
              {/* Email Reset Form */}
              <Text style={styles.formTitle}>Reset Password</Text>

              {/* Instruction Text */}
              <Text style={styles.instructionText}>
                Enter your email and we'll send you an OTP code to reset your password
              </Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendReset}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Verification Form */}
              <Text style={styles.formTitle}>Verify OTP</Text>
              <Text style={styles.otpSubtitle}>
                A code has been sent to {email}
              </Text>

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OTP Code <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP code"
                  placeholderTextColor="#9CA3AF"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    setErrorMessage('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Reset</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => {
                  setShowOtpScreen(false);
                  setOtp('');
                  setPassword('');
                  setConfirmPassword('');
                  setErrorMessage('');
                }}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.resendText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FB',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 0,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  logoImage: {
    width: 192,
    height: 100,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#1E5BAC',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1E5BAC',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    color: '#1E5BAC',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ForgotPassword;
