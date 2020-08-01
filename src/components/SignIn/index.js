import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { SignUpLink } from '../SignUp';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';
import { PasswordForgetLink } from '../PasswordForget';
import './styles.css'
import { auth } from 'firebase';
 
const SignInPage = () => (
  <div style={{
   display:'flex',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "	#376b8c",
    flexDirection:'column',
    flex:1,
    
  }}>
    <h1>SignIn</h1>
    <SignInForm />
    <SignUpLink />
    <PasswordForgetLink />
  </div>
);
 
const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};
 
class SignInFormBase extends Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }
 
  onSubmit = event => {
    const { email, password } = this.state;
 
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then((authUser) => {
        console.log(authUser.user.uid)
        this.props.firebase.users().child("/"+authUser.user.uid).once('value').then((snapshot)=>{
          console.log(snapshot.val() && snapshot.val())
          if(snapshot.val().status=="Inactive"){
            alert("User is Inactivated by Admin")
          }
          else{
            this.setState({ ...INITIAL_STATE });
            this.props.history.push(ROUTES.ADMIN);
          }
        })
        
      })
      .catch(error => {
        this.setState({ error });
      });
 
    event.preventDefault();
  };
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
 
  render() {
    const { email, password, error } = this.state;
 
    const isInvalid = password === '' || email === '';
 
    return (
   
      <form onSubmit={this.onSubmit}>
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <button disabled={isInvalid} type="submit">
          Sign In
        </button>
 
        {error && <p>{error.message}</p>}
      </form>
   
    );
  }
}
 
const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);
 
export default SignInPage;
 
export { SignInForm };