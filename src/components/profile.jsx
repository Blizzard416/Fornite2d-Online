import React from 'react';
import Navigation from './nav'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { FormControl, FormControlLabel, FormLabel, RadioGroup, Radio } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import axios from 'axios';
import {Redirect} from "react-router-dom";
import {closeSocket} from '../controller'
import Grid from '@material-ui/core/Grid';

const Validator = require("validator");

// Component for displaying username
class UsernameCom extends React.Component {
    constructor(props) {
      super(props);
    }
    render(props) {
      return (
        <span> Username: {localStorage.getItem('user')} </span>
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
        if (this.props.error === "Missing password" || this.props.error === "Passwords are not identical") err=true;
        return (
            <TextField 
                error = {err}
                value={this.props.old}
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

// Component for re-enter password input textField
class RepasswordInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
        // Highlight error
        if (this.props.error === "Missing re-enter password" || this.props.error === "Passwords are not identical") err=true;
        return (
            <TextField 
                error = {err}
                value={this.props.old}
                variant="outlined" 
                margin="normal" 
                label="Re-password" 
                id="repassword"
                name="repassword"
                type="password"
                onChange={this.props.changeHandler}
            />
        );
	}
}

// Component for selecting gender radio button
class GenderRadio extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <FormControl required component="fieldset">
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup row value={this.props.old} aria-label="gender" name="gender" onChange={this.props.radioHandler}>
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
            </FormControl>
        );
    }
}

// Component for selecting country drop box
class CountrySelect extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <FormControl>
                <InputLabel>Country</InputLabel>
                    <Select value={this.props.old} name="country" onChange={this.props.selectHandler}>
                        <MenuItem value="canada">Canada</MenuItem>
                        <MenuItem value="usa">USA</MenuItem>
                    </Select>
            </FormControl>
        );
    }
}

// Component for email input textField
class EmailInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
        // Highlight error
        if (this.props.error === "Missing email" || this.props.error === "Invalid email format") err=true;
        return (
            <TextField 
                error = {err}
                value={this.props.old}
                variant="outlined" 
                margin="normal" 
                label="Email" 
                id="email"
                name="email"
                type="email"
                onChange={this.props.changeHandler}
            />
        );
	}
}

// Component for update user information button
class UpdateButton extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.props.updateHandler}
            >
                Update
            </Button>
		);
	}
}

// Component for delete user button
class DeleteButton extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.props.deleteHandler}
            >
            Delete
            </Button>
		);
	}
}

class Profile extends React.Component {
    // Create state and bind the function
    constructor(props) {
		super(props);
        this.state = { 
			password: "",
            repassword: "",
            gender: "",
            country: "",
            email: "",
            redirect: false,
            error:""
		}
		this.updateHandler = this.updateHandler.bind(this);
        this.deleteHandler = this.deleteHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
        this.radioHandler = this.radioHandler.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
	}

    // Retrieve user information for pre-fill at the beginning
    componentDidMount = async () => {
        closeSocket();
        this.setState((props) => {
            return {password: localStorage.getItem('password'), repassword: localStorage.getItem('password')};
        });
        
        // Send request to backend
        await axios.get('/api/auth/profile/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        // Update state
        .then((response) => {
            this.setState((props) => {
                return {gender: response.data.gender, country: response.data.country, email: response.data.email};
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

    // Validation on all user input
    validation() {
        if (this.state.password === '') {
            this.setState({"error": 'Missing password'});
            alert("Missing password");
            return false;
        } else if (this.state.repassword === '') {
            this.setState({"error": 'Missing re-enter password'});
            alert("Missing re-enter password");
            return false;
        } else if (this.state.email === '') {
            this.setState({"error": 'Missing email'});
            alert("Missing email");
            return false;
        } else if (this.state.password !== this.state.repassword) {
            this.setState({"error": 'Passwords are not identical'});
            alert("Passwords are not identical");
            return false;
        } else if (!Validator.isEmail(this.state.email)) {
            this.setState({"error": 'Invalid email format'});
            alert("Invalid email format");
            return false;
        }
        return true;
    }

    // Update the user information to database
    updateHandler(e) {
        e.preventDefault();
        // Check validation
        if (this.validation()) {
            // Send request to backend
            axios.put('/api/auth/profile/'+localStorage.getItem('user'), this.state, {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
            // Display user feedback
            .then((response) => {
                alert(response.data.message);
                localStorage.setItem('password', this.state.password);
                this.setState((props) => {
                    return {error: ""};
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

    // Delete user from the database
    deleteHandler(e) {
        e.preventDefault();
        // Check validation
        if (this.validation()) {
            // Send request to backend
            axios.delete('/api/auth/profile/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
            // Display user feedback and prepare to redirect
            .then((response) => {
                alert(response.data.message);
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
        
        this.setState( (props) => {
			return { [name] : value };
		});
    }

    // Handle radio button and update the state
    radioHandler(e) {
        this.setState((props) => {
            return {gender: e.target.value};
        });
    }

    // Handle drop box and update the state
    selectHandler(e) {
        this.setState((props) => {
            return {country: e.target.value};
        });
    }

    render(){
        // Redirect to login page
        if (this.state.redirect) {
            return <Redirect to='../'/>;
        }
        return(
            <div>
                <Navigation/>
                <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                style={{ minHeight: '100vh' }}
                >
                    <h2>Profile</h2>
                    <Grid item xs={3}>
                        <div>
                            <UsernameCom/>
                            <br></br>
                            <PasswordInput old={this.state.password} error={this.state.error} changeHandler={this.changeHandler}/>
                            <br></br>
                            <RepasswordInput old={this.state.repassword} error={this.state.error} changeHandler={this.changeHandler}/>
                            <br></br>
                            <GenderRadio old={this.state.gender} radioHandler={this.radioHandler}/>
                            <br></br>
                            <CountrySelect old={this.state.country} selectHandler={this.selectHandler}/>
                            <br></br>
                            <EmailInput old={this.state.email} error={this.state.error} changeHandler={this.changeHandler}/>
                            <br></br>
                            <UpdateButton updateHandler={this.updateHandler}/>
                            <DeleteButton deleteHandler={this.deleteHandler}/>
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

// Export component
export default Profile;