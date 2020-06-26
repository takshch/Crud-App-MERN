import React from 'react';
// import ReactDOM from 'react-dom';
import './App.css';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FlipMove  from 'react-flip-move';

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {listData: [],
                  tempListData: [],
                  isListLoading: true,
                  errorMessage: "",
                  message: "",
                  messageClass: "",
                  currentPrice: null,
                  currentName: "",
                  prevPrice: null
                };
    this.fetchList = this.fetchList.bind(this);
    this.messageNull = this.messageNull.bind(this);
  }
  async fetchList(){
    try{
      const url = "/api/items";
      const response = await fetch(url);
      let data = await response.json();
      this.setState({listData: data},()=>{
        this.setState({isListLoading: false});
      });
    }catch(error){
      this.setState({errorMessage: "Unable to fetch data",isListLoading: false});
    }  
  }
  async componentDidMount(){
    this.fetchList();
  }
  
  async iconTouchClick(e){  
    let id = e.target.parentNode.parentNode.parentNode.getAttribute("data-id");
    if(id === null)
      id = e.target.parentNode.getAttribute("data-id");
    let postBody = JSON.stringify({ id: parseInt(id)});
    console.log(id);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: postBody
    };
    try{
      const response = await fetch('/api/delete', requestOptions)
      let data = await response.json();
      console.log("data:",data);
      if(data['status'] === "deleted" && data['error'] === null){
        this.setState({message: "Successfully deleted the item",messageClass: "success"});
      }else if(data['error']){
        this.setState({message: data['error'],messageClass: "dark"});
      }
    }catch(error){
      console.log(error);
      this.setState({message: "Can't detete items",messageClass: "dark"});
    }
    this.fetchList();
    this.messageNull(10000);
  }


  async addItem(e){
    let parent = e.target.parentNode.childNodes;
    let name = parent[0].childNodes[0].value;
    let price  = parent[1].childNodes[0].value;
    // console.log("parent:",parent);
    console.log(`name: ${name}, price: ${price}`);
    console.log(`name: ${name}, price: ${price}`);
    if(name !== "" && price !== "" && !isNaN(price)){
      let postBody  = JSON.stringify({name,price: parseInt(price)});
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: postBody
      };
      try{
        const response = await fetch('/api/add', requestOptions)
        let data = await response.json();
        console.log("data:",data);
        if(data['status'] === "success" && data['error'] === null){
          this.setState({message: "Successfully deleted the item",messageClass: "success"});
        }else if(data['error']){
          this.setState({message: data['error'],messageClass: "dark"});
        }
      }catch(error){
        console.log(error);
        this.setState({message: "Can't add item",messageClass: "dark"});
      }
      this.fetchList();
      this.messageNull(10000);
    }else if(name === "" || price === "" || name === undefined || price === undefined || isNaN(price)){
      this.setState({message: "name and price can't be empty or price must be number",messageClass: "dark"});
    }else{
      this.setState({message: "price",messageClass: "dark"});
    }
    this.messageNull(10000);
  }


  async updateItem(price,id){
    let postBody  = JSON.stringify({price: parseInt(price),id: parseInt(id)});
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: postBody
    };
    try{
      const response = await fetch('/api/update', requestOptions)
      let data = await response.json();
      console.log("data:",data);
      if(data['status'] === "success" && data['error'] === null){
        this.setState({message: "Successfully updated the item",messageClass: "success"});
      }else if(data['error']){
        this.setState({message: data['error'],messageClass: "dark"});
      }
    }catch(error){
      console.log(error);
      this.setState({message: "Can't update item",messageClass: "dark"});
    }
    this.fetchList();
    this.messageNull(10000);
  }

  messageNull(sec = 2000){
    setTimeout(()=>{
      this.setState({message: "",messageClass: ""});
    },parseInt(sec));
  }

  setCurrentName(e){
    this.setState({currentName: e.target.value});
  }

  setCurrentPrice(e){
    console.log("e:",isNaN(e.target.value));
    if(isNaN(e.target.value)){
      this.setState({message: "Price must be number",messageClass: "dark"});
      e.target.setAttribute("value","");
      this.messageNull();
    }else{
      this.setState({currentPrice: parseInt(e.target.value)});
    }
  }

  parFocus(val){
    if(val.target.innerText !== "" && !isNaN(val.target.innerText)){
      this.setState({prevPrice: parseInt(val.target.innerText)});
      console.log("focus:",val.target.innerText);
    }
  }

  parBlur(e){
    let id = e.target.parentNode.getAttribute("data-id");
    let value = e.target.innerText;
    console.log(value);
    if(value === "" && this.state.prevPrice !== null){
      console.log("okay");
      e.target.innerText = value;
      this.setState({prevPrice: null});      
    }else if(!isNaN(value) && value !== "" && id !== "" && !isNaN(id)){
      this.updateItem(parseInt(value),parseInt(id));
    }
  }
  
  parPriceChange(e){
    console.log("par");
    let price = e.target.innerText;
    if(price !== "" && isNaN(price) && this.state.prevPrice !== ""){
      this.setState({message: "Price must be number",messageClass: "dark"});
      e.target.innerText = this.state.prevPrice;
      this.messageNull();
    }else{

      this.setState({currentPrice: parseInt(price)});
    }
  }


  render(){
    console.log(this.state.listData);
    let wrapperList;
    if(Array.isArray(this.state.listData) && this.state.listData.length !== 0){
      wrapperList = this.state.listData.map((val)=>{  
        return (<React.Fragment>
          <FlipMove typeName={null}>
            <WrappedList key={val.id} data-id={val.id}>
              <span>{val.name}</span>
              <p contentEditable="true"
                onClick={this.parFocus.bind(this)}
                onFocus={this.parFocus.bind(this)}
                onBlur={this.parBlur.bind(this)}
              onChange={this.parPriceChange.bind(this)}
              onKeyPress={this.parPriceChange.bind(this)}>{val.price}</p>
              <span className="btn" onTouch={this.iconTouchClick.bind(this)}
               onClick={this.iconTouchClick.bind(this)}>
                <FontAwesomeIcon  icon={faTrash} color="#fcbf49"/></span>
            </WrappedList>
          </FlipMove>
        </React.Fragment>);
      });
    }else wrapperList = <h4 className="text-center">There is no data</h4>;

    return (<React.Fragment>
      <Container fluid>
          <Row style={{"min-height": "100vh"}}>
            <Col lg="8" className="p-0">
              <ColOutWrapper className="d-flex justify-content-center">
                 <ColInnerWrapper>
                  <h4 className="text-center">CRUD APPLICATION</h4>
                  <AddWrapper>
                    <div>
                      <input type="text" placeholder="Product name"
                        onChange={this.setCurrentName.bind(this)}/>
                    </div>
                    <div>
                      <input type="text" placeholder="Price"
                        onChange={this.setCurrentPrice.bind(this)}/>
                    </div>
                    <button className="btn" onClick={this.addItem.bind(this)}>Add</button>
                  </AddWrapper>
                  <div>
        {this.state.message !== "" ? <Alert variant={this.state.messageClass}>{this.state.message}</Alert> : ""}
                    {this.state.errorMessage !== "" ? <h4 className="text-center">{this.state.errorMessage}</h4>: ""}
                    {this.state.isListLoading ? <h4 className="text-center">Loading....</h4> : wrapperList}
                  <p style={{"font-size":"1.05rem","color":"#000"}} className="mt-4">Note: To update the price, click on price and change the value and  <br />then click on blue background.</p>
                  </div>
                 </ColInnerWrapper>
              </ColOutWrapper>
            </Col>
            <Col lg="4" className="p-0">
              <APIStory>
                <h4>API ENDPOINTS:</h4>
                <Command>"/items"  --  to get data of all items</Command>
                <Command>"/add"    --  to add item with name and price</Command>
                <Command>"/update" --  to edit price of exiting item with id</Command>
                <Command>"/delete" -- to delete item with id</Command>
              </APIStory>
            </Col>
          </Row>
      </Container>
    </React.Fragment>);
  }
}

const Command =  styled.div`
  padding: 5px 10px;
  border-radius: 6px;
  margin: 20px auto;
  font-size: 1.05rem;
  border: 1px solid #e5e5e5;
  background: #edf2f4;
  background-color: #edf2f4;
  color: rgba(0,0,0,0.8);
  :nth-of-type(1){
    margin-top: 5px;
  }
`;

const APIStory = styled.div`
   padding: 0px 15px; 
   padding-top: 30px;
   height:  100%;
   color: #000;
   background: #f1faee;
   backgrond-color: #f1faee;
   > h4{
     color: #000;
   }
`;




const WrappedList = styled.div`
  // background: #0566d;
  background: #264653;
  margin: 10px auto;
  padding: 8px 10px;
  font-size: 1rem;
  border-radius: 4px;
  display: flex;
  > *{
    flex: 1;
  }
  > span:nth-of-type(1){
    font-size: 1.13rem;
    margin: auto;
    margin-left: 10px;
    flex: 2;
  }
  > span:nth-of-type(1){
    border-right: 2px solid #fff;
  }
  >span:nth-of-type(2){
   flex: 0; 
  }
  >span:nth-of-type(2):hover{
    cursor: pointer;
  }
  >span:nth-of-type(2):active > svg{
    color: #e63946;
  }
  > p{ 
    flex: auto;
    margin: auto 5px;
    margin-left: 10px; 
    border:none;
    outline: none;
    background: inherit;
    background-color: inherit;
    color: inherit;
    text-align: center;
  }
`;

const AddWrapper = styled.div`  
  display: flex;
  margin: 30px auto;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 1.05rem;
  color: #fff;
  box-shadow: 1px 1px 44px -12px rgba(255,255,255,0.6);
  background: #ef476f;
  > div:nth-of-type(1){
    flex: 4;
  }
  > div:nth-of-type(2){
    flex: 2;
  }
  > div > input {
    width: 100%;
    border: none;
    background: inherit;
    outline: none;
    color: #fff;
    padding-left: 10px;
    margin: auto 5px;
  }
  > div > input::placeholder{
    color: #fff;
  }
  > div:nth-child(1) > input{
    border-right: 2px solid #fdfffc;
  }
  > button{
    flex: 1;
    min-width: 80px;
    border: none; 
    outline: none !important;
    background: #fca311;
    padding: 3px 0px;
    background-color: #fca311;
    border-radius: 4px;
    box-shadow: 1px 1px 0px 1px rgba(0,0,0,0.05);
    color:#fff;
  }
  >  button:active{
      box-shadow: 2px 2px 0px 1px rgba(0,0,0,0.05),-2px -2px 0px 1px rgba(0,0,0,0.05);
      background: #ff9f1c;
      outline: none;
      color: #e63946;
  }
  > button:hover{
    color: #fff;
  }
`;

const ColOutWrapper = styled.div`
  background: #2ec4b6;
  background-color: #2ec4b6;
  color: #fff;
  font-size: 1.3  rem;
  font-weight: 500;
  height: 100%;
  // padding-top: 20px;
`;
const ColInnerWrapper = styled.div`
  margin: 10px;
  margin-top: 30px;
`;

