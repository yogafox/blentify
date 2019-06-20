import React from 'react';
import Pool from './Pool';

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "browse"
        }
    }

    render() {
        let page = this.state.status === "browse"? <Pool />:<Search tracks={this.props.tracks}/>;

        return (
            <div>
                {page}
            </div>
        );
    }
}

const Search = ({tracks}) => {
    if (tracks) {
        console.log(tracks[0]);
    }
    return (null);
}

export default MainPage;