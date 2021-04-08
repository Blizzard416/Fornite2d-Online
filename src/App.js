import React from 'react'
import {Route, Switch, BrowserRouter, Redirect} from 'react-router-dom'
import Login from './components/login'
import Register from './components/register'
import Play from './components/play'
import Instruction from './components/instruction'
import Stats from './components/stats'
import Profile from './components/profile'

class App extends React.Component {
  constructor(props) {
		super(props);
    this.state = { 
			loggedin: false,
      username: '',
      password: ''
		}
    this.changeState = this.changeState.bind(this);
	}

  componentDidMount() {
    const login = localStorage.getItem('login') === 'true';
    const user = login ? localStorage.getItem('user') : '';
    const password = login ? localStorage.getItem('password') : '';
    this.setState((props) => {
      return {loggedin: login, username: user, password: password};
    });
  }

  changeState(log, username, password) {
    this.setState((props) => {
      return {loggedin: log, username: username, password: password};
    });
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
            <Route exact path="/" render={(props) => <Login {...props} changeState={this.changeState} />}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/play">
              {localStorage.getItem('login') ? <Play/> : <Redirect to="/"/>}
            </Route>
            <Route exact path="/instruction">
              {localStorage.getItem('login') ? <Instruction/> : <Redirect to="/"/>}
            </Route>
            <Route exact path="/stats">
              {localStorage.getItem('login') ? <Stats/> : <Redirect to="/"/>}
            </Route>
            <Route exact path="/profile">
              {localStorage.getItem('login') ? <Profile/> : <Redirect to="/"/>}
            </Route>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;