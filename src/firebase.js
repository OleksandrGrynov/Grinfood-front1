import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// 🛡️ ВИКОРИСТОВУЄМО ЗВИЧАЙНИЙ ReCAPTCHA V3 (НЕ ENTERPRISE)
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
console.log("SITE KEY:", process.env.REACT_APP_RECAPTCHA_V3_KEY);

initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_V3_KEY),
    isTokenAutoRefreshEnabled: true,
});

const auth = getAuth(app);
export { auth };
