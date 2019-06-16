import React from 'react';
import Map from './Map';
import Time from './Time'
import PropTypes from 'prop-types';

const randomInt = function (base, top) {
    // return a integer with value in [base, top]
    return Math.floor(Math.random() * (top - base + 1)) + base;
};
const randomChoice = function (array) {
    return array[Math.floor(array.length * Math.random())];
};

class Game extends React.Component {
    MAX_DIFFICULTY = 4;
    diffTypeMap = [[0], [1, 2, 3, 4], [5, 6, 7], [8, 9]];

    diffToType = (difficulty) => randomChoice(this.diffTypeMap[difficulty]);

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
        this.gameStatusSender = this.props.callRecv;
    }
    componentWillMount() {
        console.log(this.props);
        this.setState(() => ({time : 0}));
        this.setting = JSON.parse(this.props.setting);
        if (this.props.record !== "") {
            // Recorded Game
            let record = JSON.parse(this.props.record);
            console.log(record);
        }
        else {
            // New Game
            this.difficuly = (this.setting.difficulty === 0) ?
                randomInt(1, this.MAX_DIFFICULTY) : this.setting.difficulty;
            this.type = this.diffToType(this.difficulty);
            this.map = new Map(this.type, this.props.palette);
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
