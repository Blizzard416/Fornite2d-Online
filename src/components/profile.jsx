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

const Validator = require("validator");

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

class PasswordInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
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

class RepasswordInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
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

class EmailInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
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

    componentDidMount = async () => {
        closeSocket();
        this.setState((props) => {
            return {password: localStorage.getItem('password'), repassword: localStorage.getItem('password')};
        });
        
        await axios.get('/api/auth/profile/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        .then((response) => {
            this.setState((props) => {
                return {gender: response.data.gender, country: response.data.country, email: response.data.email};
            });
        })
        .catch((error) => {
            alert(error.response.data.error);
            this.setState((props) => {
                return {error: error.response.data.error};
            });
        })
    }

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

    updateHandler(e) {
        e.preventDefault();
        if (this.validation()) {
            axios.put('/api/auth/profile/'+localStorage.getItem('user'), this.state, {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
            .then((response) => {
                alert(response.data.message);
                this.setState((props) => {
                    return {error: ""};
                });
            })
            .catch((error) => {
                alert(error.response.data.error);
                this.setState((props) => {
                    return {error: error.response.data.error};
                });
            })
        }
    }

    deleteHandler(e) {
        e.preventDefault();
        if (this.validation()) {
            axios.delete('/api/auth/profile/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
            .then((response) => {
                alert(response.data.message);
                this.setState((props) => {
                    return {redirect: true};
                });
            })
            .catch((error) => {
                alert(error.response.data.error);
                this.setState((props) => {
                    return {error: error.response.data.error};
                });
            })
        }
    }

    changeHandler(e) {
        var name = e.target.name;
        var value = e.target.value;
        
        this.setState( (props) => {
			return { [name] : value };
		});
    }

    radioHandler(e) {
        this.setState((props) => {
            return {gender: e.target.value};
        });
    }

    selectHandler(e) {
        this.setState((props) => {
            return {country: e.target.value};
        });
    }

    render(){
        if (this.state.redirect) {
            return <Redirect to='../'/>;
        }
        return(
            <div>
                <Navigation/>
                <h2>Profile</h2>
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
                <br></br>
                <DeleteButton deleteHandler={this.deleteHandler}/>
            </div>
        );
    }
}

export default Profile;