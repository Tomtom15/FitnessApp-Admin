import React, { Component } from 'react';
import { Button,Badge,Modal,Container,Row,Col,Alert,Image } from 'react-bootstrap';
import { withFirebase } from '../Firebase';
import './index.css'
class Meals extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      show:false,

      instructors: [],
      name:"",
      address:"",
      latitude:0.0,
      longitude:0.0,
      meals:[],
      showAlert:false,
     meal_content:{
       breakfast:[],
       lunch:[],
       dinner:[],
       selectedUid:null,
     },
     meal_plan_title:"",
     progress:0
    };
  }
 
  componentDidMount() {
    this.setState({ loading: true });
 
    this.props.firebase.meals().on('value', snapshot => {
        const mealsObj =snapshot.val();
    
        const mealList =mealsObj && Object.keys(mealsObj).map(key => ({
          ...mealsObj[key],
          id:key
        }));
      this.setState({
        meals: mealList,
        loading: false,
      });
    });
  }
  refreshData(){
    this.props.firebase.meals().on('value', snapshot => {
      const mealsObj =snapshot.val();
  
      const mealList =mealsObj && Object.keys(mealsObj).map(key => ({
        ...mealsObj[key],
        id:key
      }));
    this.setState({
      meals: mealList,
      loading: false,
    });
  });
  }
  validation(){
    (this.state.selectedUid)?
    this.editData():
   this.writeUserData()
  
  }
  editData(id){
    const{meal_content,meal_plan_title}=this.state
  
    this.setState({
        loading:true
    })
    this.props.firebase.meals().child("/"+this.state.selectedUid+"/")
    .update({
      label:meal_plan_title,
      ingredients:meal_content
    })
    .then(() => 
    {  
      console.log("Data set")
      alert("Data successfully edited")
      this.setState({
        show:false,
        loading:false,
        selectedUid:null,
        meal_plan_title:""
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
  writeUserData(){
    const{meal_content}=this.state
 
    this.setState({
        loading:true
    })
    this.props.firebase.meals()
    .push({
      label:this.state.meal_plan_title,
      ingredients:meal_content
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
    this.props.firebase.users().off();
  }
  renderTableHeader() {
    let header = ['Picture','Quantity','Name','Calories']
    return header.map((key, index) => {
       return <th key={index}>{key.toUpperCase()}</th>
    })
 }
 handleClose(){
  this.setState({
    show:false
  })
  this.refreshData()
 }
 onChange = event => {
  this.setState({ [event.target.name]: event.target.value });
};
handleUpload = (event,index,type,key) => {
let image = event.target.files[0]
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
       //   this.setState({ "avatar":url });
          this.onChangeText(event,index,type,key,url)
        });
    }
  );
};
onAddRow=(item)=>{
  //item =0-> breakfast, 1=> lunch, 2=> dinner
  let obj = {
    quantity:"",
    name:"",
    calories:""
  }
  if(item==0){
    let meal_content=this.state.meal_content
    let breakfast = meal_content.breakfast?meal_content.breakfast:[]
    breakfast.push(obj)
    meal_content.breakfast=breakfast
    this.setState({
      meal_content:meal_content
    })
    console.log(meal_content)
  }else if(item==1){
    let meal_content=this.state.meal_content
    let lunch = meal_content.lunch?meal_content.lunch:[]
    lunch.push(obj)
    meal_content.lunch=lunch
    this.setState({
      meal_content:meal_content
    })
  }else if(item==2){
    let meal_content=this.state.meal_content
    let dinner = meal_content.dinner?meal_content.dinner:[]
    dinner.push(obj)
    meal_content.dinner=dinner
    this.setState({
      meal_content:meal_content
    })
  }
}
onChangeText=(event,index,type,key,url)=>{
 
  let meal_content = this.state.meal_content
 let ingredients=  meal_content[type]
 let obj = ingredients[index]
 let new_obj = Object.assign({}, obj, { [key]: key=="avatar"?url:event.target.value })

 meal_content[type][index]=new_obj
 console.log(meal_content)
 this.setState({
     meal_content:meal_content
 })

}
delete(){
  this.setState({
      loading:true
  })
  this.props.firebase.meals().child("/"+this.state.selectedUid+"/")
  .remove()
  .then(() => 
  {  
    alert("Data successfully deleted")
    this.setState({
      show:false,
      loading:false,
      selectedUid:null,
      meal_plan_title:"",
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
 render() {
    const { users, loading,meal_content } = this.state;
    return (
      <div style={{flexDirection:'column',marginLeft:20}}>
        <h1>Meals</h1>
        <Button variant="primary" style={{marginLeft:20}} onClick={()=>this.setState({
          show:true
        })}>Add a Meal Plan</Button>{' '}
        <Alert show={this.state.showAlert} variant="danger">
            <Alert.Heading>Delete!</Alert.Heading>
            <p>
             Are you sure you want to delete ${this.state.meal_plan_title} ?
            </p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button onClick={() => this.delete(false)} variant="outline-success">
                Yes
              </Button>
              <Button 
              onClick={() => this.setState({
                showAlert:false,
                meal_plan_title:"",
                selectedUid:null
                })} 
              variant="outline-success">
                No
              </Button>
            </div>
          </Alert>
        {loading && <div>Loading ...</div>}
        {
          this.state.meals && this.state.meals.map((meal,index)=>{
            console.log(meal)
            return(
              <div key={index}>
              <Row style={{marginTop:10}}>
              <Col>
                <h1>{meal.label}</h1>
              </Col>
              <Col>
              
               <Button variant="primary" onClick={()=>
               this.setState({  
                   selectedUid:meal.id,
                   show:true,
                   meal_plan_title:meal.label,
                   meal_content: meal.ingredients
                   })} 
                  style={{marginRight:10}}>
                  Edit
                  </Button>
               <Button variant="danger" onClick={()=>
                  this.setState({
                    selectedUid:meal.id,
                    meal_plan_title:meal.label,
                    showAlert:true
                  })
               }>Delete</Button>
             
              </Col>
              </Row>
                
                <label>Breakfast</label>
                <table id='students'>
                <tbody>
                    <tr>{this.renderTableHeader()}</tr>
                    {meal.ingredients && meal.ingredients.breakfast?this.renderTableData(meal.ingredients.breakfast):null}
                </tbody>
              </table>
              <label>Lunch</label>
                <table id='students'>
                <tbody>
                    <tr>{this.renderTableHeader()}</tr>
                    {meal.ingredients && meal.ingredients.lunch?this.renderTableData(meal.ingredients.lunch):null}
                </tbody>
                </table>
                <label>Dinner</label>
                <table id='students'>
                <tbody>
                    <tr>{this.renderTableHeader()}</tr>
                    {meal.ingredients && meal.ingredients.dinner?this.renderTableData(meal.ingredients.dinner):null}
                </tbody>
                </table>
             </div>
            )   
          })
        }
        
        <Modal show={this.state.show} onHide={()=>this.handleClose()} >
        <Modal.Header closeButton>
          <Modal.Title>Add a Meal Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
         <Container style={{alignItems:'center'}}>
         <Row>
           <Col>
              <label>Title</label>
           </Col>
           <Col>
           <input 
                          name="meal_plan_title"
                          value={this.state.meal_plan_title}
                          onChange={this.onChange}
                          type="text"
                          placeholder="Meal Plan Title"
           />
           </Col>
         </Row>
         <h3>Breakfast</h3>
         <table id='students'>
               <tbody>
                  <tr>{this.renderTableHeader()}</tr>               
                  {
                    meal_content.breakfast && meal_content.breakfast.map((source,index)=>{
                      return(
                    <tr>
                   
                    <div className="center">
                      <Image src={source.avatar?source.avatar:require('../../assets/image_placeholder.png')} roundedCircle style={{height:50,width:50}}/>
                    </div>
                    <div className='center'>
                        <input type="file" onChange={
                          (event)=>
                          this.handleUpload(event,index,"breakfast","avatar")
                        } 
                        accept="image/*"/>
                    </div>
                      <td>
                        <input 
                          name="quantity"
                          value={source.quantity}
                          onChange={(event)=>this.onChangeText(event,index,"breakfast","quantity")}
                          type="text"
                          placeholder="Quantity"
                        />
                        </td>
                        <td>
                          <input 
                          name="name"
                          value={source.name}
                          onChange={(text)=>this.onChangeText(text,index,"breakfast","name")}
                          type="text"
                          placeholder="Name"
                        />
                        </td>
                        <td>
                          <input 
                          name="calories"
                          value={source.calories}
                          onChange={(text)=>this.onChangeText(text,index,"breakfast","calories")}
                          type="number"
                          placeholder="0.0"
                        />
                        </td>
                     </tr>
                      )
                    })
                  }
               </tbody>
        </table>
         <Button variant="primary" size="lg" block onClick={()=>this.onAddRow(0)} style={{marginVertical:10}}>
          Add a Breakfast item
        </Button>
        <h3>Lunch</h3>
         <table id='students'>
               <tbody>
                  <tr>{this.renderTableHeader()}</tr>               
                  {
                    meal_content.lunch && meal_content.lunch.map((source,index)=>{
                      return(
                    <tr>
                    <div className="center">
                      <Image src={source.avatar?source.avatar:require('../../assets/image_placeholder.png')} roundedCircle style={{height:50,width:50}}/>
                    </div>
                    <div className='center'>
                        <input type="file" onChange={(event)=>
                        this.handleUpload(event,index,"lunch","avatar")
                        } accept="image/*"/>
                    </div>
                      <td>
                        <input 
                          name="quantity"
                          value={source.quantity}
                          onChange={(event)=>this.onChangeText(event,index,"lunch","quantity")}
                          type="text"
                          placeholder="Quantity"
                        />
                        </td>
                        <td>
                          <input 
                          name="name"
                          value={source.name}
                          onChange={(text)=>this.onChangeText(text,index,"lunch","name")}
                          type="text"
                          placeholder="Name"
                        />
                        </td>
                        <td>
                          <input 
                          name="calories"
                          value={source.calories}
                          onChange={(text)=>this.onChangeText(text,index,"lunch","calories")}
                          type="number"
                          placeholder="0.0"
                        />
                        </td>
                     </tr>
                      )
                    })
                  }
               </tbody>
        </table>
         <Button variant="primary" size="lg" block onClick={()=>this.onAddRow(1)} style={{marginVertical:10}}>
          Add a Lunch item
        </Button>
        <h3>Dinner</h3>
         <table id='students'>
               <tbody>
                  <tr>{this.renderTableHeader()}</tr>               
                  {
                    meal_content.dinner && meal_content.dinner.map((source,index)=>{
                      return(
                    <tr>
                    <div className="center">
                      <Image src={source.avatar?source.avatar:require('../../assets/image_placeholder.png')} roundedCircle style={{height:50,width:50}}/>
                    </div>
                    <div className='center'>
                        <input type="file" onChange={(event)=>
                        this.handleUpload(event,index,"dinner","avatar")
                        } accept="image/*"/>
                    </div>
                      <td>
                        <input 
                          name="quantity"
                          value={source.quantity}
                          onChange={(event)=>this.onChangeText(event,index,"dinner","quantity")}
                          type="text"
                          placeholder="Quantity"
                        />
                        </td>
                        <td>
                          <input 
                          name="name"
                          value={source.name}
                          onChange={(text)=>this.onChangeText(text,index,"dinner","name")}
                          type="text"
                          placeholder="Name"
                        />
                        </td>
                        <td>
                          <input 
                          name="calories"
                          value={source.calories}
                          onChange={(text)=>this.onChangeText(text,index,"dinner","calories")}
                          type="number"
                          placeholder="0.0"
                        />
                        </td>
                     </tr>
                      )
                    })
                  }
               </tbody>
        </table>
         <Button variant="primary" size="lg" block onClick={()=>this.onAddRow(2)} style={{marginVertical:10}}>
          Add a Dinner item
        </Button>
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
  fileChangedHandler = (event) => {
    this.setState({ avatar: URL.createObjectURL(event.target.files[0]) })
  }
  renderTableData(ar_ingredients) {
 console.log(ar_ingredients)
    return ar_ingredients && ar_ingredients.map((meal, index) => {
       const { quantity,name,calories } = meal //destructuring
    
       return (
          <tr key={index}>
           <td>
              <Image src={meal.avatar?meal.avatar:require('../../assets/placeholder_meal.jpg')} roundedCircle style={{height:50,width:50}}/>
            </td>
            
             <td>{quantity}</td>
             <td>{name}</td>
             <td>{calories}</td>
          </tr>
       )
    })
 }
}



export default withFirebase(Meals);