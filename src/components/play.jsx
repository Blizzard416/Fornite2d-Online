import React from 'react';
import Navigation from './nav'
import {connectSocket} from '../controller'
import Button from '@material-ui/core/Button';
import axios from 'axios';

class RestartButton extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <Button
                disabled={this.props.playing}
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.props.clickHandler}
            >
            Start a New Game!
            </Button>
		);
	}
}

class Play extends React.Component {
    constructor(props) {
		super(props);
        this.state = { 
			playing :  false
		}
        this.clickHandler = this.clickHandler.bind(this);
	}

    clickHandler(e) {
        this.setState({playing: true})
        connectSocket(this.refs.canvas, localStorage.getItem('user'));
    }

    componentDidMount() {
        this.setState({playing: false})
        axios.get('/api/auth/play', {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        .then((response) => {
        })
        .catch((error) => {
            alert(error.response.data.error);
        })
    }

    render(){
        return(
            <div>
                <Navigation/>
                <h2>Game</h2>
                <center>
                    <canvas ref="canvas" width={800} height={800}/>
                </center>
                <br></br>
                <RestartButton playing={this.state.playing} clickHandler={this.clickHandler}/>
            </div>
        );
    }
}

export default Play;