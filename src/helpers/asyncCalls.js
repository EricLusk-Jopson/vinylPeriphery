const callLimit = 22;
const quickDelay = 0;
const longDelay = 3200;

export const createArtistRecord = (name, id, pagination, releases, roles) => {
  return {
    name: name,
    id: id,
    pagination: pagination,
    releases: releases,
    roles: roles,
  };
};

const getSearchResult = async (band, album, callCount) => {
  return await fetch(
    `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
  ).then((res) => res.json());
};

const getArtists = async (release, fastSearch, callCount) => {
  const delay = fastSearch ? quickDelay : longDelay;
  let currentCount = callCount;

  const output = [];

  // for every artist recorded in the response
  for (const artist of release.artists) {
    if (fastSearch && currentCount >= callLimit - 2) break;
    console.log(`searching for artist ${artist.name}...`);

    try {
      // fetch their information
      const artistResponse = await fetch(artist.resource_url).then((res) =>
        res.json()
      );
      currentCount++;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // fetch their releases
      const releasesResponse = await fetch(
        `https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100`
      ).then((res) => res.json());
      currentCount++;
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (
        releasesResponse &&
        releasesResponse.releases &&
        releasesResponse.pagination
      ) {
        const newArtist = createArtistRecord(
          artist.name,
          artist.id,
          {
            prev: releasesResponse.pagination.urls?.prev,
            next: releasesResponse.pagination.urls?.next,
            last: releasesResponse.pagination.urls?.last,
          },
          releasesResponse.releases,
          artist.roles ?? [""]
        );
        output.push(newArtist);
      }

      console.log(output);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }
  return output;
};

const getMembers = async (release, fastSearch, callCount) => {
  const delay = fastSearch ? quickDelay : longDelay;
  let currentCount = callCount;
  const output = [];

  // for every artist recorded in the response
  for (const artist of release.artists) {
    if (fastSearch && currentCount >= callLimit) break;
    console.log(`searching for artist ${artist.name}...`);

    try {
      // fetch their information and count++
      const artistResponse = await fetch(artist.resource_url).then((res) =>
        res.json()
      );
      currentCount++;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // determine if they have members
      if (artistResponse.hasOwnProperty("members")) {
        // for each member in the band
        for (const member of artistResponse.members) {
          if (fastSearch && currentCount >= callLimit - 2) break;

          try {
            // fetch their information and count++
            const memberResponse = await fetch(member.resource_url).then(
              (res) => res.json()
            );
            currentCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));

            // fetch their releases and count++
            const memberReleasesResponse = await fetch(
              `https://api.discogs.com/artists/${memberResponse.id}/releases?page=1&per_page=100`
            ).then((res) => res.json());
            currentCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));

            // Check that the member release response is properly formatted
            if (
              memberReleasesResponse &&
              memberReleasesResponse.releases &&
              memberReleasesResponse.pagination
            ) {
              // Create a new artist with the member information and add it to the output
              const newArtist = createArtistRecord(
                memberResponse.name,
                memberResponse.id,
                {
                  prev: memberReleasesResponse.pagination.urls?.prev,
                  next: memberReleasesResponse.pagination.urls?.next,
                  last: memberReleasesResponse.pagination.urls?.last,
                },
                memberReleasesResponse.releases,
                memberResponse.roles ?? [""]
              );
              output.push(newArtist);
            }
          } catch (error) {
            console.error(`Error fetching ${member.resource_url}: ${error}`);
          }
        }
      } else {
        // The artist has no members, so we must add the artist
        console.log(`${artist.name} has NO members`);

        // fetch their releases and count++
        const artistReleasesResponse = await fetch(
          `https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100`
        ).then((res) => res.json());
        currentCount++;
        await new Promise((resolve) => setTimeout(resolve, delay));

        if (
          artistReleasesResponse &&
          artistReleasesResponse.releases &&
          artistReleasesResponse.pagination
        ) {
          const newArtist = createArtistRecord(
            artist.name,
            artist.id,
            {
              prev: artistReleasesResponse.pagination.urls?.prev,
              next: artistReleasesResponse.pagination.urls?.next,
              last: artistReleasesResponse.pagination.urls?.last,
            },
            artistReleasesResponse.releases,
            artist.roles ?? [""]
          );
          output.push(newArtist);
        }
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }
  return output;
};

export const bandReleases = async (band, album, fast) => {
  let callCount = 0;
  const searchResponse = await getSearchResult(band, album);
  const release = await fetch(searchResponse.results[0].resource_url).then(
    (res) => res.json()
  );
  const artists = await getArtists(release, fast, callCount);
  console.log(artists);
  return artists;
};

export const memberReleases = async (band, album, fast) => {
  const response = await getSearchResult(band, album);
  const release = await fetch(response.results[0].resource_url).then((res) =>
    res.json()
  );
  const members = await getMembers(release, fast);
  console.log(members);
  return members;
};

export const contributorReleases = async (band, album) => {
  console.log("searching for album...");
  // searching with input params
  const response = await getSearchResult(band, album);
  console.log(response);
  console.log(response.results);

  // fetch the release information for the first result that has an extra artists
  let release;
  for (let i = 0; i < Math.min(5, response.results.length); i++) {
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

  if (!release.extraartists && release.extraartists.length === 0) {
    alert("couldn't locate a list of credited artists for this album :(");
  }
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
  return [];
};

export const loadMore = async (data, relation) => {
  const output = [];
  await Promise.all(
    data.map(async (artist) => {
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
          const newArtist = createArtistRecord(
            artist.name,
            artist.id,
            {
              prev: artistReleases.pagination.urls?.prev,
              next: artistReleases.pagination.urls?.next,
              last: artist.pagination.last,
            },
            artistReleases.releases,
            artist.roles ?? [""]
          );
          output.push(newArtist);
        }
      }
    })
  );
  return output;
};
