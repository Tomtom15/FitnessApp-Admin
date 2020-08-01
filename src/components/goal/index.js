import React, { Component } from 'react';
import { Button,Badge,Modal,Container,Row,Col,Alert } from 'react-bootstrap';
import { withFirebase } from '../Firebase';
import './index.css'
class Goal extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      goals: [],
      show:false,
      goal_name:"",
      showAlert:false
    };
  }
 
  componentDidMount() {
    this.setState({ loading: true });
 
    this.props.firebase.goals().on('value', snapshot => {
        const goalObj =snapshot.val();
    
        const goalList = goalObj &&  Object.keys(goalObj).map(key => ({
          ...goalObj[key],
          id:key
        }));
      this.setState({
        goals: goalList,
        loading: false,
      });
    });
  }
  validation(){
          
    if(this.state.goal_name==""){
      alert("Please enter name")
    }else{
      this.state.selectedUid?
      this.editGoal():
      this.writeUserData()
    }
   
  }
  writeUserData(){
    const{goal_name}=this.state
  
    this.setState({
        loading:true
    })
    this.props.firebase.goals()
    .push({
      value:goal_name,
      label:goal_name,
    })
    .then(() => 
    {  
      console.log("Data set")
      alert("Data successfully set")
      this.setState({
        show:false,
        loading:false,
        goal_name:""
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
  componentWillUnmount() {
    this.props.firebase.goals().off();
  }
  renderTableHeader() {
    let header = ['ID','Goal','Action']
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
 }
 handleClose(){
  this.setState({
    show:false,
    selectedUid:null
  })
 }
 onChange = event => {
  this.setState({ [event.target.name]: event.target.value });
};
 render() {
    const { users, loading } = this.state;
    return (
      <div style={{flexDirection:'column',marginLeft:20}}>
        <h1>Goals</h1>
        <Button variant="primary" style={{marginLeft:20}} onClick={()=>this.setState({
          show:true
        })}>Add Goal</Button>{' '}
        <Alert show={this.state.showAlert} variant="danger">
            <Alert.Heading>Delete!</Alert.Heading>
            <p>
             Are you sure you want to delete ${this.state.goal_name} ?
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.deleteGoal(false)} variant="outline-success">
                Yes
              </Button>
              <Button 
              onClick={() => this.setState({
                showAlert:false,
                goal_name:"",
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
        <Modal show={this.state.show} onHide={()=>this.handleClose()}>
        <Modal.Header closeButton>
          <Modal.Title>Add Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <Container style={{alignItems:'center'}}>
         <Row>
         <Col>
         <label>Goal Name:</label>
         </Col>
         <Col>
         <input
            name="goal_name"
            value={this.state.goal_name}
            onChange={this.onChange}
            type="text"
            placeholder="Goal"
           />
         </Col>           
         </Row>
        
        </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>this.handleClose()}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>this.validation()}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      
        
      
      </div>
    );
  }
  editGoal(id){
    const{goal_name}=this.state
  
    this.setState({
        loading:true
    })
    this.props.firebase.goals().child("/"+this.state.selectedUid+"/")
    .update({
      value:goal_name,
      label:goal_name,
    })
    .then(() => 
    {  
      console.log("Data set")
      alert("Data successfully set")
      this.setState({
        show:false,
        loading:false,
        selectedUid:null,
        goal_name:""
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
  deleteGoal(id){
    const{goal_name}=this.state
  
    this.setState({
        loading:true
    })
    this.props.firebase.goals().child("/"+this.state.selectedUid+"/")
    .remove()
    .then(() => 
    {  
      alert("Data successfully deleted")
      this.setState({
        show:false,
        loading:false,
        selectedUid:null,
        goal_name:"",
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
  renderTableData() {
    return this.state.goals && this.state.goals.map((goal, index) => {
       const { id,value } = goal //destructuring
       return (
          <tr key={id}>
            <td>{id}</td>
             <td>{value}</td>
             <td>
               <Button variant="primary" onClick={()=>
               this.setState({  
                   selectedUid:id,
                   show:true,
                   goal_name:value 
                   })} 
                  style={{marginRight:10}}>
                  Edit
                  </Button>
               <Button variant="danger" onClick={()=>
                  this.setState({
                    selectedUid:id,
                    goal_name:value,
                    showAlert:true
                  })
               }>Delete</Button>
             </td>
          </tr>
       )
    })
 }

}



export default withFirebase(Goal);