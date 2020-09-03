import * as firebase from "firebase/app";

import "firebase/performance";

var firebaseConfig = require('./../../config/firebase.json');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Performance Monitoring and get a reference to the service
firebase.performance();