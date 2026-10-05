const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
initializeApp();

// Increments stats/public.memberCount once per new member document.
// A marker doc keyed by event id makes retries/duplicate deliveries idempotent.
exports.onMemberCreated = onDocumentCreated("members/{memberId}", async event => {
  const db = getFirestore();
  const d = event.data?.data();
  const ok = d && typeof d.name === "string" && typeof d.phone === "string" && typeof d.state === "string" &&
    Number.isInteger(d.height) && d.height >= 50 && d.height <= 400 && d.status === "approved";
  if (!ok) return; // invalid documents are not counted
  const marker = db.doc(`_counter_events/${event.id}`), stats = db.doc("stats/public");
  await db.runTransaction(async tx => {
    if ((await tx.get(marker)).exists) return;
    tx.set(marker, { memberId: event.params.memberId, at: FieldValue.serverTimestamp() });
    tx.set(stats, { memberCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
});
