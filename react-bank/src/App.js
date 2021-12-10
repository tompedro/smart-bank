import React, {Component} from 'react'
import Form from "react-bootstrap/Form"
import {
  View,
  TouchableOpacity,
  Text,
  TextInput
} from 'react-native'
import Button from "react-bootstrap/Button"
import './App.css'
import jwt from 'jsonwebtoken'
import {callAPI} from './utils'
import Cookies from 'universal-cookie'

const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"

class App extends Component{
  constructor(props) {
    super(props)
    const cookies = new Cookies()
    this.state = { 
      data: {account: "", pin: ""}, 
      cookies, 
      logged : false, 
      userId: -1, 
      user:{}, 
      operateValue:0, 
      transactions:[], 
      signup: false,
      signupData:{} }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.getInfo = this.getInfo.bind(this)
    this.operate = this.operate.bind(this)
    this.signup = this.signup.bind(this)
  }

  componentWillMount(){
    try{
      const decoded = jwt.verify(this.state.cookies.get('jwt'), secret)
      if(decoded){
        this.setState({logged: true, userId: parseInt(decoded.id)})
        this.getInfo()
      }

    } catch(err){

    }
  }

  async handleSubmit(){
    try{
      const { JWT } = await callAPI(
          `/profile/login`,
          this.state.data,
          {auth : false, method: "POST", verbose: true}
      )
      const decoded = jwt.verify(JWT, secret)

      if(decoded){
          this.state.cookies.set('jwt', JWT, { path: '/' })
          this.setState({logged: true, userId: parseInt(decoded.id)})
          this.getInfo()
      } else {
          alert("Qualcosa è andato storto...")
      }
      
    } catch(err) {
        console.log(err)
    }
  }

  async getInfo(){
    try{
      const data = await callAPI(
        `/profile/getInfo`,
        {userId: this.state.userId},
        {auth : this.state.cookies.get('jwt'), method: "POST", verbose: true}
      )
      if(data){
        this.setState({user: data.user})
      }
      
    } catch(err) {
        console.log(err)
    }
  }

  async operate(){
    try{
      await callAPI(
        `/transaction/operate`,
        {userId: parseInt(this.state.userId), amount: parseInt(this.state.operateValue)},
        {auth : this.state.cookies.get('jwt'), method: "POST", verbose: true}
      )
      
    } catch(err) {
        console.log(err)
    }
  }

  async getTransactions(){
    try{
      const data = await callAPI(
        `/transaction/getTransactions`,
        {userId: parseInt(this.state.userId)},
        {auth : this.state.cookies.get('jwt'), method: "POST", verbose: true}
      )

      if(data){
        this.setState({transactions: data.transactions})
      }
      
    } catch(err) {
        console.log(err)
    }
  }

  async signup(){
    try{
      const { JWT, pin } = await callAPI(
          `/profile/signup`,
          this.state.signupData,
          {auth : false, method: "POST", verbose: true}
      )
      const decoded = jwt.verify(JWT, secret)
      alert("IL TUO PIN E' " + pin)
      if(decoded){
          this.state.cookies.set('jwt', JWT, { path: '/' })
          this.setState({logged: true, userId: parseInt(decoded.id)})
          this.getInfo()
      } else {
          alert("Qualcosa è andato storto...")
      }
      
    } catch(err) {
      console.log(err)
    }
  }

  render() {
    return (
      <View>
        {
          !this.state.logged ? (
            !this.state.signup ? (
            <View className="Login">
              <Button onClick={() => {this.setState({signup :true})}}> SIGNUP</Button>
              <Form onSubmit={() => {this.handleSubmit()}}>
                <Form.Group size="lg" controlId="account">
                  <Form.Label>Account</Form.Label>
                  <Form.Control
                    autoFocus
                    type="account"
                    value={this.state.data.account}
                    onChange={(e) => this.setState({data : {...this.state.data, account : e.target.value}})}
                  />
                </Form.Group>
                <Form.Group size="lg" controlId="pin">
                  <Form.Label>Pin</Form.Label>
                  <Form.Control
                    type="pin"
                    value={this.state.data.pin}
                    onChange={(e) => this.setState({data: {...this.state.data, pin : e.target.value}})}
                  />
                </Form.Group>
                <Button block size="lg" type="submit">
                  Login
                </Button>
              </Form>
            </View>
            ) : (
              <View className="Signup">
              <Button onClick={() => {this.setState({signup :false})}}> LOGIN</Button>
              <Form onSubmit={() => {this.signup()}}>
              <Form.Group size="lg" controlId="firstName">
                  <Form.Label>firstName</Form.Label>
                  <Form.Control
                    autoFocus
                    type="firstName"
                    value={this.state.signupData.firstName}
                    onChange={(e) => this.setState({signupData : {...this.state.signupData, firstName : e.target.value}})}
                  />
                </Form.Group>
                <Form.Group size="lg" controlId="lastName">
                  <Form.Label>lastName</Form.Label>
                  <Form.Control
                    autoFocus
                    type="account"
                    value={this.state.signupData.lastName}
                    onChange={(e) => this.setState({signupData : {...this.state.signupData, lastName : e.target.value}})}
                  />
                </Form.Group>
                <Form.Group size="lg" controlId="account">
                  <Form.Label>Account</Form.Label>
                  <Form.Control
                    autoFocus
                    type="account"
                    value={this.state.signupData.account}
                    onChange={(e) => this.setState({signupData : {...this.state.signupData, account : e.target.value}})}
                  />
                </Form.Group>
                <Button block size="lg" type="submit">
                  Signup
                </Button>
              </Form>
            </View>
            )
          ) : (
            <View>
              <Text>Hello {this.state.user.firstName} {this.state.user.lastName} hai esattamente {this.state.user.balance} $</Text>

              <Text>Inserisci soldi</Text>
              <TextInput
                value= {this.state.operateValue}
                onChangeText={(text) => this.setState({operateValue: text})}
                />
              <Button
                variant="input"
                onClick={() => this.operate()}
              >
                Operate
              </Button>


              {
                this.state.transactions.map((e,i) => {
                  let d = new Date(e.timestamp)
                  return (
                    <Text key = {i}>Id: {e.id} Value: {e.value} Timestamp: {d.toUTCString()}</Text>
                  )
                })
              }

              <Button
                variant="input"
                onClick={() => this.getTransactions()}
              >
                Get transactions
              </Button>
            </View>
          )
        }
      </View>
      
    );
  }
}

export default App;