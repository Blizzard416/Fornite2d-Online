import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {Link} from 'react-router-dom';
import {Redirect} from "react-router-dom";
import axios from 'axios';
import {closeSocket} from '../controller'
import Grid from '@material-ui/core/Grid';

// Component for username input textField
class UsernameInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
        // Highlight error
        if (this.props.error === "Missing username") err=true;
        return (
            <TextField 
                error = {err}
                variant="outlined" 
                margin="normal" 
                label="Username" 
                id="username" 
                name="username"
                onChange={this.props.changeHandler}
            />
        );
	}
}

// Component for password input textField
class PasswordInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
        // Highlight error
        if (this.props.error === "Missing password") err=true;
        return (
            <TextField 
                error = {err}
                variant="outlined" 
                margin="normal" 
                label="Password" 
                id="password"
                name="password"
                type="password"
                onChange={this.props.changeHandler}
            />
        );
	}
}

// Component for login button
class LoginButton extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.props.clickHandler}
            >
            Login
            </Button>
		);
	}
}

// Login component to export
class Login extends React.Component {
    // Create state and bind the function
    constructor(props) {
		super(props);
		this.state = { 
			username :  "",
			password: "",
            redirect: false,
            error:""
		}
		this.clickHandler = this.clickHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
	}
    
    // Disconnect the socket and remove the user loggedin status from the local storage
    componentDidMount() {
        closeSocket();
        localStorage.removeItem('login');
        localStorage.removeItem('user');
        localStorage.removeItem('password');
        this.props.changeState(false, '', '');
    }

    // Frontend validation on the textfield
    validation() {
        if (this.state.username === '') {
            this.setState({"error": 'Missing username'});
            alert("Missing username");
            return false;
        } else if (this.state.password === '') {
            this.setState({"error": 'Missing password'});
            alert("Missing password");
            return false;
        }
        return true
    }

    // Login button click event handler
    clickHandler(e) {
        e.preventDefault();
        // Check validation
        if (this.validation()) {
            // Send information to backend
            axios.post('/api/auth/login', {}, {headers: { "Authorization": "Basic " + btoa(this.state.username + ":" + this.state.password) }})
            // Update user loggedin status to local storage and prepare to redirect
            .then((response) => {
                localStorage.setItem('login', true);
                localStorage.setItem('user', this.state.username);
                localStorage.setItem('password', this.state.password);
                this.props.changeState(true, this.state.username, this.state.password);
                this.setState((props) => {
                    return {redirect: true};
                });
            })
            // Handle error message
            .catch((error) => {
                var err;
                if (error.response) {
                    alert(error.response.data.error);
                    err = error.response.data.error;
                } else if (error.request) {
                    alert(error.request);
                    err = error.request
                } else {
                    alert(error.message);
                    err = error.message
                }
                this.setState((props) => {
                    return {error: err};
                });
            })
        }
    }

    // Handle user input and update the state
    changeHandler(e) {
        var name = e.target.name;
        var value = e.target.value;
        
        this.setState({ [name] : value});
    }

    render(){
        // Redirect to play page
        if (this.state.redirect) {
            return <Redirect to='./play'/>;
        }
        return(
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                style={{ minHeight: '100vh' }}
            >
                <h1>f0rt9it32d</h1>
                <Grid item xs={3}>
                    <div>
                        <h2>Login</h2>
                        <UsernameInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <PasswordInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <LoginButton clickHandler={this.clickHandler}/>
                        <br></br>
                        <Link to="./register">
                            Register
                        </Link>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

// Export component
export default Login;