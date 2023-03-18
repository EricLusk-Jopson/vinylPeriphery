import { useState, useEffect, React } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
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
    };
    await Promise.all(
      artists.map(async (artist) => {
        console.log("looking at page " + currentPage + "for " + artist.name);
        const artistReleases = await fetch(
          artist.releases_url + `?page=1&per_page=100`
        )
          .then((res) => res.json())
          .catch((err) => console.log(err.json()));
        // console.log(...artistReleases.releases);
        console.log(artistReleases);

        if (artistReleases.releases && artistReleases.pagination) {
          output.pagination.push({
            prev: artistReleases.pagination.urls?.prev,
            next: artistReleases.pagination.urls?.next,
          });
          output.results.push(...artistReleases.releases);
        }
      })
    );
    console.log(output);
    return output;
  };

  const memberReleases = async (band) => {
    console.log("searching for band...");
  };

  const albumContributorReleases = async (band, album) => {
    console.log("searching for album...");
  };

  const loadMore = async (relation) => {
    const searchURLs = [];
    const output = {
      results: [],
      pagination: [],
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
          output.results.push(...artistReleases.releases);
        }
      })
    );
    return output;
  };

  const getInfo = async (band, album) => {
    // return the search results
    console.log("searching for album");
    const searchResult = await fetch(
      `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
    ).then((res) => res.json());

    console.log(searchResult);
    console.log(searchResult.results[0].resource_url);
    let release;
    // locate a release record with artist credits
    for (let i = 0; i < 5; i++) {
      const nextRelease = await fetch(
        searchResult.results[i].resource_url
      ).then((res) => res.json());
      console.log(i, nextRelease);
      if (nextRelease.extraartists && nextRelease.extraartists.length > 0) {
        release = nextRelease;
        break;
      }
      release = nextRelease;
    }
    console.log(release);
    console.log(release.extraartists);

    const contributors = new Set();
    const contributorInfo = new Map();

    // must look up artists and add their members to the list of contributors
    await Promise.all(
      release.artists.map(async (artist) => {
        contributors.add(artist.id);
        contributorInfo.set(artist.id, {
          name: artist.name,
          role: artist.role,
        });
        const artistInfo = await fetch(artist.resource_url).then((res) =>
          res.json()
        );

        artistInfo.members?.forEach((member) => {
          contributors.add(member.id);
          contributorInfo.set(member.id, {
            name: member.name,
            role: "Band Member",
          });
        });
        console.log(artistInfo);
      })
    );

    release.extraartists.forEach((extraArtist) => {
      if (
        !extraArtist.role.includes("Management") &&
        !extraArtist.role.includes("Photo") &&
        !extraArtist.role.includes("Translated") &&
        !extraArtist.role.includes("Art") &&
        !extraArtist.role.includes("Master")
      ) {
        contributors.add(extraArtist.id);
        contributorInfo.set(extraArtist.id, {
          name: extraArtist.name,
          role: extraArtist.role,
        });
      }
    });

    console.log(contributors);
    console.log(contributorInfo);
    console.log(contributors.values());

    const contributorReleases = [];
    await Promise.all(
      [...contributors.values()].map(async (artist_id) => {
        const releases = await fetch(
          `https://api.discogs.com/artists/${artist_id}/releases?page=1&per_page=100`
        ).then((res) => res.json());
        contributorReleases.push({
          name: contributorInfo.get(artist_id).name,
          role: contributorInfo.get(artist_id).role,
          releases: releases.releases,
        });
        console.log(releases);
        console.log(contributorReleases);
        console.log(contributorReleases);
      })
    );

    console.log(contributorReleases);
    const releaseWeights = new Map();
    contributorReleases.forEach((contributor) => {
      contributor.releases.forEach((release) => {
        console.log(
          "id: ",
          release.id,
          ", inc: ",
          releaseWeights.get(release.id)
        );
        // check if release has a main_release
        const currentRelease = releaseWeights.get(release.id);
        if (currentRelease) {
          if (
            !currentRelease.members.some(
              (member) => member.name === contributor.name
            )
          ) {
            const currentWeight = currentRelease.weight;
            const currentMembers = [...currentRelease.members];
            releaseWeights.set(release.id, {
              ...currentRelease,
              weight: currentWeight + 1,
              members: [
                ...currentMembers,
                { name: contributor.name, role: contributor.role },
              ],
            });
          }
        } else {
          const release_id = release.main_release
            ? release.main_release
            : release.id;
          releaseWeights.set(release.id, {
            mainRelease: release_id,
            weight: 1,
            artist: release.artist,
            title: release.title,
            members: [{ name: contributor.name, role: contributor.role }],
          });
        }
      });
    });

    console.log(releaseWeights);
    const sortedResults = new Map(
      [...releaseWeights.entries()].sort(
        (a, b) => b[1]["weight"] - a[1]["weight"]
      )
    );
    console.log(sortedResults);
    console.log([...sortedResults.entries()]);
    // setSeedRelease(release);
    // setResults([...sortedResults.entries()]);
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

  const onSubmit = (e) => {
    e.preventDefault();
    getInfo(band, album);
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
    console.log(currentPage);
  }, [data]);

  useEffect(() => {
    console.log(currentPage);
  }, [currentPage]);

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
      <form onSubmit={onSubmit}>
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
        <button>get Info</button>
      </form>
      <label>Exlude listings by the same artist</label>
      <input
        type="checkbox"
        defaultChecked
        checked={excludeArtist}
        onChange={toggleArtistExclusion}
      ></input>
      <button onClick={getBandReleases}>artist</button>
      <button onClick={memberReleases}>members</button>
      <button onClick={albumContributorReleases}>contributors</button>
      <div>
        {data.results &&
          data.results.map((result) => (
            <>
              <p>
                {result.artist} - {result.title}
              </p>
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
      {/* <div>
        {displayResults.map((result) => (
          <>
            <span></span>
            <p>
              {result[1].artist} - {result[1].title} featuring{" "}
              {result[1].members
                .map((member) => `${member.name} (${member.role})`)
                .join(", ")}
            </p>
          </>
        ))}
      </div> */}
    </div>
  );
}

export default App;
