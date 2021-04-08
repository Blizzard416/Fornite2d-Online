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
import Grid from '@material-ui/core/Grid';

// Component for displaying leaderboard
class LeaderBoard extends React.Component {
    constructor(props) {
		super(props);
	}

    // Helper function to create row
    createRow(rank, username, kills) {
        return {rank, username, kills};
    }

    render() {
        const leader = this.props.leader;
        // Reocrd leader stats to row 
        var row=[];
        for (var i=0; i < 10; i++) {
            if (i<leader.length) {
                row.push(this.createRow(i+1, leader[i].username, leader[i].mostKills));
            } else {
                row.push(this.createRow(i+1, "", ""))
            }
        }

        return(
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
        );
    }
}

// Stats component to export
class Stats extends React.Component {
    // Create state
    constructor(props) {
		super(props);
        this.state = { 
			stats: 0,
            leader: [],
            error:""
		}
	}

    // Retrieve user stats and leaderboard at the beginning
    componentDidMount = async () => {
        closeSocket();
        // Send request to backend
        await axios.get('/api/auth/stats/'+localStorage.getItem('user'), {headers: { "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + localStorage.getItem('password')) }})
        // Update state
        .then((response) => {
            this.setState((props) => {
                return {stats: response.data.stats};
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
            alert(error.response.data.error);
            this.setState((props) => {
                return {error: err};
            });
        })

        // Send leaderboard request to backend
        await axios.get('/api/leaderBoard')
        // Update state
        .then((response) => {
            this.setState((props) => {
                return {leader: response.data.res};
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
            alert(error.response.data.error);
            this.setState((props) => {
                return {error: err};
            });
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
                    <h2>Stats</h2>
                    <Grid item xs={3}>
                        <span>Your highest kills is {this.state.stats}</span>
                    </Grid>
                    <h2>LeaderBoard</h2>
                    <Grid item xs={3}>
                        <LeaderBoard leader={this.state.leader}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default Stats;