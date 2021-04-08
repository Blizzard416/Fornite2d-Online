import React from 'react';
import {Link} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

const useStyles =(theme) => ({
    root: {
        marginLeft: theme.spacing(5),
    },
  });

class Navigation extends React.Component {
  constructor(props) {
		super(props);
	}
  render() {
        const {classes} = this.props; 
        return (
          <AppBar position="static" style={{ background: 'red' }}>
            <Toolbar >
              <Typography variant="h6" >
                f0rt9it32d
              </Typography>
              <Link to="./play">
                  <Button className={classes.root}>Play</Button>
              </Link>
              <Link to="./instruction">
                  <Button className={classes.root} color="inherit">Instruction</Button>
              </Link>
              <Link to="./stats">
                  <Button className={classes.root} color="inherit">Stats</Button>
              </Link>
              <Link to="./profile">
                  <Button className={classes.root} color="inherit">Profile</Button>
              </Link>
              <Link to="../">
                  <Button className={classes.root} color="inherit">Logout</Button>
              </Link>
            </Toolbar>
          </AppBar>
          );
    }
}

export default withStyles(useStyles)(Navigation);