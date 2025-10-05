import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    sendEmailVerification, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail, 
    signOut,
    updateEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    onAuthStateChanged,
    deleteUser 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, getDoc, updateDoc, serverTimestamp,deleteDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



const firebaseConfig = {
    apiKey: "AIzaSyDC2KPlKBno5KPuSDeoDHUnrmdLe96R2OI",
    authDomain: "blog-app-1e3ae.firebaseapp.com",
    projectId: "blog-app-1e3ae",
    storageBucket: "blog-app-1e3ae.appspot.com",
    messagingSenderId: "680779967075",
    appId: "1:680779967075:web:71190389a39f81e71da656",
    measurementId: "G-Q27NYTF5HB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {auth,getAuth,provider,createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,updateEmail,updatePassword,EmailAuthProvider,reauthenticateWithCredential,onAuthStateChanged,deleteUser,db, getFirestore, collection, addDoc, doc, setDoc, getDocs, getDoc, updateDoc, serverTimestamp,deleteDoc
};
