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

let exampleSetting = {
    style: "default",
    difficulty: "Integer", // [0, 3], 0 means random
};

let recordString = JSON.stringify(exampleRecord),
    settingString = JSON.stringify(exampleSetting);

class App extends React.Component {
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

    render() {
        return (
            <div className="App">
                <Game user={"testABC"}
                      palette={palette}
                      setting={settingString}
                      record={recordString}
                      callRecv={this.gameStatusReceiver.bind(this)}
                />
            </div>
        );
    }
}

export default App;
