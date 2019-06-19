import React from 'react';

import Pool from './Pool';

class MainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "browse"
        }
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
        let page = this.state.status === "browse"? <Pool />:<Search />;
        return (
            <div>
                <section className="header">
                    <div className="page-flows">
                        <span className="flow">
                            <ion-icon name="home"></ion-icon>
                        </span>
                    </div>
                    
                    <div className="search vertical-align">
                        <input type="text" placeholder="Search" className="container"/>
                        <ion-icon name="search"></ion-icon>
                    </div>
                    
                    <div className="user">
                        <div className="user__info">
                            <span className="user__info__img">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/7022/adam_proPic.jpg" alt="Profile Picture" className="img-responsive" />
                            </span>
                            <span className="user__info__name">
                                <span className="first">Adam</span>
                                <span className="last">Lowenthal</span>
                            </span>
                        </div>
                        
                        <div>
                            <button onClick={this.props.callLogout}>
                                <div className="vertical-align">
                                    <ion-icon name="log-out"></ion-icon>
                                    <p className="container">logout</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                {page}
            </div>
        );
    }
}

const Search = () => {
    return ;
}

export default MainPage;