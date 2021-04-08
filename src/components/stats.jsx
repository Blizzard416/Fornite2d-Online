import React from 'react';
import Navigation from './nav'
import axios from 'axios';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {closeSocket} from '../controller'

class Stats extends React.Component {
    constructor(props) {
		super(props);
        this.state = { 
			stats: 0,
            leader: [],
            error:""
		}
	}

    componentDidMount = async () => {
        closeSocket();
        await axios.get('/api/auth/stats/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        .then((response) => {
            this.setState((props) => {
                return {stats: response.data.stats};
            });
        })
        .catch((error) => {
            alert(error.response.data.error);
            this.setState((props) => {
                return {error: error.response.data.error};
            });
        })

        await axios.get('/api/leaderBoard')
        .then((response) => {
            this.setState((props) => {
                return {leader: response.data.res};
            });
        })
        .catch((error) => {
            alert(error.response.data.error);
            this.setState((props) => {
                return {error: error.response.data.error};
            });
        })
    }

    createRow(rank, username, kills) {
        return {rank, username, kills};
    }

    render(){
        const {leader} = this.state;
        var row=[];
        for (var i=0; i < 10; i++) {
            if (i<leader.length) {
                row.push(this.createRow(i+1, leader[i].username, leader[i].mostKills));
            } else {
                row.push(this.createRow(i+1, "", ""))
            }
        }

        return(
            <div>
                <Navigation/>
                <h2>Stats</h2>
                <span>Your highest kills is {this.state.stats}</span>
                <h2>LeaderBoard</h2>
                <TableContainer component={Paper}>
                    <Table aria-label="simple table" style={{ width: 300 }}>
                        <TableHead>
                        <TableRow>
                            <TableCell>Top</TableCell>
                            <TableCell align="center">Username</TableCell>
                            <TableCell align="center">Kills</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {row.map((row) => (
                            <TableRow key={row.name}>
                            <TableCell component="th" scope="row">
                                {row.rank}
                            </TableCell>
                            <TableCell align="center">{row.username}</TableCell>
                            <TableCell align="center">{row.kills}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        );
    }
}

export default Stats;