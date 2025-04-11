import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!serviceAccount) {
  console.warn(
    "Firebase service account not found. Authentication will not work properly."
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount || {}),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const auth = admin.auth();
export const db = admin.firestore();
