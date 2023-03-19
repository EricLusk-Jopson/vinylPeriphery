import { useState, useEffect, React } from "react";

function App() {
  const [data, setData] = useState({ pagination: [], results: [], roles: [] });
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

  const getSearchResult = async () => {
    return await fetch(
      `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
    ).then((res) => res.json());
  };

  const bandReleases = async () => {
    // searching with input params
    const response = await getSearchResult();
    console.log(response);
    console.log(response.results);

    // fetch the release information for the first result
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    console.log(release);

    // fetch the list of artists
    const artists = await Promise.all(
      release.artists.map(async (artist) => {
        return await fetch(artist.resource_url).then((res) => res.json());
      })
    );
    console.log(artists);

    // for each artist, return their releases
    const output = {
      results: [],
      pagination: [],
      roles: [],
    };
    await Promise.all(
      [...artists.values()].map(async (artist) => {
        console.log(artist);
        console.log(artist.id);
        console.log(artist.roles);
        const artistReleases = await fetch(
          `https://api.discogs.com/artists/${artist.id}/releases?page=1&per_page=100`
        )
          .then((res) => res.json())
          .catch((err) => console.log(err));

        console.log(artistReleases);
        if (
          artistReleases &&
          artistReleases.releases &&
          artistReleases.pagination
        ) {
          output.pagination.push({
            prev: artistReleases.pagination.urls?.prev,
            next: artistReleases.pagination.urls?.next,
          });
          output.results.push(artistReleases.releases);
          output.roles.push(artist.roles);
        }
      })
    );
    console.log(output);
    return output;
  };

  const memberReleases = async (band) => {
    console.log("searching for band...");

    // searching with input params
    const response = await getSearchResult();
    console.log(response);
    console.log(response.results);

    // fetch the release information for the first result
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    console.log(release);

    // fetch the list of artists
    const artists = await Promise.all(
      release.artists.map(async (artist) => {
        return await fetch(artist.resource_url).then((res) => res.json());
      })
    );
    console.log(artists);

    // for each artist get any members
    const allMembers = [];

    await Promise.all(
      artists.map(async (artist) => {
        if (artist.hasOwnProperty("members")) {
          console.log(`${artist.name} has members`);
          return await Promise.all(
            artist.members.map(async (member) => {
              const response = await fetch(member.resource_url).then((res) =>
                res.json()
              );
              allMembers.push(response);
            })
          );
        } else {
          console.log(`${artist.name} has NO members`);
          allMembers.push(artist);
        }
      })
    );
    console.log(allMembers);

    // for each artist, return their releases
    const output = {
      results: [],
      pagination: [],
      roles: [],
    };
    await Promise.all(
      [...allMembers.values()].map(async (member) => {
        console.log(member);
        console.log(member.id);
        console.log(member.roles);
        const memberReleases = await fetch(
          `https://api.discogs.com/artists/${member.id}/releases?page=1&per_page=100`
        )
          .then((res) => res.json())
          .catch((err) => console.log(err));

        console.log(memberReleases);
        if (
          memberReleases &&
          memberReleases.releases &&
          memberReleases.pagination
        ) {
          output.pagination.push({
            prev: memberReleases.pagination.urls?.prev,
            next: memberReleases.pagination.urls?.next,
          });
          output.results.push(memberReleases.releases);
          output.roles.push(member.roles);
        }
      })
    );
    console.log(output);
    return output;
  };

  const contributorReleases = async (band, album) => {
    console.log("searching for album...");
    // searching with input params
    const response = await getSearchResult();
    console.log(response);
    console.log(response.results);

    // fetch the release information for the first result that has an extra artists
    let release;
    for (let i = 0; i < 5; i++) {
      const nextRelease = await fetch(response.results[i].resource_url).then(
        (res) => res.json()
      );
      console.log(i, nextRelease);
      if (nextRelease.extraartists && nextRelease.extraartists.length > 0) {
        release = nextRelease;
        break;
      }
      release = nextRelease;
    }
    console.log(release);
    console.log(release.extraartists);

    // form a collection of relevant contributors and their roles
    const contributors = new Map();
    release.extraartists.forEach((extraArtist) => {
      if (
        !extraArtist.role.includes("Management") &&
        !extraArtist.role.includes("Photo") &&
        !extraArtist.role.includes("Translated") &&
        !extraArtist.role.includes("Art") &&
        !extraArtist.role.includes("Master")
      ) {
        const oldRoles = contributors.has(extraArtist.id)
          ? [...contributors.get(extraArtist.id).roles]
          : [];
        const newRoles = extraArtist.role
          .split(",")
          .map((element) => element.trim());
        contributors.set(extraArtist.id, {
          id: extraArtist.id,
          name: extraArtist.name,
          link: extraArtist.resource_url,
          roles: [...oldRoles, ...newRoles],
        });
      }
    });
    console.log(contributors);

    // for each artist, return their releases
    const output = {
      results: [],
      pagination: [],
      roles: [],
    };
    await Promise.all(
      [...contributors.values()].map(async (contributor) => {
        console.log(contributor);
        console.log(contributor.id);
        console.log(contributor.roles);
        const contributorReleases = await fetch(
          `https://api.discogs.com/artists/${contributor.id}/releases?page=1&per_page=100`
        )
          .then((res) => res.json())
          .catch((err) => console.log(err));

        console.log(contributorReleases);
        if (
          contributorReleases &&
          contributorReleases.releases &&
          contributorReleases.pagination
        ) {
          output.pagination.push({
            prev: contributorReleases.pagination.urls?.prev,
            next: contributorReleases.pagination.urls?.next,
          });
          output.results.push(contributorReleases.releases);
          output.roles.push(contributor.roles);
        }
      })
    );
    console.log(output);
    return output;
  };

  const loadMore = async (relation) => {
    const searchURLs = [];
    const output = {
      results: [],
      pagination: [],
      roles: [],
    };

    data.pagination.forEach((links) => {
      console.log(links[relation]);
      if (links[relation] !== undefined) {
        searchURLs.push(links[relation]);
      }
    });

    await Promise.all(
      searchURLs.map(async (link) => {
        const artistReleases = await fetch(link)
          .then((res) => res.json())
          .catch((err) => console.log(err.json()));

        if (artistReleases.releases && artistReleases.pagination) {
          output.pagination.push({
            prev: artistReleases.pagination.urls?.prev,
            next: artistReleases.pagination.urls?.next,
          });
          output.results.push(artistReleases.releases);
          output.roles.push(artistReleases.roles);
        }
      })
    );
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
    const releases = await bandReleases();
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
    const releases = await memberReleases();
    setData(releases);
  };

  const getContributorReleases = async () => {
    const releases = await contributorReleases();
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
    data.results.forEach((artistReleases, index) => {
      artistReleases.map((release) => {
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
        disabled={data.pagination.every((link) => link.prev === undefined)}
        onClick={loadLast}
      >
        Load Last Page
      </button>
      <button
        disabled={data.pagination.every((link) => link.next === undefined)}
        onClick={loadNext}
      >
        Load Next Page
      </button>
    </div>
  );
}

export default App;
