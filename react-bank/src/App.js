import React, {Component} from 'react'
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import './App.css'
import jwt from 'jsonwebtoken'
import {callAPI} from './utils'

const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"

class App extends Component{
  constructor(props) {
    super(props);
    this.state = { data: {account: "", pin: ""} }

    this.handleSubmit = this.handleSubmit.bind(this)
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
          this.props.cookies.set('jwt', JWT, { path: '/' })
          alert("Ti sei loggato con successo")
      } else {
          alert("Qualcosa è andato storto...")
      }
      
    } catch(err) {
        console.log(err)
    }
  }

  render() {
    return (
      <div className="Login">
      <Form onSubmit={() => {this.handleSubmit()}}>
        <Form.Group size="lg" controlId="account">
          <Form.Label>Account</Form.Label>
          <Form.Control
            autoFocus
            type="account"
            value={this.state.account}
            onChange={(e) => this.setState({data : {...this.state.data, account : e.target.value}})}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="pin">
          <Form.Label>Pin</Form.Label>
          <Form.Control
            type="pin"
            value={this.state.pin}
            onChange={(e) => this.setState({data: {...this.state.data, pin : e.target.value}})}
          />
        </Form.Group>
        <Button block size="lg" type="submit">
          Login
        </Button>
      </Form>
    </div>
    );
  }
}

export default App;