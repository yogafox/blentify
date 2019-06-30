import React from 'react';
import '../css/App.css'
import PropTypes from 'prop-types';

class Tile extends React.Component {
    divStyler() {
        if (this.state.status === 'Space') {
            return {
                backgroundColor: `#282828`
            };
        }
        else if (this.state.status === 'Blank') {
            return {
                backgroundColor: `black`
            };
        }
        else if (this.state.status === 'Lock') {
            return {
                border: `white 1px solid`,
                backgroundColor: `hsl(${+this.state.color[0]},
                                      ${+this.state.color[1]}%, 
                                      ${+this.state.color[2]}%)`
            };
        }
        else {
            return {
                backgroundColor: `hsl(${+this.state.color[0]}, 
                                      ${+this.state.color[1]}%, 
                                      ${+this.state.color[2]}%)`
            };
        }
    }
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.setState({
            status : this.props.status,
            place : this.props.place,
            id : this.props.id,
            color : this.props.color
        });
    }
    callback = (key) => {
        this.setState({
            status : key.status,
            place : key.place,
            id : key.id,
            color : key.color
        });
    };

    onClick = (e) => {
        if (this.state.place !== "Answer" &&
            this.state.status !== "Lock" &&
            this.state.status !== "Space") {
            let key = {
                "status" : this.state.status,
                "place" : this.state.place,
                "id" : this.state.id,
                "color" : this.state.color,
                "callback" : this.callback
            };
            this.props.tileOnClick(key);
        }
    };
    render() {
        let divStyle = this.divStyler();
        return (
            <button className="Tile"
                    status={this.state.status}
                    place={this.state.place}
                    id={this.state.id}
                    style={divStyle}
                    onClick={this.onClick}
                    key={this.props.key}
            >
                <p>{this.state.status === "Space" ? "" : (this.state.status === "Blank" ? "" : this.state.status)}</p>
                {/*<p>{this.state.id}</p>*/}
            </button>
        );
    }
}

Tile.propTypes = {
    status: PropTypes.string,
    place: PropTypes.string,
    id: PropTypes.number,
    color: PropTypes.array,
    tileOnClick: PropTypes.func
};

export default Tile;
