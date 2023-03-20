import { useState, useEffect, React } from "react";
import {
  createArtistRecord,
  bandReleases,
  memberReleases,
  contributorReleases,
} from "./helpers/asyncCalls";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [excludeArtist, setExcludeArtist] = useState(true);
  const [formData, setFormData] = useState({
    band: "",
    album: "",
  });
  const { band, album } = formData;

  const consumer_key = "owJjvljKmrcdSbXFVPTu";
  const consumer_secret = "wgJurrmQFbROAyrmByuLrZMRMhDznPaK";
  const search_url = "https://api.discogs.com/database/search?";

  // console.log(process.env.SEARCH_URL);

  const loadMore = async (relation) => {
    const output = [];
    await Promise.all(
      data.map(async (artist) => {
        console.log(artist);
        if (artist.pagination[relation] === undefined) {
          output.push({
            ...artist,
            pagination: {
              ...artist.pagination,
              prev: artist.pagination.last,
              last: artist.pagination.last,
            },
            releases: [],
          });
        } else {
          const artistReleases = await fetch(artist.pagination[relation])
            .then((res) => res.json())
            .catch((err) => console.log(err));
          if (
            artistReleases &&
            artistReleases.releases &&
            artistReleases.pagination
          ) {
            console.log(artistReleases.pagination.urls);
            const newArtist = createArtistRecord(
              artist.name,
              artist.id,
              {
                prev: artistReleases.pagination.urls?.prev,
                next: artistReleases.pagination.urls?.next,
                last: artist.pagination.last,
              },
              artistReleases.releases,
              artist.roles
            );
            output.push(newArtist);
          }
        }
      })
    );

    console.log(output);
    return output;
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleArtistExclusion = (e) => {
    e.preventDefault();
    setExcludeArtist(!excludeArtist);
  };

  const getBandReleases = async () => {
    const releases = await bandReleases(band, album);
    console.log(releases);
    setData(releases);
    // setResults(releases.sort((a, b) => b.id - a.id));
    // setResults(
    //   releases.sort((a, b) => {
    //     if (a.title < b.title) {
    //       return -1;
    //     }
    //     if (a.title > b.title) {
    //       return 1;
    //     }
    //     return 0;
    //   })
    // );
  };

  const getMemberReleases = async () => {
    const releases = await memberReleases(band, album);
    setData(releases);
  };

  const getContributorReleases = async () => {
    const releases = await contributorReleases(band, album);
    setData(releases);
  };

  const loadLast = async () => {
    const moreReleases = await loadMore("prev");
    console.log(moreReleases);
    setData(moreReleases);
  };

  const loadNext = async () => {
    const moreReleases = await loadMore("next");
    console.log(moreReleases);
    setData(moreReleases);
  };

  useEffect(() => {
    console.log(data);
    // const display = data.results.map((result, index) => {
    //   return `${result.artist} - ${result.title} ${
    //     data.roles[index] !== undefined && data.roles[index].join("")
    //   }`;
    // });
    const display = [];
    data.forEach((artist, index) => {
      artist.releases.map((release) => {
        display.push(`${release.artist} - ${release.title} `);
      });
    });
    console.log(data.results);
    setDisplayResults(display);
  }, [data]);

  useEffect(() => {
    console.log(displayResults);
  }, [displayResults]);

  // useEffect(() => {
  //   const filteredResults = excludeArtist
  //     ? results.filter((res) => {
  //         return (
  //           res[1].artist !== seedRelease.artists_sort &&
  //           !seedRelease.artists.some((artist) => artist.name === res[1].artist)
  //         );
  //       })
  //     : results;
  //   setDisplayResults(filteredResults);
  //   console.log(excludeArtist);
  // }, [results, excludeArtist]);

  return (
    <div className="App">
      This will be an excellent application
      <form>
        <input
          type="text"
          name="band"
          value={band}
          placeholder="band name"
          onChange={onChange}
        />
        <input
          type="text"
          name="album"
          value={album}
          placeholder="album name"
          onChange={onChange}
        />
      </form>
      <label>Exlude listings by the same artist</label>
      <input
        type="checkbox"
        defaultChecked
        checked={excludeArtist}
        onChange={toggleArtistExclusion}
      ></input>
      <button onClick={getBandReleases}>artist</button>
      <button onClick={getMemberReleases}>members</button>
      <button onClick={getContributorReleases}>contributors</button>
      <div>
        {displayResults &&
          displayResults.map((result) => (
            <>
              <p>{result}</p>
            </>
          ))}
      </div>
      <button
        disabled={data.every((artist) => artist.pagination.prev === undefined)}
        onClick={loadLast}
      >
        Load Last Page
      </button>
      <button
        disabled={data.every((artist) => artist.pagination.next === undefined)}
        onClick={loadNext}
      >
        Load Next Page
      </button>
    </div>
  );
}

export default App;
