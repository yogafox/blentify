import React from 'react';
import Map from './Map';
import Time from './Time'

class Game extends React.Component {
    static MAX_DIFFICULTY = 4;
    static MAX_TYPE = 9;

    constructor(props) {
        super(props);
        this.state = {status: ""};
    }
    componentWillMount() {
        this.setState(() => ({time: 0}))
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

export default Game;
