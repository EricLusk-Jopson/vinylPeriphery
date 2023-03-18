import { useState, useEffect, React } from "react";

function App() {
  const [results, setResults] = useState([]);
  const [seedRelease, setSeedRelease] = useState({});
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
    console.log("searching for band...");
    const response = await getSearchResult();
    console.log(response);
    console.log(response.results);
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    console.log(release);
    const artists = await Promise.all(
      release.artists.map(async (artist) => {
        return await fetch(artist.resource_url).then((res) => res.json());
      })
    );
    console.log(artists);
    const artistReleases = await Promise.all(
      artists.map(async (artist) => {
        return await fetch(artist.releases_url).then((res) => res.json());
      })
    );
    console.log(artistReleases);
  };

  const memberReleases = async (band) => {
    console.log("searching for band...");
  };

  const albumContributorReleases = async (band, album) => {
    console.log("searching for album...");
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
    setSeedRelease(release);
    setResults([...sortedResults.entries()]);
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

  useEffect(() => {
    const filteredResults = excludeArtist
      ? results.filter((res) => {
          return (
            res[1].artist !== seedRelease.artists_sort &&
            !seedRelease.artists.some((artist) => artist.name === res[1].artist)
          );
        })
      : results;
    setDisplayResults(filteredResults);
    console.log(excludeArtist);
  }, [results, excludeArtist]);

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
      <button onClick={bandReleases}>artist</button>
      <button onClick={memberReleases}>members</button>
      <button onClick={albumContributorReleases}>contributors</button>
      <div>
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
      </div>
    </div>
  );
}

export default App;
