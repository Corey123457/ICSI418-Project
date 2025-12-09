import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBakTgo1_UdYu8xoIege-EC4GnPxWSLza8",
  authDomain: "wanderplan-8992e.firebaseapp.com",
  projectId: "wanderplan-8992e",
  storageBucket: "wanderplan-8992e.appspot.com",
  messagingSenderId: "716827683120",
  appId: "1:716827683120:web:b41f6bf24c02356782c0f5",
  measurementId: "G-Q2G2ZZG8Q8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
