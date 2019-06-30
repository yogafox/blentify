import React from 'react';
import PropTypes from 'prop-types';
import GameLoader from "./GameLoader";

const imageEqual = function (imageA, imageB) {
    return
}

class Pool extends React.Component {
    constructor(props) {
        super(props);
        this.state = {albumRows : []};
    }
    userGameDeleter = () => {
        // Todo
    };

    compareAlbum = function (a, b) {
        if (a.album > b.album) return 1;
        else return -1;
    };
    compareTime = function (a, b) {
        if (a.lastest > b.lastest) return -1;
        else return 1;
    };
    sortByAlbumTime = () => {
        this.recordedData = [];
        if (this.userGames.length === 0) return;
        this.userGames.sort(this.compareAlbum);
        let lastAlbum = this.userGames[0].album,
            albumGroup = [],
            latestTime = this.userGames[0].time,
            albumtime = [];
        albumGroup.push(this.userGames[0]);
        for (let i = 1, size = this.userGames.length; i < size; i++) {
            if (lastAlbum !== this.userGames[i].album) {
                albumtime.push(latestTime);
                this.recordedData.push(Object.assign({}, albumGroup));
                latestTime = 0;
                albumGroup = [];
            } else {
                if (this.userGames[i].time > latestTime) latestTime = this.userGames[i].time;
                albumGroup.push(this.userGames[i]);
            }
        }
        albumtime.push(latestTime);
        //this.recordedData.sort(this.compareTime);
        console.log(this.recordedData, albumtime);
    };
    userIdLoader = (userId) => {
        console.log(userId);
        this.userGames = [];
        if (!this.props.data) return;
        for (let i = 0; i < this.props.data.length; i++) {
            if (this.props.data[i].token === userId) {
                let game = JSON.parse(this.props.data[i].message);
                game.time = i;
                this.userGames.push(game);
            }
        }
    };
    componentWillMount(){
        this.dataLength = this.props.data.length;
        this.userIdLoader(this.props.userId);
        this.sortByAlbumTime();
        this.makeLoader();
        console.log(this.recordedData);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.data.length > this.dataLength) return true;
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        this.userIdLoader(this.props.userId);
        this.sortByAlbumTime();

    }

    gameLoadOnClick = (key) => {
        this.props.callback(key);
    };

    makeLoader = () => {
        console.log(this.recordedData);
        this.albumRows = [];
        for (let i = 0, size = this.recordedData.length; i < size; i++) {
            for (let game = 0, times = this.recordedData[i].length; game < times; game++) {
                this.albumRows.push(
                    <GameLoader
                        album={this.recordedData[i][game].album}
                        img={this.recordedData[i][game].img}
                        cover={this.recordedData[i][game].cover}
                        record={this.recordedData[i][game].record}
                        loaderOnClick={this.gameLoadOnClick.bind(this)}
                        id={game}
                    />
                )
            }
        }
        console.log(this.albumRows);
        this.setState(() => ({
            albumRows: this.albumRows
        }));
    };

    render() {
        // this.userIdLoader(this.props.userId);
        // this.sortByAlbumTime();
        // this.makeLoader();

        // let albums = this.albumRows.map((row) =>  <div className="row" children={row} />);
        return (
            <div>
                <button onClick={this.props.newGameOnClick}>NewGame</button>
                <div children={this.state.albumRows}>
                </div>
            </div>
        );
    }
};

Pool.propTypes = {
    userId: PropTypes.string,
    data: PropTypes.array,
    callback: PropTypes.func,
    newGameOnClick: PropTypes.func
};

export default Pool;