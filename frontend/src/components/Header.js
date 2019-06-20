import React from 'react';

export default ({user, callLogout, callMainPage, callSearch}) => {
    let userBar = !user? null:
    (<div className="user">
        <div className="user__info vertical-align">
            <span className="user__info__img">
                <img src={user.img} className="img-responsive" />
            </span>
            <span className="user__info__name container">
                <span className="first">{user.name}</span>
            </span>
        </div>
        
        <div>
            <button onClick={callLogout}>
                <div className="vertical-align">
                    <ion-icon name="log-out"></ion-icon>
                    <p className="container">logout</p>
                </div>
            </button>
        </div>
    </div>);

    return (
        <section className="header">
            <div className="page-flows">
                <span className="flow" onClick={callMainPage}>
                    <ion-icon name="home"></ion-icon>
                </span>
            </div>
        
            <div className="search vertical-align">
                <input type="text" size="25" placeholder="Search by song name" onKeyDown={callSearch}/>
                <button id="search" onClick={callSearch}><ion-icon name="search"></ion-icon></button>
            </div>
            {userBar}
        </section>
    );
};