import React, { Component } from 'react';
import { Button,Badge,Modal,Container,Row,Col,Alert } from 'react-bootstrap';

import { withFirebase } from '../Firebase';
import './index.css'
const INITIAL_STATE = {
  name: '',
  email: '',
  passwordOne: '',
  error: null,
  phone:'',
  status:'active'
};
class AdminPage extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      users: [],
      show:false,
      name: '',
      email: '',
      passwordOne: '',
      error: null,
      phone:'',
      status:'active',
      showAlert:false,
      selectedUid:null
    };  
  }
 
  componentDidMount() {
    this.setState({ loading: true });
    this.callUserList()
  }
  callUserList(){
    this.props.firebase.users().on('value', snapshot => {
      const usersObject =snapshot.val();
  
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));
    this.setState({
      users: usersList,
      loading: false,
    });
  });
  }
    onSubmit = event => {
    const { name, email, passwordOne,phone,status } = this.state;
 
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            "username":name,
            "password":passwordOne,
            email,
            phone,
            status:"active",

          });
      })
      .then(authUser => {
        this.setState({ ...INITIAL_STATE,show:false });
        console.log("User Created"+JSON.stringify(authUser))
        alert("User created successfully")
      })
      .catch(error => {
        alert(error)
        this.setState({ error });
      });
 
     event.preventDefault();
  }
  componentWillUnmount() {
    this.props.firebase.users().off();
  }
  handleClose(){
    this.setState({
      show:false,
      selectedUid:null
    })
   }
   onChangeText = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  renderTableHeader() {
    let header = ['Username','Email','Phone','Status','Action']
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
 }
 delete(){  
  this.setState({
    loading:true
    })
    this.props.firebase.users().child("/"+this.state.selectedUid+"/")
    .remove()
    .then(() => 
    {  
      alert("Data successfully deleted")
      this.setState({
        show:false,
        loading:false,
        selectedUid:null,
        name:"",
        showAlert:false
      })
    }
    )
    .catch((error)=>{
        console.log(error)
        this.setState({
          show:false,
          loading:false
        })
    });
 }
 edit(id){
  const { name, email, passwordOne,phone,status } = this.state;
  this.setState({
      loading:true
  })
  this.props.firebase.users().child("/"+this.state.selectedUid+"/")
  .update({
    "username":name,
     "email": email,
      "phone":phone,
       "status" : status,
  })
  .then(() => 
  {  
    console.log("Data set")
    alert("Data successfully set")
    this.setState({
      show:false,
      loading:false,
      selectedUid:null,
      name:"",
      "email": "",
      "phone":"",
       "status" : "",
    })
  }
  )
  .catch((error)=>{
      console.log(error)
      this.setState({
        show:false,
        loading:false
      })
  });
}
  render() {
    const { users, loading } = this.state;
    return (
      <div style={{flexDirection:'column',marginLeft:20}}>
        <h1>Users</h1>
        <Button variant="primary" style={{marginLeft:20}} onClick={()=>this.setState({
          show:true
        })}>Add User</Button>{' '}
        <Alert show={this.state.showAlert} variant="danger">
            <Alert.Heading>Delete!</Alert.Heading>
            <p>
             Are you sure you want to delete ${this.state.name} ?
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.delete()} variant="outline-success">
                Yes
              </Button>
              <Button 
              onClick={() => this.setState({
                showAlert:false,
                name:"",
                selectedUid:null
                })} 
              variant="outline-success">
                No
              </Button>
            </div>
          </Alert>
        {loading && <div>Loading ...</div>}
           <table id='students'>
               <tbody>
                  <tr>{this.renderTableHeader()}</tr>
                  {this.renderTableData()}
               </tbody>
            </table>
            <Modal show={this.state.show} onHide={()=>this.handleClose()} >
            <Modal.Header closeButton>
              <Modal.Title>Add User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Container style={{alignItems:'center'}}>
            <Row>
              <Col>
                <label>Username</label>
              </Col>
              <Col>
              <input 
                          name="name"
                          value={this.state.name}
                          onChange={this.onChangeText}
                          type="text"
                          placeholder="Name"
                         
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label>Email</label>
              </Col>
              <Col>
              <input 
                          name="email"
                          value={this.state.email}
                          onChange={this.onChangeText}
                          type="text"
                          placeholder="Email"
                       
                />
              </Col>
            </Row>
            {this.state.selectedUid!=null?
            null:
            <Row>
              <Col>
                <label>Password</label>
              </Col>
              <Col>
              <input 
                          name="passwordOne"
                          value={this.state.passwordOne}
                          onChange={this.onChangeText}
                          type="password"
                          placeholder="Password"
                          
                />
              </Col>
            </Row>
            }
            <Row>
              <Col>
                <label>Phone</label>
              </Col>
              <Col>
              <input 
                          name="phone"
                          value={this.state.phone}
                          onChange={this.onChangeText}
                          type="number"
                          placeholder="Phone no."
                         
                />
              </Col>
            </Row>
            </Container>
            </Modal.Body>
            <Modal.Footer>
          <Button variant="secondary" onClick={()=>this.handleClose()}>
            Close
          </Button>
          <Button variant="primary" onClick={(event)=>this.state.selectedUid?this.edit(event):this.onSubmit(event)}>
            Save Changes
          </Button>
        </Modal.Footer>
        </Modal>
      </div>
    );
  }
  makeUserInactive(uid,string){
    this.props.firebase
          .user(uid)
          .update({
            status:string
          }).then(result=>{
           string=="Inactive"? alert("User is now inactivated"):alert("User is active now")
            this.callUserList()
          });
    
  }
  renderTableData() {
    return this.state.users.map((user, index) => {
      console.log(user)
       const { uid, username, email, phone,status } = user //destructuring
       return (
          <tr key={uid}>
             <td>{username}</td>
             <td>{email}</td>
             <td>{phone}</td>
             <td>{status=="active"?
             <Button variant="primary" style={{marginLeft:20}} onClick={()=>this.makeUserInactive(uid,"Inactive")}>Inactivate user</Button>
              :
              <Button variant="danger" style={{marginLeft:20}} onClick={()=>this.makeUserInactive(uid,"active")}>Activate</Button>
             }</td>
             <td>
               <Button variant="primary" onClick={()=>
               this.setState({  
                   selectedUid:uid,
                   show:true,
                   name:username,
                   email:email,
                   phone:phone,
                   status:status 
                   })} 
                  style={{marginRight:10}}>
                  Edit
                  </Button>
               <Button variant="danger" onClick={()=>
                  this.setState({
                    selectedUid:uid,
                    name:username,
                    showAlert:true
                  })
               }>Delete</Button>
             </td>

          </tr>
       )
    })
 }

}



export default withFirebase(AdminPage);