import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage'

  const config = {
    apiKey: "AIzaSyBSmSnzQJSgHx58WkvZz1S2L0cwQ5rGzEw",
    authDomain: "fitness-app-bc473.firebaseapp.com",
    databaseURL: "https://fitness-app-bc473.firebaseio.com",
    projectId: "fitness-app-bc473",
    storageBucket: "fitness-app-bc473.appspot.com",
    messagingSenderId: "454047416239",
    appId: "1:454047416239:web:ed71ba940e90ec3d9db95a",
    measurementId: "G-1GJYHFLRJE"
  };
  class Firebase {
    constructor() {
      app.initializeApp(config);
      this.auth = app.auth();
      this.db = app.database();
      this.storage= app.storage();
    }
  // *** Auth API ***
 
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();
  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
 
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
    
  user = uid => this.db.ref(`users/${uid}`);
 
  users = () => this.db.ref('users');

  disableUser = uid => this.auth.updateUser(uid, {
    disabled: true
});

 instructors=()=>this.db.ref('instructors');
 meals=()=>this.db.ref('meals');
 goals=()=>this.db.ref('goals');
 images=()=>this.storage.ref('images');
  }

  
  export default Firebase;