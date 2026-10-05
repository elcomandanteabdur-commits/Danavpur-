// Firebase wiring only. No UI code here.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, onSnapshot, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCEF0ad3DgH8VjoSnHOYvfgqjr0rNU1POc",
  authDomain: "danavpur-ab00b.firebaseapp.com",
  projectId: "danavpur-ab00b",
  storageBucket: "danavpur-ab00b.firebasestorage.app",
  messagingSenderId: "412404563677",
  appId: "1:412404563677:web:be1e604f91028c6e362534",
  measurementId: "G-KFPYCE41XY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// App Check (optional, recommended): set window.DANAVPUR_APPCHECK_KEY (reCAPTCHA v3 site key) before main.js loads.
if (window.DANAVPUR_APPCHECK_KEY) {
  import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js").then(m =>
    m.initializeAppCheck(app, { provider: new m.ReCaptchaV3Provider(window.DANAVPUR_APPCHECK_KEY), isTokenAutoRefreshEnabled: true })
  ).catch(e => console.warn("App Check unavailable", e));
}

/** Live read of stats/public.memberCount. Returns unsubscribe. */
export function watchMemberCount(onValue, onError) {
  return onSnapshot(doc(db, "stats", "public"), snap => {
    const n = snap.exists() ? snap.data().memberCount : undefined;
    Number.isInteger(n) ? onValue(n) : onError(new Error("memberCount missing"));
  }, onError);
}

/** Create members/{autoId}. Field set matches the Firestore rules exactly. */
export async function createMember({ name, phone, state, height }) {
  const ref = await addDoc(collection(db, "members"), {
    name, phone, state, height, createdAt: serverTimestamp(), status: "approved"
  });
  return ref.id;
}
