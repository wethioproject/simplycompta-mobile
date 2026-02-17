import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { appLogoIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
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
      setErrorMessage('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setShowOtpScreen(true);
      Alert.alert('Succès', result.message || 'Un code OTP a été envoyé à votre email');
    } else {
      setErrorMessage(result.error || 'Une erreur est survenue');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMessage('Veuillez entrer le code OTP');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Veuillez entrer un nouveau mot de passe');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const result = await forgotPasswordOtp(email, otp, password, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } else {
      setErrorMessage(result.error || 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Retour</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={appLogoIcon} style={styles.logoImage} resizeMode="contain" />
      </View>

      {!showOtpScreen ? (
        <>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Entrez votre Email"
              placeholderTextColor="#B0B0B0"
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

          {/* Instruction Text */}
          <Text style={styles.instructionText}>
            Entrez votre email et nous vous enverrons le code OTP pour réinitialiser votre mot de passe
          </Text>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSendReset}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Envoyer</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* OTP Screen */}
          <Text style={styles.otpTitle}>Vérification OTP</Text>
          <Text style={styles.otpSubtitle}>
            Un code a été envoyé à {email}
          </Text>

          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Code OTP"
              placeholderTextColor="#B0B0B0"
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#B0B0B0"
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#B0B0B0"
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
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Vérifier</Text>
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
          >
            <Text style={styles.resendText}>Renvoyer le code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backArrow: {
    fontSize: 32,
    color: '#333333',
    marginRight: 8,
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    color: '#333333',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 40,
  },
  logoImage: {
    width: 200,
    height: 120,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 40,
  },
  sendButton: {
    backgroundColor: '#242A59',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#242A59',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#242A59',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPassword;
