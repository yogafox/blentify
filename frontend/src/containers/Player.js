import React from 'react';

const Player = ({track_url, height}) => {
    let pos = track_url.indexOf("/track");
    let track_embed_url = track_url.slice(0, pos) + '/embed' + track_url.slice(pos);
    console.log(track_embed_url);

    return (
        <div class="bottom">
            <iframe 
                src={track_embed_url} 
                height={height} 
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media" />
        </div>
    );

}

export default Player;