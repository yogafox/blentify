import React from 'react';

const Search = ({tracks, selectTrack}) => {
    let listTracks = tracks.map((track, idx) => {
        let explicit = track.explicit? 
            (<div className="track__explicit" key={idx}>
                <span className="label">Explicit</span>
            </div>)
            :
            null;
        let artists = track.artists.map((artist, idx) => (
                <span className="feature" key={idx}>{artist.name}</span>
            ));
        
        return (
            <div className="track" key={idx} id={idx} onClick={selectTrack}>
                <div className="track__art">
                    <img src={track.album.images[2].url} alt={track.album.name} />
                </div>
                <div className="track__number">{idx+1}</div>
                <div className="track__title featured">
                    <span className="title">{track.name}</span>
                    {artists}
                </div>
                {explicit}
            </div>
        );
    });

    return (
        <div className="tracks">
            {listTracks}
        </div>
    );
}

export default Search;