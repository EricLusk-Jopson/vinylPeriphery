export const createArtistRecord = (name, id, pagination, releases, roles) => {
  return {
    name: name,
    id: id,
    pagination: pagination,
    releases: releases,
    roles: roles,
  };
};

const getSearchResult = async (band, album) => {
  return await fetch(
    `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
  ).then((res) => res.json());
};

const getArtistReleases = async (artists) => {
  const output = [];
  await Promise.all(
    [...artists.values()].map(async (artist) => {
      const artistReleases = await fetch(
        `https://api.discogs.com/artists/${artist.id}/releases?page=1&per_page=100`
      )
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
            last: artistReleases.pagination.urls?.last,
          },
          artistReleases.releases,
          artist.roles
        );
        output.push(newArtist);
      }
    })
  );
  console.log(output);
  return output;
};

export const bandReleases = async (band, album) => {
  // searching with input params
  const response = await getSearchResult(band, album);
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
  return await getArtistReleases(artists);
};

export const memberReleases = async (band, album) => {
  console.log("searching for band...");

  // searching with input params
  const response = await getSearchResult(band, album);
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
  return await getArtistReleases(allMembers);
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
  return await getArtistReleases(contributors);
};
