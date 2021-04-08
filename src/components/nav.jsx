import React from 'react';
import {Link} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

// Material ui style
const useStyles =(theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        flexGrow: 1
    },
    title: {
        flexGrow: 1
    },
    link: {
        color: 'white',
        textDecoration: "none"
    }
});

// Navigation component to export
class Navigation extends React.Component {
  constructor(props) {
		super(props);
    }
  render() {
        const {classes} = this.props; 
        return (
          <div className={classes.root}>
              <AppBar position="static" style={{ background: 'red' }}>
                <Toolbar >
                  <Typography variant="h6" className={classes.title}>
                    f0rt9it32d
                  </Typography>
                  <Link to="./play" className={classes.link}>
                      <Button className={classes.button}>Play</Button>
                  </Link>
                  <Link to="./instruction" className={classes.link}>
                      <Button className={classes.button} color="inherit">Instruction</Button>
                  </Link>
                  <Link to="./stats" className={classes.link}>
                      <Button className={classes.button} color="inherit">Stats</Button>
                  </Link>
                  <Link to="./profile" className={classes.link}>
                      <Button className={classes.button} color="inherit">Profile</Button>
                  </Link>
                  <Link to="../" className={classes.link}>
                      <Button className={classes.button} color="inherit">Logout</Button>
                  </Link>
                </Toolbar>
              </AppBar>
          </div>
          );
    }
}

// Export component and apply style
export default withStyles(useStyles)(Navigation);