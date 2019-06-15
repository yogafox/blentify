import React from 'react';
import Map from './Map';
import Time from './Time'
import PropTypes from 'prop-types';


class Game extends React.Component {
    static MAX_DIFFICULTY = 4;
    static MAX_TYPE = 9;

    constructor(props) {
        super(props);
        this.state = {status: ""};
    }
    componentWillMount() {
        this.setState(() => ({time: 0}))
        if (this.props.record !== "") {
            let record = JSON.parse(this.props.record);

        }
    }

    timeReceiver = (key) => {
        this.time = key.time;
        this.setState({time: key.time});
    };

    render() {
        return (
            <Time initTime={+this.state.time} callRecv={this.timeReceiver.bind(this)}/>
        );
    }
}

Game.propTypes = {
    palette: PropTypes.array,
    record: PropTypes.string,
    callRecv: PropTypes.func
};

export default Game;
