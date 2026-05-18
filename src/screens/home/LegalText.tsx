import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react-native';

const LEGAL_COPY = {
  fr: {
    terms: {
      title: "Conditions d'utilisation",
      sections: [
        ['Objet', "SimplyCompta permet de gérer des documents, factures, dépenses, exports et échanges comptables depuis l'application mobile."],
        ['Compte', "L'utilisateur doit fournir des informations exactes et protéger ses identifiants. Toute action réalisée depuis son compte est réputée effectuée par lui."],
        ['Données', "Les données comptables restent la propriété de l'utilisateur. SimplyCompta les traite uniquement pour fournir le service et améliorer l'expérience."],
        ['Usage acceptable', "Il est interdit d'utiliser l'application pour transmettre du contenu illégal, frauduleux ou portant atteinte aux droits de tiers."],
        ['Disponibilité', "Le service peut évoluer et faire l'objet de maintenance. Les fonctionnalités premium dépendent du plan souscrit."],
      ],
    },
    sales: {
      title: 'Conditions générales de vente',
      sections: [
        ['Abonnements', "Les plans Free, Pro et Business donnent accès à des fonctionnalités différentes. Les modules Business incluent notamment l'Annuaire PME et l'Export DGI."],
        ['Prix et paiement', "Les prix affichés hors application ou dans l'espace abonnement prévalent. Les taxes applicables peuvent s'ajouter selon la réglementation."],
        ['Renouvellement', "Les abonnements sont renouvelés selon la période choisie sauf résiliation avant l'échéance."],
        ['Support', "Le support accompagne l'utilisateur sur les questions techniques et fonctionnelles liées à SimplyCompta."],
        ['Responsabilité', "L'utilisateur reste responsable de la vérification finale de ses déclarations, exports et documents comptables."],
      ],
    },
  },
  en: {
    terms: {
      title: 'Terms of use',
      sections: [
        ['Purpose', 'SimplyCompta helps manage documents, invoices, expenses, exports and accounting conversations from the mobile app.'],
        ['Account', 'Users must provide accurate information and protect their credentials. Actions from an account are considered performed by that user.'],
        ['Data', 'Accounting data remains owned by the user. SimplyCompta processes it only to provide the service and improve the experience.'],
        ['Acceptable use', 'The app must not be used to transmit illegal, fraudulent or third-party infringing content.'],
        ['Availability', 'The service may evolve and require maintenance. Premium features depend on the subscribed plan.'],
      ],
    },
    sales: {
      title: 'General terms of sale',
      sections: [
        ['Subscriptions', 'Free, Pro and Business plans unlock different capabilities. Business modules include PME Directory and DGI Export.'],
        ['Pricing and payment', 'Prices shown outside the app or in the subscription area apply. Applicable taxes may be added according to regulations.'],
        ['Renewal', 'Subscriptions renew according to the selected billing period unless cancelled before renewal.'],
        ['Support', 'Support helps users with technical and functional questions related to SimplyCompta.'],
        ['Liability', 'Users remain responsible for final review of declarations, exports and accounting documents.'],
      ],
    },
  },
  ar: {
    terms: {
      title: 'شروط الاستخدام',
      sections: [
        ['الغرض', 'يساعد SimplyCompta على إدارة الوثائق والفواتير والمصاريف والتصدير والمحادثات المحاسبية من التطبيق.'],
        ['الحساب', 'يجب على المستخدم تقديم معلومات صحيحة وحماية بيانات الدخول الخاصة به.'],
        ['البيانات', 'تبقى البيانات المحاسبية ملكا للمستخدم وتتم معالجتها فقط لتقديم الخدمة وتحسين التجربة.'],
        ['الاستخدام المقبول', 'يمنع استعمال التطبيق لإرسال محتوى غير قانوني أو احتيالي أو مخالف لحقوق الغير.'],
        ['التوفر', 'قد تتطور الخدمة أو تخضع للصيانة. تعتمد الميزات المدفوعة على الخطة المختارة.'],
      ],
    },
    sales: {
      title: 'الشروط العامة للبيع',
      sections: [
        ['الاشتراكات', 'تمنح خطط Free و Pro و Business إمكانيات مختلفة. تشمل ميزات Business دليل الشركات وتصدير DGI.'],
        ['السعر والدفع', 'تطبق الأسعار المعروضة في مساحة الاشتراك وقد تضاف الضرائب حسب القوانين.'],
        ['التجديد', 'تتجدد الاشتراكات حسب الفترة المختارة ما لم يتم الإلغاء قبل الموعد.'],
        ['الدعم', 'يساعد الدعم في الأسئلة التقنية والوظيفية المتعلقة ب SimplyCompta.'],
        ['المسؤولية', 'يبقى المستخدم مسؤولا عن المراجعة النهائية للتصاريح والتصديرات والوثائق المحاسبية.'],
      ],
    },
  },
};

const LegalText: React.FC = ({ navigation, route }: any) => {
  const { i18n } = useTranslation();
  const type = route?.params?.type === 'sales' ? 'sales' : 'terms';
  const language = i18n.language?.startsWith('ar') ? 'ar' : i18n.language?.startsWith('en') ? 'en' : 'fr';
  const copy = useMemo(() => LEGAL_COPY[language][type], [language, type]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{copy.title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <FileText size={28} color="#1E5BAC" />
          <Text style={styles.heroTitle}>{copy.title}</Text>
          <Text style={styles.heroSubtitle}>SimplyCompta</Text>
        </View>
        {copy.sections.map(([title, body]) => (
          <View key={title} style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionBody}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { height: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: '#111827' },
  headerSpacer: { width: 40 },
  content: { padding: 18, paddingBottom: 36, gap: 12 },
  hero: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', padding: 18, gap: 8 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  heroSubtitle: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  section: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EEF2F7', padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#1E5BAC', marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 21, color: '#334155', fontWeight: '600' },
});

export default LegalText;
