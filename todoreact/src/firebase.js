import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDWR1Fp8xwOjw0EcAZli6EEgPLWt1_LJ9U",
    authDomain: "todoist-clone-d7ffe.firebaseapp.com",
    databaseURL: "https://todoist-clone-d7ffe-default-rtdb.firebaseio.com",
    projectId: "todoist-clone-d7ffe",
    storageBucket: "todoist-clone-d7ffe.appspot.com",
    messagingSenderId: "387904439033",
    appId: "1:387904439033:web:bf5b527274913e65081828"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();