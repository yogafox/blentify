import React from 'react';
import queryString from 'query-string'



class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            access_token: null,
            refresh_token: null,
            expire: null
        }
    }

    componentWillMount() {
        console.log(this.props.location);
        const values = queryString.parse(this.props.location.search);
        console.log(values);
        if (values.access_token) {
            this.setAccessToken(values);
        }
        this.getAccessToken();
    }

    setAccessToken = (values) => {
        console.log(values.access_token);
        localStorage.setItem('access_token', values.access_token);
        localStorage.setItem('refresh_token', values.refresh_token);
        localStorage.setItem('expire', (new Date()).getTime() + values.expire);

        fetch("http://localhost:3001/api/spotify/setToken", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ access_token: values.access_token }),
        }).then(function(res) {
            fetch("http://localhost:3001/api/spotify/search", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: "Love" }),
            })
        }, function(err) {})
    }

    getAccessToken = () => {
        this.setState(() => ({
            access_token: localStorage.getItem('access_token'),
            refresh_token: localStorage.getItem('refresh_token'),
            expire: localStorage.getItem('expire')
        }));
    }

    render() {
        return (<p>{this.state.access_token}</p>);
    }
}

export default MainPage;