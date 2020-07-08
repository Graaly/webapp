import firebase from 'firebase'

export default async () => {
    const config = {
        apiKey: "AIzaSyBOgzVQy-D0qdSO51VTrE5YcyfzOpGHPkw",
        authDomain: "graalytest.firebaseapp.com",
        databaseURL: "https://graalytest.firebaseio.com",
        projectId: "graalytest",
        storageBucket: "graalytest.appspot.com",
        messagingSenderId: "434384274642",
        appId: "1:434384274642:web:459bad77bf408c09e6d90b"
    };
    firebase.initializeApp(config);
    // Validation that our service structure is working
    // with a firebase app instance. Does not validate a
    // valid API key.
    console.log(firebase.auth())
}