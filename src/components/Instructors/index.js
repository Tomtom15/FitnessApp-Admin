import React, { Component } from 'react';
import { Button,Badge,Modal,Container,Row,Col,Image,
Alert } from 'react-bootstrap';
import TimePicker from 'react-time-picker';
import {storage} from 'firebase'
import { withFirebase } from '../Firebase';
import './index.css'
class Instructor extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      instructors: [],
      show:false,
      name:"",
      address:"",
      latitude:0.0,
      longitude:0.0,
      selectedUid:null,
      showAlert:false,
      avatar:"",
      from_time:'',
      to_time:'',
      phone:""
    };
  }
 
  componentDidMount() {
    this.setState({ loading: true });
 
    this.props.firebase.instructors().on('value', snapshot => {
        const instructorObject =snapshot.val();
    
        const instructorList = instructorObject && Object.keys(instructorObject).map(key => ({
          ...instructorObject[key],
          id:key
        }));
      this.setState({
        instructors: instructorList,
        loading: false,
      });
    });
  }
  validation(){
          
    if(this.state.name==""){
      alert("Please enter name")
    }else if(this.state.address==""){
      alert("Please enter address")
    }else if(this.state.latitude==""){
      alert("Please enter Latitude")
    }else if(this.state.longitude==""){
      alert("Please enter longitude")
    }else if(this.state.from_time==""){
      alert("Please enter from time")
    }else if(this.state.to_time==""){
      alert("Please enter to_time")
    }else if(this.state.phone==""){
      alert("Please enter phone")
    }
    else{
      this.state.selectedUid?
      this.edit():
      this.writeUserData()
    }
   
  }
  writeUserData(){
    const{name,address,latitude,longitude,from_time,to_time,phone}=this.state
  
    this.setState({
        loading:true
    })
    this.props.firebase.instructors()
    .push({
      name:name,
      address:address,
      latitude:latitude,
      longitude:longitude,
      avatar:this.state.avatar,
      from_time:from_time,
      to_time:to_time,
      phone:phone
    })
    .then(() => 
    {  
      console.log("Data set")
      alert("Data successfully set")
      this.setState({
        show:false,
        loading:false
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
    this.props.firebase.instructors().off();
  }
  renderTableHeader() {
    let header = ['Avatar','Name','Address','Latitude','Longitude','Availability','Phone','Action']
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
 }
 handleClose(){
  this.setState({
    show:false
  })
 }
 onChange = event => {
  this.setState({ [event.target.name]: event.target.value });
};
onChangeTime = (time,fromTo) => 
{
  fromTo=='from'?this.setState({ from_time:time}):this.setState({to_time:time})
}
delete(){
 
  this.setState({
      loading:true
  })
  this.props.firebase.instructors().child("/"+this.state.selectedUid+"/")
  .remove()
  .then(() => 
  {  
    alert("Data successfully deleted")
    this.setState({
      show:false,
      loading:false,
      selectedUid:null,
      name:"",
      showAlert:false,
      address:"",
      latitude:0.0,
      longitude:0.0,
      avatar:"",
      from_time:'',
      to_time:'',
      phone:""
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
edit(){
  const{name,address,latitude,longitude,avatar,from_time,to_time,phone}=this.state
  this.setState({
      loading:true
  })
  this.props.firebase.instructors().child("/"+this.state.selectedUid+"/")
  .update({
      name:name,
      address:address,
      latitude:latitude,
      longitude:longitude,
      avatar:avatar,
      from_time:from_time,
      to_time:to_time,
      phone:phone
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
      address:"",
      latitude:0.0,
      longitude:0.0,
      avatar:"",
      from_time:'',
      to_time:'',
      phone:'',
      progress: 0
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
fileChangedHandler = (event) => {
  this.setState({ uri: URL.createObjectURL(event.target.files[0]) })
  this.handleUpload(event.target.files[0])
}
handleUpload = (image) => {

  const uploadTask = this.props.firebase.images().child(`/${image.name}`).put(image);
  uploadTask.on(
    "state_changed",
    snapshot => {
      // progress function ...
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      this.setState({ progress });
    },
    error => {
      // Error function ...
      console.log(error);
    },
    () => {
      // complete function ...
      this.props.firebase.images()
        .child(image.name)
        .getDownloadURL()
        .then(url => {
          this.setState({ "avatar":url });
        });
    }
  );
};
 render() {
    const { users, loading } = this.state;
    return (
      <div style={{flexDirection:'column',marginLeft:20}}>
        <h1>Instructor</h1>
        
        <Button variant="primary" style={{marginLeft:20}} onClick={()=>this.setState({
          show:true
        })}>Add Instructor</Button>{' '}
         <Alert show={this.state.showAlert} variant="danger">
            <Alert.Heading>Delete!</Alert.Heading>
            <p>
             Are you sure you want to delete ${this.state.name} ?
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.delete(false)} variant="outline-success">
                Yes
              </Button>
              <Button 
              onClick={() => this.setState({
                showAlert:false,
                name:"",
                selectedUid:null,
                address:"",
                latitude:0.0,
                longitude:0.0,
                phone:""
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
          <Modal.Title>Add Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <Container style={{alignItems:'center'}}>
         {this.state.progress!=0 ?
        <div className="center">
          <progress value={this.state.progress} max="100" className="progress" style={{marginBottom:10}}/>
        </div>
        :null
         }
           <div className="center">
              <Image src={this.state.avatar?this.state.avatar:require('../../assets/image_placeholder.png')} roundedCircle style={{height:50,width:50}}/>
            </div>
            <div className='center'>
              <input type="file" onChange={this.fileChangedHandler} accept="image/*"/>
           </div>
         <Row>
         <Col>
         <label>Name:</label>
         </Col>
         <Col>
         <input
            name="name"
            value={this.state.name}
            onChange={this.onChange}
            type="text"
            placeholder="Name"
           />
         </Col>           
         </Row>
         <Row>
         <Col>
         <label>Address:</label>
         </Col>
         <Col>
         <textarea
            name="address"
            value={this.state.address}
            onChange={this.onChange}
            type="textarea"
            placeholder="Address"
           />
         </Col>           
         </Row>
         <Row>
         <Col>
         <label>Latitude:</label>
         </Col>
         <Col>
         <input
            name="latitude"
            value={this.state.latitude}
            onChange={this.onChange}
            type="number"
            step={0.000001}
            placeholder="Latitude"
           />
         </Col>           
         </Row>
         <Row>
         <Col>
         <label>Longitude:</label>
         </Col>
         <Col>
         <input
            name="longitude"
            value={this.state.longitude}
            onChange={this.onChange}
            type="number"
            step={0.000001}
            placeholder="Longitude"
           />
         </Col>           
         </Row>
         <Row>
         <Col>
         <label>Availability</label>
         </Col>
         <Col>
         <TimePicker
          onChange={(time)=>this.onChangeTime(time,'from')}
          value={this.state.from_time}
        />
        <TimePicker
          onChange={(time)=>this.onChangeTime(time,'to')}
          value={this.state.to_time}
        />
         </Col>           
         </Row>
         <Row>
         <Col>
         <label>Phone</label>
         </Col>
         <Col>
         <input
            name="phone"
            value={this.state.phone}
            onChange={this.onChange}
            type="tel"
            placeholder="Phone"
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
  renderTableData() {
    return this.state.instructors && this.state.instructors.map((instructor, index) => {
       const { id,name,address,latitude,longitude,avatar,from_time,to_time,phone } = instructor //destructuring
       let time = (from_time && to_time)?from_time +" to "+to_time:""
       console.log(instructor)
       return (
          <tr key={id}>
            <td>
              <Image src={instructor.avatar?instructor.avatar:require('../../assets/image_placeholder.png')} roundedCircle style={{height:20,width:20}}/>
            </td>
             <td>{name}</td>
             <td>{address}</td>
             <td>{latitude}</td>
             <td>{longitude}</td>
             <td>{time}</td>
             <td>{phone}</td>
             <td>
               <Button variant="primary" onClick={()=>
               this.setState({  
                   selectedUid:id,
                   show:true,
                   name:name,
                   address:address,
                   latitude:latitude,
                   longitude:longitude,
                   avatar:avatar,
                   from_time:from_time,
                   to_time:to_time,
                   phone:phone
                   })} 
                  style={{marginRight:10}}>
                  Edit
                  </Button>
               <Button variant="danger" onClick={()=>
                  this.setState({
                    selectedUid:id,
                    name:instructor.name,
                    showAlert:true
                  })
               }>Delete</Button>
             </td>
          </tr>
       )
    })
 }

}



export default withFirebase(Instructor);