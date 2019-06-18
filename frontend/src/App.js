import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Game from './containers/Game';
import MainPage from './containers/MainPage';
//import logo from './logo.svg';
import './App.css';

let palette = [[123, 123, 123], [123, 222, 234]]; // An array of RGB color

let exampleRecord = {
    map: "A Map Object",
    time: "Integer",
    history: "Array of moves",
    candidate: "Array of color in place",
    ground: "Array of color in place",
    lock: "Array of locked index",
};

let exampleSetting = {
    style: "default",
    difficulty: "Integer", // [0, 3], 0 means random
};

let recordString = JSON.stringify(exampleRecord),
    settingString = JSON.stringify(exampleSetting);

class App extends React.Component {
    gameStatusReceiver = (key) => {
        // what state should be updated to render main page.
        // this function would be called if the game ended or saved
        // key = {
        //     gameStatus: String,
        //     record: recordString
        // };
        if (key.gameStatus === "Game End") {
            // Todo
        }
        else if (key.gameStatus === "Game Save") {
            // Todo: send recorded data string to DB
            this.userSaver(this.state.user, key.record);
        }
        this.setState(()=>({ status : "MainPage" }));
    };
    userGameDeleter = () => {
        // Todo
    };
    userSaver = (user, gameRecord) => {
        let message = {
            user: user,
            image: "An Image Object",
            record: gameRecord
        };
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
    newGameOnClick = () => {
        let game = (<Game user={"123"}
                          palette={palette}
                          setting={settingString}
                          record={recordString}
                          callRecv={this.gameStatusReceiver.bind(this)}
                    />);
        this.setState(() => ({playing : game}));
    };
    gameLoaderOnClick = () => {
        // Todo
    };

    constructor(props) {
        super(props);
        this.state = { 
          status : "Welcome",
          session: null
        };
    }
    componentWillMount() {
        this.newGameOnClick();
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
        fetch('http://localhost:3001/api/getData')
            .then((data) => data.json())
            .then((res) => this.setState({data: res.data}));
    };

    putDataToDB = (user, message) => {
        axios.post('http://localhost:3001/api/putDataToken', {
            user: user,
            message: message,
        });
    };

    GameWrap = () => {
        return (
            <div className="App">
                {this.state.playing}
            </div>
        );
    }

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
    }
}

export default App;
