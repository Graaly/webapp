import firebase from 'firebase/app';

import "firebase/performance";

var firebaseConfig = require('./../../config/firebase.json');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);