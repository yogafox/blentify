import React from 'react';
import Map from './Map';
import Time from './Time';
import Tile from './Tile';

import html2canvas from 'html2canvas';
import PropTypes from 'prop-types';

const randomInt = function (base, top) {
    // return a integer with value in [base, top]
    return Math.floor(Math.random() * (top - base + 1)) + base;
};
const randomChoice = function (array) {
    return array[Math.floor(array.length * Math.random())];
};

const copyMatrix = function (matrix) {
    let newMatrix = [];
    for (let i = 0; i < matrix.length; i++)
        newMatrix[i] = matrix[i].slice();
    return newMatrix;
};

class Game extends React.Component {
    MAX_DIFFICULTY = 3;

    diffToType = (difficulty) => {
        return randomChoice(Map.diffTypeMap[difficulty]);
    };
    timeCommanderRecv = (key) => {
        this.timeCommander = key.callback;
    };
    timeReceiver = (key) => {
        this.time = key.time;
        this.setState({time : key.time});
    };
    recordSaver = (type) => {
        console.log("saving record");
        let record = {
            map: this.map,
            time: this.timeCommander(),
            history: this.record
        };
        let recordString = JSON.stringify(record);
        let key = {
            gameStatus: type,
            record: recordString,
            playedAlbum: this.props.playingAlbum,
            playedImg: this.props.playingImg
        };
        this.gameStatusSender(key);
    };
    checkAnswer = function () {
        for (let id = 0; id < this.map.tileCount; id++) {
            let row = this.map.idToMap[id][0],
                column = this.map.idToMap[id][1],
                tileColor = this.now.ground[row][column],
                answerColor = this.map.idToColor[id];
            if (!Map.sameColor(tileColor, answerColor)) {
                return;
            }
        }
        console.log("win");
        this.recordSaver("end");
    };
    exchange = function (keyA, keyB) {
        let backKeyA = {
            status : keyB.status,
            place : keyA.place,
            id : keyA.id,
            color : keyB.color
        };
        keyA.callback(backKeyA);
        let backKeyB = {
            status : keyA.status,
            place : keyB.place,
            id : keyB.id,
            color : keyA.color
        };
        keyB.callback(backKeyB);
        let placeA = keyA.place,
            idA = keyA.id,
            placeB = keyB.place,
            idB = keyB.id;
        let candidate = this.now.candidate.slice(),
            candidateStatus = this.now.candidateStatus.slice(),
            ground = copyMatrix(this.now.ground),
            groundStatus = copyMatrix(this.now.groundStatus);
            console.log("exchange", placeA, idA, placeB, idB);
        if (placeA === "Candidate" && placeB === "Candidate") {
            let tempColor = candidate[idA].slice(),
                tempStatus = candidateStatus[idA];
            candidate[idA] = candidate[idB].slice();
            candidateStatus[idA] = candidateStatus[idB];
            candidate[idB] = tempColor.slice();
            candidateStatus[idB] = tempStatus;
        } else if (placeA === "Candidate" && placeB === "Ground") {
            let rowB = this.map.idToMap[idB][0],
                columnB = this.map.idToMap[idB][1],
                tempColor = candidate[idA].slice(),
                tempStatus = candidateStatus[idA];
            candidate[idA] = ground[rowB][columnB].slice();
            candidateStatus[idA] = groundStatus[rowB][columnB];
            ground[rowB][columnB] = tempColor.slice();
            groundStatus[rowB][columnB] = tempStatus;
        } else if (placeA === "Ground" && placeB === "Candidate") {
            let rowA = this.map.idToMap[idA][0],
                columnA = this.map.idToMap[idA][1],
                tempColor = ground[rowA][columnA].slice(),
                tempStatus = groundStatus[rowA][columnA];
            ground[rowA][columnA] = candidate[idB].slice();
            groundStatus[rowA][columnA] = candidateStatus[idB];
            candidate[idB] = tempColor.slice();
            candidateStatus[idB] = tempStatus;
        } else if (placeA === "Ground" && placeB === "Ground") {
            let rowA = this.map.idToMap[idA][0],
                columnA = this.map.idToMap[idA][1],
                rowB = this.map.idToMap[idB][0],
                columnB = this.map.idToMap[idB][1],
                tempColor = ground[rowA][columnA].slice(),
                tempStatus = groundStatus[rowA][columnA];
            ground[rowA][columnA] = ground[rowB][columnB].slice();
            groundStatus[rowA][columnA] = groundStatus[rowB][columnB];
            ground[rowB][columnB] = tempColor.slice();
            groundStatus[rowB][columnB] = tempStatus;
        }
        let now = {
            "candidate": candidate.slice(),
            "candidateStatus": candidateStatus.slice(),
            "ground": copyMatrix(ground),
            "groundStatus": copyMatrix(groundStatus),
            "originKeyA": keyA,
            "originKeyB": keyB
        };
        this.now = now;
        if (this.maxRecordPlace === this.recordPlace) {
            this.recordPlace++;
            this.maxRecordPlace++;
            this.record.push(Object.assign({}, now));
        }
        else {
            this.recordPlace++;
            this.record[this.recordPlace] = Object.assign({}, now);
            while (this.maxRecordPlace > this.recordPlace) {
                this.record.pop();
                this.maxRecordPlace--;
            }
        }
        console.log(this.record);
        console.log();
    };
    tileOnClick(key) {
        if (this.state.selected !== "none") {
            this.exchange(this.state.selected, key);
            this.setState(()=>({selected: "none"}));
        } else {
            this.setState(()=>({selected: key}));
        }
        this.checkAnswer();
    };
    prevOnClick = () => {
        if (this.recordPlace > 0) {
            let prevAction = this.record[this.recordPlace];
            let newBackKeyA = {
                status : prevAction.originKeyA.status,
                place : prevAction.originKeyA.place,
                id : prevAction.originKeyA.id,
                color : prevAction.originKeyA.color
            };
            let newBackKeyB = {
                status : prevAction.originKeyB.status,
                place : prevAction.originKeyB.place,
                id : prevAction.originKeyB.id,
                color : prevAction.originKeyB.color
            };
            prevAction.originKeyA.callback(newBackKeyA);
            prevAction.originKeyB.callback(newBackKeyB);
            this.recordPlace--;
            this.now = this.record[this.recordPlace];
        }
    };
    nextOnClick = () => {
        if (this.recordPlace < this.maxRecordPlace) {
            this.recordPlace++;
            let nextAction = this.record[this.recordPlace];
            let newBackKeyA = {
                status : nextAction.originKeyB.status,
                place : nextAction.originKeyA.place,
                id : nextAction.originKeyA.id,
                color : nextAction.originKeyB.color
            };
            let newBackKeyB = {
                status : nextAction.originKeyA.status,
                place : nextAction.originKeyB.place,
                id : nextAction.originKeyB.id,
                color : nextAction.originKeyA.color
            };
            nextAction.originKeyA.callback(newBackKeyA);
            nextAction.originKeyB.callback(newBackKeyB);
            this.now = this.record[this.recordPlace];
        }
    };
    resetOnClick = () => {
        while (this.recordPlace < this.maxRecordPlace) {
            this.nextOnClick();
        }
        while (this.recordPlace > 0) {
            this.prevOnClick();
            this.record.pop();
        }
        this.maxRecordPlace = 0;
    };
    // hintOnClick = () => {
    //     let hintId = randomInt(0, this.map.tileCount-1),
    //         hintRow = this.map.idToMap[hintId][0],
    //         hintColumn = this.map.idToMap[hintId][1],
    //         hintIdAnswer = this.map.idToColor[hintId],
    //         groundHolder = this.now.ground[hintRow][hintColumn],
    //         hintStatus = this.now.groundStatus[hintRow][hintColumn];
    //     while (hintStatus === "Lock") {
    //         hintId = randomInt(0, this.map.tileCount-1);
    //         hintRow = this.map.idToMap[hintId][0];
    //         hintColumn = this.map.idToMap[hintId][1];
    //         hintIdAnswer = this.map.idToColor[hintId];
    //         groundHolder = this.now.ground[hintRow][hintColumn];
    //         hintStatus = this.now.groundStatus[hintRow][hintColumn];
    //     }
    //     if (Map.sameColor(hintIdAnswer, groundHolder)) {
    //         this.now.groundStatus[hintRow][hintColumn] = "Lock";
    //     } else {
    //
    //     }
    // };
    captureOnClick = () => {
        // let groundRows = document.getElementsByClassName("Answer");
        // for (let i = 0, size = groundRows.length; i < size; i++) {
        //     html2canvas(groundRows[i]).then(function(canvas) {
        //         groundRows[i].appendChild(canvas);
        //     });
        // }
    };
    answerOnClick = () => {
        let removeAnswer = !this.state.removeAnswer;
        this.setState(() => ({
            removeAnswer : removeAnswer
        }));
    };
    constructor(props) {
        super(props);
        this.gameStatusSender = this.props.callRecv;
        this.props.gameCommanderRecv({callback: this.recordSaver.bind(this)});
    }
    componentWillMount() {
        console.log(this.props);
        this.setState(() => ({
            selected : "none",
            time : 0,
            removeCandidate : false,
            removeGround : false,
            removeAnswer : true
        }));
        this.setting = JSON.parse(this.props.setting);
        if (this.props.record !== "") {
            // Recorded Game
            let record = JSON.parse(this.props.record);

            console.log(record);
        }
        else {
            // New Game
            this.difficulty = (this.setting.difficulty === 0) ?
                randomInt(1, this.MAX_DIFFICULTY) : this.setting.difficulty;
            this.type = this.diffToType(this.difficulty);
            this.map = new Map(this.type, this.props.palette);
            this.record = [];
            let now = {
                "candidate": this.map.initCandidate.slice(),
                "candidateStatus": this.map.candidateStatus.slice(),
                "ground": copyMatrix(this.map.initGround),
                "groundStatus": copyMatrix(this.map.initGroundStatus)
            };
            let recordNow = Object.assign({}, now);
            this.now = now;
            this.record.push(recordNow);
            this.recordPlace = 0;
            this.maxRecordPlace = 0;
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        let newSetting = nextProps.setting;

    }

    componentWillUnmount() {
        this.recordSaver("exit");
    }
    makeTiles = () => {
        let candidateTile = [],
            groundTile = [],
            answerTile = [];
        for (let row = 0, id = 0; row < this.map.candidateRowCount; row++) {
            let rowTiles = [];
            for (let column = 0; column < 9; column++, id++) {
                rowTiles.push(<Tile
                    status={this.now.candidateStatus[id]}
                    place={"Candidate"}
                    id={+id}
                    color={this.now.candidate[id]}
                    tileOnClick={this.tileOnClick.bind(this)}
                    key={column}
                />);
            }
            candidateTile.push(<div className="CandidateRow"
                                    children={rowTiles}
                                    key={row}
            />);
        }
        for (let row = 0; row < this.map.height; row++) {
            let rowTiles = [];
            for (let column = 0; column < this.map.width; column++) {
                rowTiles.push(<Tile
                    status={this.now.groundStatus[row][column]}
                    place={"Ground"}
                    id={+this.map.mapToId[row][column]}
                    color={this.now.ground[row][column]}
                    tileOnClick={this.tileOnClick.bind(this)}
                    key={column}
                />)
            }
            groundTile.push(<div className="GroundRow"
                                 children={rowTiles}
                                 key={row}

            />);
        }
        for (let row = 0; row < this.map.height; row++) {
            let rowTiles = [];
            for (let column = 0; column < this.map.width; column++) {
                rowTiles.push(<Tile
                    status={this.map.mapStatus[row][column]}
                    place={"Answer"}
                    id={+this.map.mapToId[row][column]}
                    color={this.map.mapAnswer[row][column]}
                    tileOnClick={this.tileOnClick.bind(this)}
                    key={column}
                />)
            }
            answerTile.push(<div className="AnswerRow"
                                 children={rowTiles}
                                 key={row}
            />);
        }
        this.candidateTile = candidateTile;
        this.groundTile = groundTile;
        this.answerTile = answerTile;
    };
    render() {
        this.makeTiles();
        return (
            <div className="Game">
                <div className="GameTop">
                    <button onClick={this.prevOnClick}>Prev</button>
                    <Time initTime={+this.state.time}
                          callRecv={this.timeReceiver.bind(this)}
                          timeCommanderRecv = {this.timeCommanderRecv.bind(this)}
                    />
                    <button onClick={this.nextOnClick}>Next</button>
                </div>
                <div className="Candidate">
                    {this.state.removeCandidate ? null : this.candidateTile}
                </div>
                <div className="Ground">
                    {this.state.removeGround ? null : this.groundTile}
                </div>
                <div className="Answer">
                    {this.state.removeAnswer ? null : this.answerTile}
                </div>
                <div className="GameBottom">
                    <button onClick={this.captureOnClick}>Capture</button>
                    <button onClick={this.resetOnClick}>Reset</button>
                    {/*<button onClick={this.hintOnClick}>Hint</button>*/}
                    <button onClick={this.answerOnClick}>Answer</button>
                </div>

            </div>
        );
    }
    componentDidMount() {

    }

}

Game.propTypes = {
    palette: PropTypes.array,
    setting: PropTypes.string,
    record: PropTypes.string,
    callRecv: PropTypes.func,
    playingAlbum: PropTypes.string,
    playingImg: PropTypes.element,
    gameCommanderRecv: PropTypes.func
};

export default Game;
