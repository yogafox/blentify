import React from 'react';
import Map from './Map';
import Time from './Time'
import PropTypes from 'prop-types';


class Game extends React.Component {
    static MAX_DIFFICULTY = 4;
    static MAX_TYPE = 9;

    timeReceiver = (key) => {
        this.time = key.time;
        this.setState({time : key.time});
    };

    AfterGameEnded = (type) => {
        let record = {
            map: "A Map Object",
            time: "Integer",
            history: "Array of moves",
            candidate: "Array of color in place",
            ground: "Array of color in place",
            lock: "Array of locked index",
        };
        let recordString = JSON.stringify(record);
        let key = {
            gameStatus: type,
            record: recordString
        };
        this.gameStatusSender(key);
    };

    constructor(props) {
        super(props);
        this.state = {status: ""};
        this.gameStatusSender = this.props.callRecv;
    }
    componentWillMount() {
        this.setState(() => ({time : 0}))
        if (this.props.record !== "") {
            // Recorded Game
            let record = JSON.parse(this.props.record);
            console.log(record.user);
        }
        else {
            // New Game
            this.map = new Map()
        }
    }
    render() {
        return (
            <Time initTime={+this.state.time} callRecv={this.timeReceiver.bind(this)}/>
        );
    }
    componentDidMount() {

    }

}

Game.propTypes = {
    user: PropTypes.string,
    palette: PropTypes.array,
    setting: PropTypes.string,
    record: PropTypes.string,
    callRecv: PropTypes.func
};

export default Game;
