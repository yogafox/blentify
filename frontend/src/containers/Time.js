import React from 'react';
import '../App.css'
import PropTypes from 'prop-types';

class Time extends React.Component {
    constructor(props) {
        super(props);
        this.state = {time : this.props.initTime};
        this.sender = this.props.callRecv;
    }
    componentWillMount() {
        this.setState(
            {status : this.props.state,
                place : this.props.place,
                index : this.props.index,
                color : this.props.color
            });
    }
    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 1000);
    }
    tick() {
        this.setState({ time: this.state.time+1 });
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
        this.sender({time : this.state.time});
    }
    render() {
        return (
            <div className="Time">
                <p className="Timer">
                    {Math.floor(this.state.time / 60)} ： {this.state.time % 60}
                </p>
            </div>
        );
    }
}

Time.propTypes = {
    initTime: PropTypes.number,
    callRecv: PropTypes.func
};

export default Time;
