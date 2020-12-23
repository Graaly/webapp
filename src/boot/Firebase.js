import firebase from 'firebase/app';

var firebaseConfig = require('./../../config/firebase.json');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);