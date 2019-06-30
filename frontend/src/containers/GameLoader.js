import React from 'react';
import '../css/App.css'
import PropTypes from 'prop-types';

class GameLoader extends React.Component {
    onClick = () => {
        let key = {
            "album" : this.props.album,
            "img" : this.props.img,
            "cover" : this.props.cover,
            "record" : this.props.record,
        };
        this.props.loaderOnClick(key);
    };
    render() {
        return (
            <button
                className="GameLoader"
                id={this.state.id}
                onClick={this.onClick}
            >
                <p>{this.props.album}</p>
            </button>
        );
    }
}

GameLoader.propTypes = {
    album: PropTypes.string,
    img: PropTypes.element,
    cover: PropTypes.element,
    record: PropTypes.string,
    loaderOnClick: PropTypes.func,
    id: PropTypes.number
};

export default GameLoader;
