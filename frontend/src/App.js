import React from 'react';
import axios from 'axios';
import Game from './containers/Game';
import logo from './logo.svg';
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
            page: "main",
            user: "none",
            status: "logout",
            palette: [],
            setting: settingString,
            record: ""
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
            token: user,
            message: message,
        });
    };

    render() {
        if (this.state.page === "main") {
            return (
                <button onClick={this.newGameOnClick}>NewGame</button>
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
}

export default App;
