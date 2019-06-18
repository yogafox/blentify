import React from 'react';

class MainPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        this.searchSpotify("傻子與白痴");
    }

    searchSpotify = (key) => {
        const { session } = this.props;
        const params = {
            session: session,
            key: key
        };
        var url = new URL('http://localhost:3001/api/spotify/search');
        url.search = new URLSearchParams(params);
        fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(function(data) {
            console.log(data);
        });
    } 

    render() {
        return (<p>MainPage</p>);
    }
}

export default MainPage;