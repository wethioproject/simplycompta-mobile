import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Check, LayoutDashboard, Palette, Zap } from 'lucide-react-native';
import { useOnboarding } from '../../hooks/useOnboarding';

const { width: W } = Dimensions.get('window');
const CARD_W = W - 48; // slide paddingHorizontal 24 × 2

type IllustrationProps = {
  isActive: boolean;
};

const resetAnimatedValue = (value: Animated.Value, toValue = 0) => {
  value.stopAnimation();
  value.setValue(toValue);
};

const resetAnimatedValues = (values: Animated.Value[], toValue = 0) => {
  values.forEach(value => resetAnimatedValue(value, toValue));
};

// ─── Illustrations ────────────────────────────────────────────────────────────

const PaymentsIllustration: React.FC<IllustrationProps> = ({ isActive }) => {
  const items = [
    { name: 'Facture #2401', amount: '2 450 MAD', paid: true },
    { name: 'Facture #2402', amount: '1 890 MAD', paid: true },
    { name: 'Facture #2403', amount: '3 200 MAD', paid: false },
  ];

  const cardAnim = useRef(new Animated.Value(0)).current;
  const rowAnims = useRef(items.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isActive) {
      resetAnimatedValue(cardAnim);
      resetAnimatedValues(rowAnims);
      return;
    }

    resetAnimatedValue(cardAnim);
    resetAnimatedValues(rowAnims);

    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        rowAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, [cardAnim, isActive, rowAnims]);

  return (
    <Animated.View
      style={[
        il.card,
        {
          opacity: cardAnim,
          transform: [
            {
              translateY: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {items.map((inv, i) => (
        <Animated.View
          key={i}
          style={{
            opacity: rowAnims[i],
            transform: [
              {
                translateX: rowAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [-18, 0],
                }),
              },
            ],
            marginBottom: i < items.length - 1 ? 10 : 0,
          }}
        >
          <View style={il.invoiceRow}>
            <View style={{ flex: 1 }}>
              <Text style={il.invoiceName}>{inv.name}</Text>
              <Text style={il.invoiceAmount}>{inv.amount}</Text>
            </View>
            <View style={[il.badge, inv.paid ? il.badgePaid : il.badgePending]}>
              {inv.paid && <Check size={9} color="#16A34A" strokeWidth={3} />}
              <Text style={[il.badgeText, inv.paid ? il.badgeTextPaid : il.badgeTextPending]}>
                {inv.paid ? 'Payée' : 'En attente'}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const InvoiceIllustration: React.FC<IllustrationProps> = ({ isActive }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      resetAnimatedValue(cardAnim);
      resetAnimatedValue(badgeAnim);
      return;
    }

    resetAnimatedValue(cardAnim);
    resetAnimatedValue(badgeAnim);

    Animated.sequence([
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(badgeAnim, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeAnim, cardAnim, isActive]);

  return (
    <Animated.View
      style={{
        position: 'relative',
        alignItems: 'center',
        opacity: cardAnim,
        transform: [
          {
            scale: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      }}
    >
      <View style={[il.card, { overflow: 'visible' }]}>
        <View style={il.invoiceHeader}>
          <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={il.invoiceLogoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#111827' }}>FACTURE</Text>
            <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>#FAC-2024-001</Text>
          </View>
        </View>
        <View style={{ gap: 6, marginBottom: 14 }}>
          {[0.75, 1, 0.65].map((w, i) => (
            <View key={i} style={[il.line, { width: CARD_W * 0.7 * w }]} />
          ))}
        </View>
        <View style={{ gap: 6, marginBottom: 14 }}>
          {[0, 1].map(i => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[il.line, { width: CARD_W * 0.38, backgroundColor: '#D1D5DB' }]} />
              <View style={[il.line, { width: 52, backgroundColor: '#D1D5DB' }]} />
            </View>
          ))}
        </View>
        <View style={il.totalRow}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#111827' }}>TOTAL</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>2 450 MAD</Text>
        </View>
      </View>
      <Animated.View
        style={[
          il.checkBadge,
          {
            opacity: badgeAnim,
            transform: [
              {
                scale: badgeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Check size={18} color="#FFFFFF" strokeWidth={3} />
      </Animated.View>
    </Animated.View>
  );
};

const CustomizationIllustration: React.FC<IllustrationProps> = ({ isActive }) => {
  const containerAnim = useRef(new Animated.Value(0)).current;
  const swatchAnims = useRef(
    ['#6D5EF5', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6'].map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!isActive) {
      resetAnimatedValue(containerAnim);
      resetAnimatedValues(swatchAnims);
      return;
    }

    resetAnimatedValue(containerAnim);
    resetAnimatedValues(swatchAnims);

    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(
        80,
        swatchAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 130,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, [containerAnim, isActive, swatchAnims]);

  const colors = ['#6D5EF5', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6'];

  return (
    <Animated.View
      style={[
        il.card,
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Palette size={18} color="#6D5EF5" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Personnalisation</Text>
      </View>
      <Text style={il.subLabel}>Logo de l'entreprise</Text>
      <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={il.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFF' }}>SC</Text>
      </LinearGradient>
      <Text style={[il.subLabel, { marginTop: 16, marginBottom: 10 }]}>Couleurs principales</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {colors.map((color, i) => (
          <Animated.View
            key={i}
            style={{
              position: 'relative',
              opacity: swatchAnims[i],
              transform: [
                {
                  scale: swatchAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            }}
          >
            <View style={[il.colorSwatch, { backgroundColor: color }]} />
            {i === 0 && (
              <View style={il.colorCheck}>
                <Check size={7} color="#6D5EF5" strokeWidth={3} />
              </View>
            )}
          </Animated.View>
        ))}
      </View>
      <View style={il.previewBox}>
        {[0.75, 1, 0.5].map((w, i) => (
          <View key={i} style={[il.line, { width: CARD_W * 0.62 * w, backgroundColor: '#D1D5DB', marginBottom: i < 2 ? 6 : 0 }]} />
        ))}
      </View>
    </Animated.View>
  );
};

const SpeedIllustration: React.FC<IllustrationProps> = ({ isActive }) => {
  const frameAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!isActive) {
      pulseLoopRef.current?.stop();
      resetAnimatedValue(frameAnim);
      resetAnimatedValue(badgeAnim);
      resetAnimatedValue(buttonPulse, 1);
      return;
    }

    pulseLoopRef.current?.stop();
    resetAnimatedValue(frameAnim);
    resetAnimatedValue(badgeAnim);
    resetAnimatedValue(buttonPulse, 1);

    Animated.parallel([
      Animated.timing(frameAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(badgeAnim, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulse, {
          toValue: 1.05,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoopRef.current.start();

    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [badgeAnim, buttonPulse, frameAnim, isActive]);

  return (
    <Animated.View
      style={{
        opacity: frameAnim,
        transform: [
          {
            scale: frameAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      }}
    >
      <View style={il.phoneFrame}>
        <View style={il.phoneScreen}>
          <View style={il.phoneStatusBar}>
            <Text style={{ fontSize: 8, fontWeight: '600', color: '#374151' }}>9:41</Text>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {[0, 1, 2].map(i => <View key={i} style={il.signalDot} />)}
            </View>
          </View>
          <View style={{ padding: 14, flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#111827', marginBottom: 14 }}>Nouvelle facture</Text>
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 4 }}>Client</Text>
                <View style={il.inputField}>
                  <View style={[il.line, { width: 72, backgroundColor: '#9CA3AF' }]} />
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 4 }}>Montant</Text>
                <View style={il.inputField}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#111827' }}>2 450 MAD</Text>
                </View>
              </View>
            </View>
            <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
              <LinearGradient colors={['#7C3AED', '#2563EB']} style={il.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={il.sendBtnContent}>
                  <Zap size={12} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFF' }}>Envoyer</Text>
                </View>
              </LinearGradient>
            </Animated.View>
            <Animated.View
              style={[
                il.speedBadge,
                {
                  opacity: badgeAnim,
                  transform: [
                    {
                      scale: badgeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFF' }}>30s</Text>
            </Animated.View>
          </View>
        </View>
        <View style={il.phoneNotch} />
      </View>
    </Animated.View>
  );
};

const DashboardIllustration: React.FC<IllustrationProps> = ({ isActive }) => {
  const kpis = [
    { label: 'CA mensuel', value: '12,5K', colors: ['#8B5CF6', '#7C3AED'] },
    { label: 'Factures', value: '24', colors: ['#3B82F6', '#2563EB'] },
    { label: 'Clients', value: '18', colors: ['#22C55E', '#16A34A'] },
    { label: 'Dépenses', value: '3,2K', colors: ['#F97316', '#EA580C'] },
  ];
  const bars = [40, 70, 45, 85, 60, 90, 75];
  const BAR_MAX = 52;

  const containerAnim = useRef(new Animated.Value(0)).current;
  const kpiAnims = useRef(kpis.map(() => new Animated.Value(0))).current;
  const barAnims = useRef(bars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isActive) {
      resetAnimatedValue(containerAnim);
      resetAnimatedValues(kpiAnims);
      resetAnimatedValues(barAnims);
      return;
    }

    resetAnimatedValue(containerAnim);
    resetAnimatedValues(kpiAnims);
    resetAnimatedValues(barAnims);

    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(
        80,
        kpiAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }),
        ),
      ),
      Animated.stagger(
        45,
        barAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ),
      ),
    ]).start();
  }, [barAnims, containerAnim, isActive, kpiAnims]);

  return (
    <Animated.View
      style={[
        il.card,
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <LayoutDashboard size={18} color="#6D5EF5" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>Tableau de bord</Text>
      </View>
      <View style={il.kpiGrid}>
        {kpis.map((k, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: kpiAnims[i],
              transform: [
                {
                  scale: kpiAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <LinearGradient colors={k.colors} style={il.kpiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', marginBottom: 3 }}>{k.label}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>{k.value}</Text>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
      <View style={il.chartArea}>
        {bars.map((h, i) => (
          <View key={i} style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Animated.View
              style={{
                width: '100%',
                height: barAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, BAR_MAX * h / 100],
                }),
              }}
            >
              <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={il.bar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
            </Animated.View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Slides ────────────────────────────────────────────────────────────────────

type SlideData = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  Illustration: React.ComponentType<IllustrationProps>;
};

const SLIDES: SlideData[] = [
  { id: '1', titleKey: 'onboarding_title_1', descriptionKey: 'onboarding_desc_1', Illustration: PaymentsIllustration },
  { id: '2', titleKey: 'onboarding_title_2', descriptionKey: 'onboarding_desc_2', Illustration: InvoiceIllustration },
  { id: '3', titleKey: 'onboarding_title_3', descriptionKey: 'onboarding_desc_3', Illustration: CustomizationIllustration },
  { id: '4', titleKey: 'onboarding_title_4', descriptionKey: 'onboarding_desc_4', Illustration: SpeedIllustration },
  { id: '5', titleKey: 'onboarding_title_5', descriptionKey: 'onboarding_desc_5', Illustration: DashboardIllustration },
];

// ─── Screen ────────────────────────────────────────────────────────────────────

const OnboardingScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const startXRef = useRef(0);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, SLIDES.length - 1));
    currentIndexRef.current = clamped;
    setCurrentIndex(clamped);
    Animated.timing(slideAnim, {
      toValue: -clamped * W,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        startXRef.current = -(currentIndexRef.current * W);
      },
      onPanResponderMove: (_, g) => {
        slideAnim.setValue(startXRef.current + g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const idx = currentIndexRef.current;
        if (g.dx < -50 && idx < SLIDES.length - 1) {
          goTo(idx + 1);
        } else if (g.dx > 50 && idx > 0) {
          goTo(idx - 1);
        } else {
          Animated.spring(slideAnim, {
            toValue: -(idx * W),
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleSkip = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const handleNext = () => {
    if (isLastSlide) { handleGetStarted(); return; }
    goTo(currentIndex + 1);
  };

  const handlePrev = () => { goTo(currentIndex - 1); };

  return (
    <LinearGradient
      colors={['#6D5EF5', '#4F7CF7']}
      style={styles.root}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      {/* Blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* ── Top: progress + welcome ──────────────────────────── */}
      <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
        <View style={styles.progressRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View style={[styles.progressFill, i <= currentIndex && styles.progressFillActive]} />
            </View>
          ))}
        </View>
        <Text style={styles.welcomeText}>{t('onboarding_welcome')}</Text>
      </View>

      {/* ── Middle: swipeable slides ─────────────────────────── */}
      <View style={styles.slideContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[styles.slideRow, { width: W * SLIDES.length, transform: [{ translateX: slideAnim }] }]}
        >
          {SLIDES.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
              <Text style={styles.slideSubtitle}>{t(slide.descriptionKey)}</Text>
              <View style={styles.illustrationArea}>
                <slide.Illustration isActive={slide.id === SLIDES[currentIndex].id} />
              </View>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* ── Bottom: nav dots + CTAs ──────────────────────────── */}
      <View style={styles.bottomSection}>
        <View style={styles.navRow}>
          {currentIndex > 0 ? (
            <TouchableOpacity style={styles.arrowBtn} onPress={handlePrev} activeOpacity={0.7}>
              <ChevronLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowPlaceholder} />
          )}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex ? styles.dotActive : styles.dotInactive]} />
            ))}
          </View>
          {!isLastSlide ? (
            <TouchableOpacity style={styles.arrowBtn} onPress={handleNext} activeOpacity={0.7}>
              <ChevronRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.arrowPlaceholder} />
          )}
        </View>

        <View style={[styles.ctaSection, { paddingBottom: Math.max(20, insets.bottom + 8) }]}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={handleGetStarted} activeOpacity={0.9}>
            <Text style={styles.ctaPrimaryText}>{t('onboarding_cta_signup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={handleSkip} activeOpacity={0.8}>
            <Text style={styles.ctaSecondaryText}>{t('onboarding_cta_login')}</Text>
          </TouchableOpacity>
          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('onboarding_skip_intro')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

// ─── Illustration styles ──────────────────────────────────────────────────────
const il = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: 20,
    width: CARD_W,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  invoiceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10 },
  invoiceName: { fontSize: 12, fontWeight: '600', color: '#111827' },
  invoiceAmount: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FFEDD5' },
  badgeText: { fontSize: 10, fontWeight: '600' },
  badgeTextPaid: { color: '#16A34A' },
  badgeTextPending: { color: '#EA580C' },
  invoiceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  invoiceLogoBox: { width: 44, height: 44, borderRadius: 10 },
  line: { height: 7, backgroundColor: '#E5E7EB', borderRadius: 4 },
  totalRow: { borderTopWidth: 2, borderTopColor: '#E5E7EB', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkBadge: { position: 'absolute', top: -10, right: -10, width: 44, height: 44, borderRadius: 22, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  subLabel: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  logoBox: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  colorSwatch: { width: 34, height: 34, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  colorCheck: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  previewBox: { marginTop: 16, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14 },
  phoneFrame: { backgroundColor: '#1F2937', borderRadius: 36, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  phoneScreen: { backgroundColor: '#FFFFFF', borderRadius: 28, overflow: 'hidden', height: 280, width: CARD_W - 40 },
  phoneStatusBar: { height: 24, backgroundColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  signalDot: { width: 10, height: 7, backgroundColor: '#9CA3AF', borderRadius: 2 },
  inputField: { height: 32, backgroundColor: '#F3F4F6', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 10 },
  sendBtn: { marginTop: 16, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sendBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  speedBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#22C55E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  phoneNotch: { position: 'absolute', top: 0, alignSelf: 'center', width: 74, height: 18, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: '#1F2937' },
  kpiGrid: { flexDirection: 'row',
     flexWrap: 'wrap', 
     gap: 8, 
     marginBottom: 12, 
    },
  kpiCard: { width: (CARD_W - 58) / 2, borderRadius: 16, padding: 10, height: 80 },
  chartArea: { height: 60, backgroundColor: '#F9FAFB', borderRadius: 14, flexDirection: 'row', alignItems: 'flex-end', padding: 8, gap: 4 },
  bar: { flex: 1, borderRadius: 4, width: '100%' },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  blobTopRight: { position: 'absolute', top: 60, right: -20, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)' },
  blobBottomLeft: { position: 'absolute', bottom: 60, left: -30, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.07)' },

  // Top
  topSection: { paddingHorizontal: 24, paddingBottom: 14 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, width: '0%', backgroundColor: 'rgba(255,255,255,0.25)' },
  progressFillActive: { width: '100%', backgroundColor: '#FFFFFF' },
  welcomeText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  // Slides
  slideContainer: { flex: 1, overflow: 'hidden' },
  slideRow: { flex: 1, flexDirection: 'row' },
  slide: { width: W, paddingHorizontal: 24 },
  slideTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', lineHeight: 34, marginBottom: 8, letterSpacing: 0.4 },
  slideSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginBottom: 16 },
  illustrationArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Bottom
  bottomSection: { paddingHorizontal: 24 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  arrowBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  arrowPlaceholder: { width: 40 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
  dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.35)' },

  // CTA
  ctaSection: { gap: 10 },
  ctaPrimary: { backgroundColor: '#FFFFFF', borderRadius: 50, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  ctaPrimaryText: { fontSize: 16, fontWeight: '700', color: '#22C55E' },
  ctaSecondary: { borderRadius: 50, paddingVertical: 15, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  ctaSecondaryText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.55)' },
});

export default OnboardingScreen;
