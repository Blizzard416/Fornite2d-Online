import React from 'react';
import Navigation from './nav'
import {closeSocket} from '../controller'
import axios from 'axios';

class Instruction extends React.Component {
    constructor(props) {
		super(props);
	}

    componentDidMount() {
        closeSocket();
        axios.get('/api/auth/instruction', {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
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
                <legend><h2>Game Instruction</h2></legend>
                <p>
                    Please use WASD to move your character.<br></br>
					Press the left mouse button to shoot other players.<br></br>
                    <br></br>
                    There are many obstacles and resources on the map. Please use obstacles reasonably to avoid attacks from other players. Remember, they are all very offensive.<br></br>
					The obstacles can be destroyed after receive a certain amount of damage. <br></br>
					<br></br>
					Ammunition boxes, weapon boxes and medical kits will be randomly generated on the map. They can be picked up automatically when you walk though them.<br></br>
					<br></br>
					The red box is a medical kit, which can restore your health.<br></br>
					The green box is an ammunition box, which can provide you with an additional 30 rounds of ammunition.<br></br>
					The black box is a weapon box, you will get a powerful automatic rifle with an insane rate of fire.<br></br>
					<br></br>
                </p>
            </div>
        );
    }
}

export default Instruction;