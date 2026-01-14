import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCg7Le8yNtU3QyLKoPus_VFJxHayYL4jbY",
    authDomain: "projectpushnotificition.firebaseapp.com",
    projectId: "projectpushnotificition",
    storageBucket: "projectpushnotificition.firebasestorage.app",
    messagingSenderId: "1052548934309",
    appId: "1:1052548934309:web:cfdaff06e11ea1b1ff7b4c",
    measurementId: "G-MX0TEF62VD"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
