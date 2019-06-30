import React from 'react';
import axios from 'axios';
import ColorThief from 'color-thief';

import Modal from './module/modal';

import Game from './containers/Game';
import Pool from './containers/Pool';
import Search from './containers/Search';
import Header from './components/Header';
import Player from './containers/Player';
//import logo from './logo.svg';
import './css/App.css';
import './css/spotify.css';
import './css/modal.css';

const APP_HOST = "http://localhost";
const APP_API_PORT = 3001;
const APP_CLIENT_PORT = 3000;

let defaultSetting = {
    style: "default",
    difficulty: +0 // [0, 3], 0 means random
};
let defaultUser = {
    id: "",                  // unique
    name: null,    // not guaranteed to be unique
    img: null
};


class App extends React.Component {
    gameStatusReceiver = (key) => {
        // what state should be updated to render main page.
        // this function would be called if the game ended or saved
        // key = {
        //     gameStatus: String,
        //     record: recordString
        // };
        if (key.gameStatus === "end") {
            // Todo
            console.log("end game");
            console.log(this.state.user.id);
            console.log(this.state.user.id, key.record, key.playedAlbum, key.playedImg);
            this.userSaver(this.state.user.id, key.record, key.playedAlbum, key.playedImg);
        }
        else if (key.gameStatus === "save") {
            // Todo: send recorded data string to DB
            console.log("save game");
            console.log(this.state.user.id, key.record, key.playedAlbum, key.playedImg);
            this.userSaver(this.state.user.id, key.record, key.playedAlbum, key.playedImg);
            this.setState(()=>({ page : "main" }));
        }
        else if (key.gameStatus === "exit") {
            console.log("exit game");
            console.log(this.state.user.id, key.record, key.playedAlbum, key.playedImg);
            this.userSaver(this.state.user.id, key.record, key.playedAlbum, key.playedImg);

        }
    };
    userSaver = (user, gameRecord, playedAlbum, playedImg) => {
        let data = {
            user: user,
            cover: "An Image Object",
            image: playedImg,
            album: playedAlbum,
            record: gameRecord
        };
        let message = JSON.stringify(data);
        console.log(user, message);
        this.putDataToDB(user, message);
    };
    setStyleOnClick = (e) => {
        this.buttonOnClick(e);
        // Todo
    };
    setDifficultyOnClick = (e) => {
        this.buttonOnClick(e);
        let target = e.target.innerHTML,
            difficulty = 0;
        if (target !== "random") difficulty = +target;
        let oldSetting = JSON.parse(this.state.setting);
        oldSetting.difficulty = difficulty;
        let newSetting = JSON.stringify(oldSetting);
        this.setState(() => ({
            setting: newSetting
        }));
        localStorage.setItem('setting', newSetting);
    };
    buttonOnClick = (e) => {
        for (let i = 0; i < 3; i++) {
            e.target.parentNode.childNodes[i].classList.remove("button-activate");
        }
        e.target.classList.add("button-activate");
    };
    getSpotifyURL = ({ client_id, scopes, redirect_uri }) => {
        return 'https://accounts.spotify.com/authorize?' + 
              'client_id=' + client_id + 
              '&scopes=' + encodeURIComponent(scopes.join(' ')) + 
              '&redirect_uri=' + encodeURIComponent(redirect_uri) + 
              '&response_type=token';
    };
    logoutOnClick = () => {
        localStorage.removeItem('session');
        localStorage.removeItem('expire');
        this.setState(() => ({
          status: "logout",
          user: defaultUser,
          page: "welcome"
        }));
    };
    loginOnClick = () => {
        var popup = window.open(
          this.getSpotifyURL({
              client_id: '81142cfcbf1d46e0914d306bbe0c64d7',
              scopes: ['user-read-email', 'user-read-private'],
              redirect_uri: APP_HOST + ':' + APP_CLIENT_PORT + '/'
          }),
          'Login with Spotify',
          'width=800,height=600'
        );
        
        window.spotifyCallback = (access_token) => {
            popup.close();
            this.setState(() => ({
                session: access_token,
                page: "main"
            }));
            localStorage.setItem('expire', new Date().getTime());
            localStorage.setItem('session', access_token);   // TODO: check necessarility
            this.getMe(access_token);
        };
    };
    gameCommanderRecv = (key) => {
        this.gameCommander = key.callback;
    };
    mainPageOnClick = () => {
        if (this.gameCommander !== null) this.gameCommander("save");
        if (this.state.user.name === defaultUser.name) {
            this.setState(() => ({
                page : "welcome",
                search: false
            }));
        }
        else {
            this.setState(() => ({
                page : "main",
                search: false
            }));
        }
    };
    newGameOnClick = () => {
        if (this.state.status === "logout") {
            this.setState(() => ({palette : [],
                                        record : ""}));
        }
        this.setState(() => ({page : "game"}));
    };
    gameRecordRecv = (key) => {
        this.setState(() => ({
            record: key.record
        }));
    };
    searchOnClick = async (event) => {
        if (event.keyCode === 13 || event.keyCode === undefined) {
            console.log(event.target.parentNode.parentNode);
            let input = event.keyCode === 13? event.target:event.target.parentNode.parentNode.childNodes[0];
            await this.searchSpotify(input.value);
        }
    };
    trackOnClick = async (event) => {
        let track = event.target;
        while (!track.classList.contains("track")) {
            track = track.parentNode;
        }
        let imgUrl = this.state.displayTracks[track.id].album.images[0].url;
        this.getPalette(imgUrl).then(() => {
            console.log(this.playingPalette);

            Modal.confirm({
                title: 'Confirm Dialog',
                message: 'Create a new game with ' + track.childNodes[2].childNodes[0].innerText,
                img_src: track.childNodes[0].childNodes[0].src,
                palette: this.playingPalette,
                buttonClass: 'green',
                onConfirm: () => {
                    this.playTrack(track);
                    this.setState(() => ({
                        page: "game"
                    }));
                }
            });
        });
        
    };

    playTrack = (track) => {
        // TODO: play the track
        this.playingAlbumName = this.state.displayTracks[track.id].album.name;
        this.setState(() => ({
            playTracks: this.state.displayTracks,
            track_num: parseInt(track.id)
        }))
        //setTimeout(() => { this.setState(() => ({track_num: this.state.track_num+1}))}, 10000);
    }

    searchSpotify = (key) => {
        const { session } = this.state;
        const params = {
            session: session,
            key: key
        };
        var url = new URL(APP_HOST + ':' + APP_API_PORT + '/api/spotify/search');
        url.search = new URLSearchParams(params);
        fetch(url)
            .then((data) => data.json())
            .then((data) => {
                if (data.tracks.items.length) {
                    this.setState(() => ({ 
                        displayTracks: data.tracks.items,
                        search: true 
                    }));
                }
                else {
                    Modal.alert({
                        message: 'No results found!',
                        buttonClass: 'green'
                    })
                }
            });
    } 

    getMe = (access_token) => {
        const params = { session: access_token };
        var url = new URL(APP_HOST + ':' + APP_API_PORT + '/api/spotify/getme');
        url.search = new URLSearchParams(params);
        fetch(url)
            .then((data) => data.json())
            .then((data) => {
                console.log(data);
                let user = {
                    id: data.id,                    // unique
                    name: data.display_name,        // not guaranteed to be unique
                    img: data.images[data.images.length-1].url
                }
                this.setState(() => ({
                    user: user
                }))
            })
    }

    getPalette(sourceImageUrl) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                this.playingImg = img;
                this.playingPalette = this.colorThief.getPalette(img);
                resolve();
            };
            img.crossOrigin = 'Anonymous';
            img.src = sourceImageUrl;
        });
    }

    constructor(props) {
        super(props);
        let settingString = JSON.stringify(defaultSetting);
        this.settingRef = React.createRef();
        this.playingPalette = [];
        this.playingImg = null;
        this.playingAlbumName = null;
        this.gameCommander = null;
        this.colorThief = new ColorThief();
        this.state = {
            data: [],
            page: "welcome",
            status: "logout",
            palette: [],
            setting: settingString,
            record: "",
            session: null,    // TODO
            user: defaultUser,
            displayTracks: null,
            playTracks: null,
            track_num: null,
            search: false
        };
    }

    componentWillMount() {
        // TODO: check state

        // Reference: https://developer.spotify.com/documentation/general/guides/authorization-guide/
        // Implicit Grant Flow

        // if the url is /#access_token={token}&token_type=Bearer&expires_in=3600&state=123, 
        // then call the callback function to close the window and store the token
        var token = window.location.hash.substr(1).split('&')[0].split("=")[1];
        if (token) {
            window.opener.spotifyCallback(token);
        }

        if (localStorage.getItem('session', null)) {
            this.setState(() => ({
                session: localStorage.getItem('session'),
                status: "login",
                page: "main"
            }));
        }
        this.getMe(localStorage.getItem('session'));

        if (localStorage.getItem('setting', null)) {
            this.setState(() => ({
                setting: localStorage.getItem('setting')
            }));
        }
    }

    componentWillUpdate() {
        var time = new Date().getTime();
        if (time - (localStorage.getItem('expire') || time) > 3600000) {
            this.logoutOnClick();
        }
    }

    componentDidMount() {
        this.getDataFromDb();
        if (!this.state.intervalIsSet) {
            let interval = setInterval(this.getDataFromDb, 1000);
            this.setState({intervalIsSet: interval});
        }
    }

    componentWillUnmount() {
        if (this.state.intervalIsSet) {
            clearInterval(this.state.intervalIsSet);
            this.setState({intervalIsSet: null});
        }
    }

    getDataFromDb = () => {
        fetch(APP_HOST + ':' + APP_API_PORT + '/api/getData')
            .then((data) => data.json())
            .then((res) => this.setState({data: res.data}));
    };

    putDataToDB = (user, message) => {
        console.log(user, message);
        axios.post(APP_HOST + ':' + APP_API_PORT + '/api/putDataToken', {
            token: user,
            message: message,
        });
    };


    render() {
        if (this.state.page === "welcome") {
            return (
                <div>
                    <Header user={this.state.user}
                            page={this.state.page}
                            callLogin={this.loginOnClick}
                            callLogout={this.logoutOnClick.bind(this)} 
                            callMainPage={this.mainPageOnClick.bind(this)} />
                    <div className="__center container">
                        <h1 className="__center row">Welcome to Blentify!</h1>
                        <p className="__center row">Step 1: Login with your Spotify account (or click "New Game" without account)</p>
                        <p className="__center row">Step 2: Select a song or a game record and start a Blendoku game!</p>
                        <div className="row">
                            <button className="button-dark" onClick={this.loginOnClick}>Login</button>
                        </div>
                        <div className="row">
                            <button onClick={this.newGameOnClick}>New Game</button>
                        </div>
                    </div>
                </div>
            );
        }

        if (this.state.page === "main") {
            let page = this.state.search? 
                <Search tracks={this.state.displayTracks}
                        selectTrack={this.trackOnClick.bind(this)}/>
                :
                <Pool
                    userId={this.state.user.id}
                    data={this.state.data}
                    callback={this.gameRecordRecv.bind(this)}
                    newGameOnClick={this.newGameOnClick.bind(this)}
                />;
            return (
                <div>     
                    <Header user={this.state.user}
                            page={this.state.page}
                            callLogout={this.logoutOnClick.bind(this)} 
                            callLogin={this.loginOnClick}
                            callMainPage={this.mainPageOnClick.bind(this)} 
                            callSearch={this.searchOnClick}
                    />
                    <SideBar
                        tracks={this.state.playTracks}
                        track_num={this.state.track_num}
                        setDifficultyOnClick={this.setDifficultyOnClick}
                        setting={this.state.setting}
                    />
                    <div className="main">
                        {page}
                    </div>
                </div>
            );
        }
        else if (this.state.page === "game") {
            return (
                <div>
                    <Header user={this.state.user}
                            page={this.state.page}
                            callLogout={this.logoutOnClick.bind(this)}
                            callLogin={this.loginOnClick}
                            callMainPage={this.mainPageOnClick.bind(this)} 
                            callSearch={this.searchOnClick}
                    /> 
                    <SideBar
                        tracks={this.state.playTracks}
                        track_num={this.state.track_num}
                        setDifficultyOnClick={this.setDifficultyOnClick}
                        setting={this.state.setting}
                    />
                    <div className="main">
                        <Game
                            palette={this.playingPalette}
                            setting={this.state.setting}
                            record={this.state.record}
                            callRecv={this.gameStatusReceiver.bind(this)}
                            playingAlbum={this.playingAlbumName}
                            playingImg={this.playingImg}
                            gameCommanderRecv = {this.gameCommanderRecv.bind(this)}
                        />
                    </div>
                </div>
            );
        }
        else if (this.state.page === "") {

        }
    }
}

const SideBar = ({ tracks, track_num, setDifficultyOnClick, setting }) => {
    let player = tracks === null || track_num === null? null:
        (<Player track_url={tracks[track_num].external_urls.spotify}
            height="330"
        />);
    setting = JSON.parse(setting);
    let buttonDifficulty = ['random', '1', '2', '3'].map((option, idx) => {
        if (setting.difficulty === idx)
            return <button className="button-activate" onClick={setDifficultyOnClick} key={idx}>{option}</button>;
        else
            return <button onClick={setDifficultyOnClick} key={idx}>{option}</button>;
    });
    let buttonStyle = ['default', '1', '2', '3'].map((option, idx) => {
        if (setting.style === option)
            return <button className="button-activate" key={idx}>{option}</button>;
        else
            return <button key={idx}>{option}</button>;
    });

    return (
        <div className="sidenav">
            <div className="dropdown">
                <button className="dropbtn">Difficulty</button>
                <div className="dropdown-content">
                    {buttonDifficulty}
                </div>
            </div>
            <div className="dropdown">
                <button className="dropbtn">Style</button>
                <div className="dropdown-content">
                    {buttonStyle}
                </div>

            </div>
            {player}
        </div>
    )
}

export default App;
