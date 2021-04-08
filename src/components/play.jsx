import React from 'react';
import Navigation from './nav'
import {connectSocket} from '../controller'

class Play extends React.Component {
    constructor(props) {
		super(props);
	}

    componentDidMount() {
        connectSocket(this.refs.canvas, localStorage.getItem('user'));
    }

    render(){
        return(
            <div>
                <Navigation/>
                <h2>Game</h2>
                <center>
                    <canvas ref="canvas" width={800} height={800}/>
                </center>
            </div>
        );
    }
}

export default Play;