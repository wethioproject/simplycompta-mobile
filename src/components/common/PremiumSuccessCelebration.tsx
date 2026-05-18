import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  I18nManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { premiumTheme } from '../../theme/premiumTheme';

type PremiumSuccessCelebrationProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  continueLabel?: string;
  autoDismissMs?: number;
  actions?: Array<{
    label: string;
    onPress: () => void;
    primary?: boolean;
  }>;
  onDone: () => void;
};

type ConfettiPiece = {
  key: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  drift: number;
  rotate: string;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const confettiColors = ['#1E5BAC', '#16A34A', '#F59E0B', '#0EA5E9', '#94A3B8'];

const buildConfetti = (): ConfettiPiece[] =>
  Array.from({ length: 18 }).map((_, index) => ({
    key: `confetti-${index}`,
    left: 18 + ((index * 41) % Math.max(screenWidth - 36, 160)),
    delay: (index % 6) * 90,
    duration: 1350 + (index % 5) * 140,
    size: 5 + (index % 3) * 2,
    color: confettiColors[index % confettiColors.length],
    drift: (I18nManager.isRTL ? -1 : 1) * (-22 + (index % 7) * 8),
    rotate: `${(index % 2 === 0 ? 1 : -1) * (90 + index * 13)}deg`,
  }));

const PremiumSuccessCelebration: React.FC<PremiumSuccessCelebrationProps> = ({
  visible,
  title,
  subtitle,
  continueLabel = 'Continue',
  autoDismissMs = 3800,
  actions = [],
  onDone,
}) => {
  const card = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.6)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const confettiProgress = useRef(buildConfetti().map(() => new Animated.Value(0))).current;
  const confetti = useMemo(() => buildConfetti(), []);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (!visible) {
      doneRef.current = false;
      card.setValue(0);
      checkScale.setValue(0.6);
      checkOpacity.setValue(0);
      confettiProgress.forEach(value => value.setValue(0));
      return;
    }

    Vibration.vibrate(18);

    Animated.parallel([
      Animated.spring(card, {
        toValue: 1,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(130),
        Animated.parallel([
          Animated.spring(checkScale, {
            toValue: 1,
            friction: 5,
            tension: 120,
            useNativeDriver: true,
          }),
          Animated.timing(checkOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.stagger(
        35,
        confettiProgress.map(value =>
          Animated.timing(value, {
            toValue: 1,
            duration: 1700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();

    const timer = setTimeout(finish, autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs, card, checkOpacity, checkScale, confettiProgress, visible]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish}>
      <Pressable style={styles.backdrop} onPress={finish}>
        <View pointerEvents="none" style={styles.confettiLayer}>
          {confetti.map((piece, index) => {
            const progress = confettiProgress[index];
            return (
              <Animated.View
                key={piece.key}
                style={[
                  styles.confetti,
                  {
                    left: piece.left,
                    width: piece.size,
                    height: piece.size * 1.8,
                    borderRadius: piece.size / 2,
                    backgroundColor: piece.color,
                    opacity: progress.interpolate({
                      inputRange: [0, 0.18, 0.88, 1],
                      outputRange: [0, 0.9, 0.9, 0],
                    }),
                    transform: [
                      {
                        translateY: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-40 - piece.delay / 8, screenHeight * 0.42],
                        }),
                      },
                      {
                        translateX: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, piece.drift],
                        }),
                      },
                      {
                        rotate: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', piece.rotate],
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: card,
              transform: [
                {
                  translateY: card.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: card.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconWrap,
              {
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Check size={34} color="#FFFFFF" strokeWidth={3} />
          </Animated.View>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {actions.length > 0 ? (
            <View style={styles.actions}>
              {actions.map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionButton, action.primary && styles.actionButtonPrimary]}
                  activeOpacity={0.88}
                  onPress={() => {
                    if (doneRef.current) return;
                    doneRef.current = true;
                    action.onPress();
                  }}
                >
                  <Text style={[styles.actionButtonText, action.primary && styles.actionButtonTextPrimary]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.button} activeOpacity={0.88} onPress={finish}>
              <Text style={styles.buttonText}>{continueLabel}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    ...premiumTheme.shadow.lifted,
  },
  iconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: premiumTheme.colors.success,
  },
  title: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
    color: premiumTheme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: premiumTheme.colors.muted,
    textAlign: 'center',
    marginBottom: 18,
  },
  button: {
    minWidth: 132,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumTheme.colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
  },
  actionButtonPrimary: {
    backgroundColor: premiumTheme.colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: premiumTheme.colors.text,
  },
  actionButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export default PremiumSuccessCelebration;
