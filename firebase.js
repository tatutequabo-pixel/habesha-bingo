const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "habeshabingo.firebaseapp.com",
  databaseURL: "https://habeshabingo-default-rtdb.firebaseio.com",
  projectId: "habeshabingo",
  storageBucket: "habeshabingo.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

module.exports = { db };


