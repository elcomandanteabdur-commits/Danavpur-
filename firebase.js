// Firebase wiring only. No UI code here.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot,
  collection,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCEF0ad3DgH8VJoSnHOYvfgqjr0rNU1POc",
  authDomain: "danavpur-ab00b.firebaseapp.com",
  projectId: "danavpur-ab00b",
  storageBucket: "danavpur-ab00b.firebasestorage.app",
  messagingSenderId: "412404563677",
  appId: "1:412404563677:web:be1e604f91028c6e362534",
  measurementId: "G-KFPYCE41XY"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Optional Firebase App Check
if (window.DANAVPUR_APPCHECK_KEY) {
  import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js")
    .then(m =>
      m.initializeAppCheck(app, {
        provider: new m.ReCaptchaV3Provider(
          window.DANAVPUR_APPCHECK_KEY
        ),
        isTokenAutoRefreshEnabled: true
      })
    )
    .catch(e =>
      console.warn("App Check unavailable", e)
    );
}


/**
 * Live read of stats/public/memberCount.
 * Returns unsubscribe function.
 */
export function watchMemberCount(onValue, onError) {
  return onSnapshot(
    doc(db, "stats", "public"),
    snap => {
      const n = snap.exists()
        ? snap.data().memberCount
        : undefined;

      if (Number.isInteger(n)) {
        onValue(n);
      } else {
        onError(new Error("memberCount missing"));
      }
    },
    onError
  );
}


/**
 * Create a member AND immediately increment the public member count.
 *
 * Both operations happen inside one Firestore transaction.
 */
export async function createMember({
  name,
  phone,
  state,
  height
}) {

  const memberRef = doc(collection(db, "members"));
  const statsRef = doc(db, "stats", "public");

  await runTransaction(db, async transaction => {

    // Read the current public statistics first.
    const statsSnap = await transaction.get(statsRef);

    if (!statsSnap.exists()) {
      throw new Error("Public statistics document does not exist.");
    }

    const currentData = statsSnap.data();
    const currentCount = currentData.memberCount;

    if (!Number.isInteger(currentCount)) {
      throw new Error("Invalid memberCount.");
    }


    // Create the new member.
    transaction.set(memberRef, {
      name,
      phone,
      state,
      height,
      createdAt: serverTimestamp(),
      status: "approved"
    });


    // Immediately increase memberCount by exactly 1.
    transaction.update(statsRef, {
      memberCount: currentCount + 1,
      updatedAt: serverTimestamp()
    });
  });

  return memberRef.id;
}
