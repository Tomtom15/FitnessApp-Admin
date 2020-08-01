import React from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut';
import * as ROUTES from '../constants/routes';
import { AuthUserContext } from '../Session';

const Navigation = () => (
  <div>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  </div>
);
const NavigationAuth = () => (
  <div style={{flex:1,flexDirection:"row",backgroundColor:"black",display:'flex',justifyContent: "center",
  alignItems: "center",paddingTop:20,paddingBottom:20}}>
  
      <Link to={ROUTES.ADMIN} style={{marginRight:20,color:'white'}}>Users</Link>
      <Link to={ROUTES.ACCOUNT} style={{marginRight:20,color:'white'}}>Account</Link>   
      <Link to={ROUTES.INSTRUCTORS} style={{marginRight:20,color:'white'}}>Instructor</Link>
      <Link to={ROUTES.MEALS} style={{marginRight:20,color:'white'}}>Meals</Link>
      <Link to={ROUTES.GOALS} style={{marginRight:20,color:'white'}}>Goals</Link>
      <Link to={ROUTES.SIGN_IN}><SignOutButton style={{marginRight:20}} /></Link>
    
  </div>
);
const NavigationNonAuth = () => (
  <div style={{flex:1,flexDirection:"row",backgroundColor:"black",display:'flex',justifyContent: "center",
  alignItems: "center",paddingTop:20,paddingBottom:20}}>

      <Link to={ROUTES.SIGN_IN} style={{marginRight:20,color:'white'}}>Sign In</Link>
      <Link to={ROUTES.SIGN_UP} style={{marginRight:20,color:'white'}}>Sign Up</Link>
      <Link to={ROUTES.PASSWORD_FORGET} style={{marginRight:20,color:'white'}}>Forgot Password</Link>
  
  </div>
);
 
export default Navigation;