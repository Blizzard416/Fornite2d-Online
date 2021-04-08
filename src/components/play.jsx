import React from 'react';
import Navigation from './nav'
import {connectSocket} from '../controller'
import Button from '@material-ui/core/Button';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';

// Component for start game button
class StartButton extends React.Component {
    constructor(props) {
		super(props);
	}
	render(props){
		return (
            <Button
                className="Button"
                disabled={this.props.playing}
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.props.clickHandler}
            >
            Connect to the Game!
            </Button>
		);
	}
}

// Play page component to export
class Play extends React.Component {
    // Create state and bind the function
    constructor(props) {
		super(props);
        this.state = { 
			playing :  false
		}
        this.clickHandler = this.clickHandler.bind(this);
	}

    // Login button click event handler
    clickHandler(e) {
        // Update state and connect to web socket
        this.setState({playing: true})
        connectSocket(this.refs.canvas, localStorage.getItem('user'));
    }

    // Check Authorization before displaying pages
    componentDidMount() {
        this.setState({playing: false})
        axios.get('/api/auth/play', {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        .then((response) => {
        })
        // Handle error message
        .catch((error) => {
            if (error.response) {
                alert(error.response.data.error);
            } else if (error.request) {
                alert(error.request);
            } else {
                alert(error.message);
            }
        })
    }

    render(){
        return(
            <div>
                <Navigation/>
                <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                style={{ minHeight: '15vh' }}
                >
                    <h2>Game</h2>
                    <Grid item xs={3}>
                        <StartButton playing={this.state.playing} clickHandler={this.clickHandler} />
                    </Grid>
                </Grid>
                <center>
                    <canvas ref="canvas" width={800} height={800} style={{border:"1px solid black"}}/>
                </center>
            </div>
        );
    }
}

// Export component
export default Play;