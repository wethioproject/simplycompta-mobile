import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import Splash from '../screens/splash/Splash';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import ForgotPassword from '../screens/auth/ForgotPassword';
import ChangePassword from '../screens/auth/ChangePassword';
import HomeDrawer from './HomeDrawer';
import MyBusiness from '../screens/myBusiness/MyBusiness';
import MyAccount from '../screens/myAccount/MyAccount';
import Settings from '../screens/settings/Settings';
import Preferences from '../screens/settings/Preferences';
import PaymentMethods from '../screens/settings/PaymentMethods';
import EditPaymentMethod from '../screens/settings/EditPaymentMethod';
import Currencies from '../screens/settings/Currencies';
import Taxes from '../screens/settings/Taxes';
import EditTax from '../screens/settings/EditTax';
import EditCategories from '../screens/settings/EditCategories';
import ExpenditureCategories from '../screens/settings/ExpenditureCategories';
import Templates from '../screens/settings/Templates';
import BankAccounts from '../screens/settings/BankAccounts';
import EditBankAccount from '../screens/settings/EditBankAccount';
import Catalogue from '../screens/settings/Catalogue';
import Numbering from '../screens/settings/Numbering';
import EditNumbering from '../screens/settings/EditNumbering';
import ConfigurationSmtp from "../screens/settings/ConfigurationSmtp";import InvoiceDetail from '../screens/home/InvoiceDetail';
import ClientDetail from '../screens/home/ClientDetail';
import AccountStatement from '../screens/home/AccountStatement';
import Documents from '../screens/home/Documents';
import DeliveryNotes from '../screens/home/DeliveryNotes';
// import Credits from '../screens/home/Credits';
import Products from '../screens/home/Products';
import Payments from '../screens/home/Payments';
import Expenses from '../screens/home/Expenses';
import EditExpense from '../screens/home/EditExpense';
import EditPayments from '../screens/home/EditPayments';
import AddTransaction from '../screens/transaction/AddTransaction';
import AddArticle from '../screens/transaction/AddArticle';
import AddBankStatement from '../screens/bankStatement/AddBankStatement';
import AddDeliveryNote from '../screens/deliverynote/AddDeliveryNote';
import AddCredit from '../screens/credit/AddCredit';
import AddProduct from '../screens/product/AddProduct';
import AddRegulation from '../screens/regulation/AddRegulation';
import AddClient from '../screens/client/AddClient';
import Notifications from '../screens/notification/Notifications';
import NotificationDetail from '../screens/notification/NotificationDetail';
import QuoteDetail from '../screens/home/QuoteDetail';
import HomeProfile from '../screens/home/Profile';
import LegalDocuments from '../screens/home/Legal';
import AllDocuments from '../screens/home/AllDocuments';
import AccountingDocuments from '../screens/home/Accounting';
import Activity from '../screens/home/Activity';
import BankStatements from '../screens/home/BankStatements';
import Contact from '../screens/home/Contact';
import Invoice from '../screens/home/Invoice';
import Quote from '../screens/home/Quote';
import PersonalProfile from '../screens/home/PersonalProfile';
import CompanyProfile from '../screens/home/CompanyProfile';
import Suppliers from '../screens/home/Suppliers';
import Contacts from '../screens/home/Contacts';
import SupplierDetail from '../screens/home/SupplierDetail';
import NotificationPreferences from '../screens/home/NotificationPreferences';
import AccountSecurity from '../screens/home/AccountSecurity';
import LanguageSettings from '../screens/home/LanguageSettings';
import DocumentsList from '../screens/home/DocumentsList';
import WhatsAppBot from '../screens/home/WhatsAppBot';
import WhatsAppBotOtp from '../screens/home/WhatsAppBotOtp';
import MyPlan from '../screens/home/MyPlan';
import DgiExport from '../screens/home/DgiExport';
import BusinessAssistant from '../screens/home/BusinessAssistant';
import PmeNetwork from '../screens/home/PmeNetwork';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeDrawer} options={{ headerShown: false }} />
        <Stack.Screen name="My Business" component={MyBusiness} options={{ headerShown: false }} />
        <Stack.Screen name="My Account" component={MyAccount} options={{ headerShown: false }} />
        <Stack.Screen name="Change Password" component={ChangePassword} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
        <Stack.Screen name="Preferences" component={Preferences} options={{ headerShown: false }} />
        <Stack.Screen name="Payment Methods" component={PaymentMethods} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Payment Method" component={EditPaymentMethod} options={{ headerShown: false }} />
        <Stack.Screen name="Currencies" component={Currencies} options={{ headerShown: false }} />
        <Stack.Screen name="Taxes" component={Taxes} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Tax" component={EditTax} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Categories" component={EditCategories} options={{ headerShown: false }} />
        <Stack.Screen name="Expenditure Categories" component={ExpenditureCategories} options={{ headerShown: false }} />
        <Stack.Screen name="Templates" component={Templates} options={{ headerShown: false }} />
        <Stack.Screen name="Catalogue" component={Catalogue} options={{ headerShown: false }} />
        <Stack.Screen name="Numbering" component={Numbering} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Numbering" component={EditNumbering} options={{ headerShown: false }} />
        <Stack.Screen name="Configuration Smtp" component={ConfigurationSmtp} options={{ headerShown: false }} />
        <Stack.Screen name="Bank Accounts" component={BankAccounts} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Bank Account" component={EditBankAccount} options={{ headerShown: false }} />
        <Stack.Screen name="Invoice Detail" component={InvoiceDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Quote Detail" component={QuoteDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Client Detail" component={ClientDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Account Statement" component={AccountStatement} options={{ headerShown: false }} />
        <Stack.Screen name="Documents" component={Documents} options={{ headerShown: false }} />
        <Stack.Screen name="Delivery Notes" component={DeliveryNotes} options={{ headerShown: false }} />
        {/* <Stack.Screen name="Credits" component={Credits} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Products" component={Products} options={{ headerShown: false }} />
        <Stack.Screen name="Payments" component={Payments} options={{ headerShown: false }} />
        <Stack.Screen name="Expenses" component={Expenses} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Expense" component={EditExpense} options={{ headerShown: false }} />
        <Stack.Screen name="Edit Payments" component={EditPayments} options={{ headerShown: false }} />
        <Stack.Screen name="Add Transaction" component={AddTransaction} options={{ headerShown: false }} />
        <Stack.Screen name="Add Article" component={AddArticle} options={{ headerShown: false }} />
        <Stack.Screen name="Add Bank Statement" component={AddBankStatement} options={{ headerShown: false }} />
        <Stack.Screen name="Add Delivery Note" component={AddDeliveryNote} options={{ headerShown: false }} />
        <Stack.Screen name="Add Credit" component={AddCredit} options={{ headerShown: false }} />
        <Stack.Screen name="Add Product" component={AddProduct} options={{ headerShown: false }} />
        <Stack.Screen name="Add Regulation" component={AddRegulation} options={{ headerShown: false }} />
        <Stack.Screen name="Add Client" component={AddClient} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={Notifications} options={{ headerShown: false }} />
        <Stack.Screen name="Notification Detail" component={NotificationDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={HomeProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Legal Documents" component={LegalDocuments} options={{ headerShown: false }} />
        <Stack.Screen name="AllDocuments" component={AllDocuments} options={{ headerShown: false }}/>
        <Stack.Screen name="Accounting Documents" component={AccountingDocuments} options={{ headerShown: false }} />
        <Stack.Screen name="Activity" component={Activity} options={{ headerShown: false }} />
        <Stack.Screen name="Bank Statements" component={BankStatements} options={{ headerShown: false }} />
        <Stack.Screen name="Contact" component={Contact} options={{ headerShown: false }} />
        <Stack.Screen name="Invoice" component={Invoice} options={{ headerShown: false }} />
        <Stack.Screen name="Quote" component={Quote} options={{ headerShown: false }} />
        <Stack.Screen name="Personal Profile" component={PersonalProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Company Profile" component={CompanyProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Notification Preferences" component={NotificationPreferences} options={{ headerShown: false }} />
        <Stack.Screen name="Suppliers" component={Suppliers} options={{ headerShown: false }} />
        <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
        <Stack.Screen name="Supplier Detail" component={SupplierDetail} options={{ headerShown: false }} />
        <Stack.Screen name="Account Security" component={AccountSecurity} options={{ headerShown: false }} />
        <Stack.Screen name="Language Settings" component={LanguageSettings} options={{ headerShown: false }} />
        <Stack.Screen name="Documents List" component={DocumentsList} options={{ headerShown: false }} />
        <Stack.Screen name="WhatsApp Bot" component={WhatsAppBot} options={{ headerShown: false }} />
        <Stack.Screen name="WhatsApp Bot OTP" component={WhatsAppBotOtp} options={{ headerShown: false }} />
        <Stack.Screen name="My Plan" component={MyPlan} options={{ headerShown: false }} />
        <Stack.Screen name="Export DGI Compatible" component={DgiExport} options={{ headerShown: false }} />
        <Stack.Screen name="Assistant Comptable" component={BusinessAssistant} options={{ headerShown: false }} />
        <Stack.Screen name="PME Network" component={PmeNetwork} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </>
  );
};

export default AppNavigator;
