import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {Link} from 'react-router-dom';
import { FormControl, FormControlLabel, FormLabel, RadioGroup, Radio } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {Redirect} from "react-router-dom";
import axios from 'axios';
import Grid from '@material-ui/core/Grid';

const Validator = require("validator");

class UsernameInput extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
        var err = false;
        if (this.props.error === "Missing username" || this.props.error === "Username already exists") err=true;
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
                <RadioGroup row defaultValue="male" aria-label="gender" name="gender" onChange={this.props.radioHandler}>
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
            <FormControl required>
                <InputLabel>Country</InputLabel>
                    <Select defaultValue="canada" name="country" onChange={this.props.selectHandler}>
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

class RegisterButton extends React.Component {
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
            Register
            </Button>
		);
	}
}

class Register extends React.Component {
    constructor(props) {
		super(props);
		this.state = { 
			username :  "",
			password: "",
            repassword: "",
            gender: "male",
            country: "canada",
            email: "",
            redirect: false,
            error:""
		}
		this.clickHandler = this.clickHandler.bind(this);
		this.changeHandler = this.changeHandler.bind(this);
        this.radioHandler = this.radioHandler.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
	}

    validation() {
        if (this.state.username === '') {
            this.setState({"error": 'Missing username'});
            alert("Missing username");
            return false;
        } else if (this.state.password === '') {
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

    clickHandler(e) {
        e.preventDefault();
        if (this.validation()) {
            axios.post('/api/register', this.state)
            .then((response) => {
                this.setState((props) => {
                    return {redirect: true};
                });
            })
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
                alert(error.response.data.error);
                this.setState((props) => {
                    return {error: err};
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
        if (this.state.redirect) return <Redirect to='../'/>;
        return(
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                style={{ minHeight: '100vh' }}
            >
                <h2>Register</h2>
                <Grid item xs={3}>
                    <div style={{ display: 'block'}}>
                        <UsernameInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <PasswordInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <RepasswordInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <GenderRadio radioHandler={this.radioHandler}/>
                        <br></br>
                        <CountrySelect selectHandler={this.selectHandler}/>
                        <br></br>
                        <EmailInput error={this.state.error} changeHandler={this.changeHandler}/>
                        <br></br>
                        <RegisterButton clickHandler={this.clickHandler}/>
                        <br></br>
                        <Link to="../">
                            Back
                        </Link>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default Register;