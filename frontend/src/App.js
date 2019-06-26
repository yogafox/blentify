import React from 'react';
import axios from 'axios';
import ColorThief from 'color-thief';

import Modal from './module/modal';

import Game from './containers/Game';
import MainPage from './containers/MainPage';
import Pool from './containers/Pool';
import Search from './containers/Search';
import Header from './components/Header';
//import logo from './logo.svg';
import './css/App.css';
import './css/spotify.css';
import './css/modal.css';

const APP_HOST = "http://localhost";
const APP_API_PORT = 3001;
const APP_CLIENT_PORT = 3000;

let palette = [[123, 123, 123], [123, 222, 234]]; // An array of RGB color

let defaultSetting = {
    style: "default",
    difficulty: +0 // [0, 3], 0 means random
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
            this.setState(()=>({ page : "main" }));
        }
        else if (key.gameStatus === "save") {
            // Todo: send recorded data string to DB
            console.log("save game");
            console.log(this.state.user.id);
            this.userSaver(this.state.user.id, key.record);
            this.setState(()=>({ page : "main" }));
        }
        else if (key.gameStatus === "exit") {
            console.log("exit game");
            this.userSaver(this.state.user.id, key.record);

        }
    };
    userGameDeleter = () => {
        // Todo
    };
    userSaver = (user, gameRecord) => {
        let data = {
            user: user,
            image: "An Image Object",
            record: gameRecord
        };
        let message = JSON.stringify(data);
        this.putDataToDB(user, message);
    };
    userLoader = (user) => {
        let userGames = [];
        for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i].user === user) {
                let game = this.state.data[i].message;
                userGames.push(game);
            }
        }
        this.setState(() => ({userGames : userGames}));
    };
    setStyleOnClick = () => {
        // Todo
    };
    setDifficultyOnClick = () => {
        // Todo
    };
    settingOnClick = () => {
        // Todo
        // Render Setting Menu && set setting state && refresh settingString
    };

    getSpotifyURL = ({ client_id, scopes, redirect_uri }) => {
        return 'https://accounts.spotify.com/authorize?' + 
              'client_id=' + client_id + 
              '&scopes=' + encodeURIComponent(scopes.join(' ')) + 
              '&redirect_uri=' + encodeURIComponent(redirect_uri) + 
              '&response_type=token';
    }

    logoutOnClick = () => {
        localStorage.removeItem('session');
        localStorage.removeItem('expire');
        this.setState(() => ({
          status: "logout",
          page: "welcome"
        }));
    }

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
    mainPageOnClick = () => {
        // Todo
        // Change this.page to make game call gameStatusReceiver
        this.setState(() => ({
            page : "main",
            search: false
        }));
    };
    newGameOnClick = () => {
        if (this.state.status === "logout") {
            this.setState(() => ({palette : [],
                                        record : ""}));
        }
        this.setState(() => ({page : "game"}));
    };
    gameLoaderOnClick = (event) => {
        let nextGameTarget = event.target;
        // Todo
    };
    searchOnClick = async (event) => {
        if (event.keyCode === 13 || event.keyCode === undefined) {
            console.log(event.target.parentNode.parentNode);
            let input = event.keyCode === 13? event.target:event.target.parentNode.parentNode.childNodes[0];
            await this.searchSpotify(input.value);
        }
    };
    trackOnClick = (event) => {
        let track = event.target;
        Modal.confirm({
            title: 'Confirm Dialog',
            message: 'Create a new game with ' + track.childNodes[2].childNodes[0].innerText,
            buttonClass: 'green',
            onConfirm: () => {
                this.playTrack(track);
                this.setState(() => ({
                    page: "game"
                }));
            }
          });
    };

    playTrack = (track) => {
        let img = track.childNodes[0].childNodes[0];
        let imgUrl = this.state.tracks[track.id].album.images[0].url;
        this.getPalette(imgUrl);
        // TODO: play the track
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
                        tracks: data.tracks.items,
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
        let img = new Image();
        img.onload = () => {
            this.playingImg = img;
            this.playingPalette = this.colorThief.getPalette(img);
            //console.log(this.playingPalette);
        };
        img.crossOrigin = 'Anonymous';
        img.src = sourceImageUrl;
    }

    constructor(props) {
        super(props);
        let settingString = JSON.stringify(defaultSetting);

        this.colorThief = new ColorThief();
        this.state = {
            page: "welcome",
            status: "logout",
            palette: [],
            setting: settingString,
            record: "",
            session: null,    // TODO
            user: {
                id: 0,                  // unique
                name: null,    // not guaranteed to be unique
                img: null
            },
            tracks: null,
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
        axios.post(APP_HOST + ':' + APP_API_PORT + '/api/putDataToken', {
            token: user,
            message: message,
        });
    };
        
    render() {
        if (this.state.page === "welcome") {
            return (
                <div>
                    <Header page={this.state.page}
                            callLogout={this.logoutOnClick.bind(this)} 
                            callMainPage={this.mainPageOnClick.bind(this)} />
                    <button className="button-dark" onClick={this.loginOnClick}>Login</button>
                    <button onClick={this.newGameOnClick}>NewGame</button>
                </div>
            );
        }

        if (this.state.page === "main") {
            let page = this.state.search? 
                <Search tracks={this.state.tracks}
                        selectTrack={this.trackOnClick.bind(this)}/>
                :
                <Pool />;
            return (
                <div>     
                    <Header user={this.state.user}
                            page={this.state.page}
                            callLogout={this.logoutOnClick.bind(this)} 
                            callMainPage={this.mainPageOnClick.bind(this)} 
                            callSearch={this.searchOnClick}
                    />   
                    {page}
                    <button onClick={this.newGameOnClick}>NewGame</button>
                </div>
            );
        }
        else if (this.state.page === "game") {
            return (
                <div className="App">
                    <Header user={this.state.user}
                            page={this.state.page}
                            callLogout={this.logoutOnClick.bind(this)}
                            callMainPage={this.mainPageOnClick.bind(this)} 
                            callSearch={this.searchOnClick}
                    /> 
                    <Game palette={this.state.palette}
                          setting={this.state.setting}
                          record={this.state.record}
                          callRecv={this.gameStatusReceiver.bind(this)}
                    />
                </div>
            );
        }
        else if (this.state.page === "") {

        }
    }
}

export default App;
