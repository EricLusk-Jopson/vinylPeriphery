function App() {
  /*
  // search type release and render results
  // select result and submit get request for release by selected id
  // if not available, alert user and suggest picking a different release from the results
  // if available, display release information
  // display credited artists
  // get request all artist releases
  // add releases ids to set
  // get releases
  // get credited artists
  // calculate proportion of original artists
  // return relases sorted in orer of decreasing proportion
  */

  const album = "nevermind";
  const band = "nirvana";
  const searchURL =
    "https://api.discogs.com/database/search?release_title=nevermind&artist=nirvana&per_page=3&page=1&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK";

  const getInfo = async () => {
    // return the search results
    console.log("searching for album");
    const searchResult = await fetch(
      `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
    ).then((res) => res.json());

    console.log(searchResult);
    console.log(searchResult.results[0].resource_url);

    // look up the first result
    console.log("lookup the first result");
    const release = await fetch(searchResult.results[0].resource_url).then(
      (res) => res.json()
    );
    console.log(release);
    console.log(release.extraartists);

    const contributors = new Set();

    // must look up artists and add their members to the list of contributors
    await Promise.all(
      release.artists.map(async (artist) => {
        contributors.add(artist.id);
        const artistInfo = await fetch(artist.resource_url).then((res) =>
          res.json()
        );

        artistInfo.members.forEach((member) => contributors.add(member.id));
        console.log(artistInfo);
      })
    );

    release.extraartists.forEach((extraArtist) =>
      contributors.add(extraArtist.id)
    );

    console.log(contributors);
    console.log(contributors.values());

    const constributorReleases = [];
    await Promise.all(
      [...contributors.values()].map(async (artist_id) => {
        const releases = await fetch(
          `https://api.discogs.com/artists/${artist_id}/releases`
        ).then((res) => res.json());
        constributorReleases.push(...releases.releases);
        console.log(releases);
        console.log(constributorReleases);
      })
    );

    console.log(constributorReleases);
    const releaseWeights = new Map();
    constributorReleases.forEach((release) => {
      console.log(
        "id: ",
        release.id,
        ", inc: ",
        releaseWeights.get(release.id)
      );
      // check if release has a main_release
      if (releaseWeights.get(release.id)) {
        const currentWeight = releaseWeights.get(release.id).weight;
        releaseWeights.set(release.id, {
          ...releaseWeights.get(release.id),
          weight: currentWeight + 1,
        });
      } else {
        const release_id = release.main_release
          ? release.main_release
          : release.id;
        releaseWeights.set(release.id, {
          mainRelease: release_id,
          weight: 1,
          artist: release.artist,
          title: release.title,
        });
      }
    });

    console.log(releaseWeights);
    const sortedResults = new Map(
      [...releaseWeights.entries()].sort(
        (a, b) => b[1]["weight"] - a[1]["weight"]
      )
    );
    console.log(sortedResults);
  };

  return (
    <div className="App">
      This will be an excellent application
      <button onClick={getInfo}>get Info</button>
    </div>
  );
}

export default App;
