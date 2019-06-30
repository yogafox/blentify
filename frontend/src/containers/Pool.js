import React from 'react';
import PropTypes from 'prop-types';

const imageEqual = function (imageA, imageB) {
    return
}

class Pool extends React.Component {
    userGameDeleter = () => {
        // Todo
    };

    compareImage = function (a, b) {
        return (JSON.stringify(a.image) - JSON.stringify(b.image));
    };

    sortByImage = () => {
        this.userGames.sort(this.compareImage);
        let lastImage = [],
            imageGroup = [],
            imageData = [];
        for (let i = 0, size = this.userGames.length; i < size; i++) {
            if (lastImage !== this.userGames[i]);
        }
    };
    userIdLoader = (userId) => {
        let userGames = [];
        for (let i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].user === userId) {
                let game = JSON.parse(this.props.data[i].message);
                userGames.push(game);
            }
        }
        this.userGames = userGames;
    };
    componentWillMount(){

    }


    render() {
        return (
            <div>
                <button onClick={this.props.newGameOnClick}>NewGame</button>
            </div>
        );
    }
};

Pool.propTypes = {
    userId: PropTypes.number,
    data: PropTypes.array,
    callback: PropTypes.func,
    newGameOnClick: PropTypes.func
};

export default Pool;