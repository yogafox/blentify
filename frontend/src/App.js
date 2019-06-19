import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Game from './containers/Game';
import MainPage from './containers/MainPage';
//import logo from './logo.svg';
import './App.css';
import './spotify.css';

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
            console.log(this.state.user);
            this.userSaver(this.state.user, key.record);
            this.setState(()=>({ page : "main" }));
        }
        else if (key.gameStatus === "exit") {
            console.log("exit game");
            this.userSaver(this.state.user, key.record);

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

    logoutClick = () => {
        localStorage.removeItem('session');
        localStorage.removeItem('expire');
        this.setState(() => ({
          status: "logout",
          page: "welcome"
        }));
    }

    loginClick = () => {
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
            console.log(access_token);
            this.setState(() => ({
                session: access_token,
                page: "main"
            }));
            localStorage.setItem('expire', new Date().getTime());
            localStorage.setItem('session', access_token);   // TODO: check necessarility
        };
    };
    mainPageOnClick = () => {
        // Todo
        // Change this.page to make game call gameStatusReceiver
        this.setState(() => ({page : "main"}));
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

    constructor(props) {
        super(props);
        let settingString = JSON.stringify(defaultSetting);
        this.state = {
            page: "welcome",
            user: "none",
            status: "logout",
            palette: [],
            setting: settingString,
            record: "",
            session: null    // TODO
        };
    }

    componentWillMount() {
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
    }

    componentWillUpdate() {
        var time = new Date().getTime();
        if (time - (localStorage.getItem('expire') || time) > 3600000) {
            this.logoutClick();
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
        console.log(this.state);
        if (this.state.page === "welcome") {
            return (
                <div>
                  <button className="button-dark" onClick={this.loginClick}>Login</button>
                  <button onClick={this.newGameOnClick}>NewGame</button>
                </div>
            );
        }

        if (this.state.page === "main") {
            return (
                <div>        
                    <MainPage 
                      session={this.state.session}
                      callLogout={this.logoutClick.bind(this)}
                    />
                    <button onClick={this.newGameOnClick}>NewGame</button>
                </div>
            );
        }
        else if (this.state.page === "game") {
            return (
                <div className="App">
                    <button onClick={this.mainPageOnClick}>MainPage</button>
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
/*
    render() {
        return (
            <Router>
                <div>
                  <form action="http://localhost:3001/auth/spotify">
                      <input type="submit" value="Login" />
                  </form>
                  <button>
                    <Link to="/game">New Game</Link>
                  </button>
                </div>

                <Route path="/game" component={this.GameWrap} />
                <Route path="/mainpage" component={MainPage} />
            </Router>
        );
    }*/
}

export default App;
