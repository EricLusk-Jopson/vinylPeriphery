export const createArtistRecord = (name, id, pages, releases, roles) => {
  return {
    name: name,
    id: id,
    pages: pages,
    releases: releases,
    roles: roles,
  };
};

export const getSearchResult = async (band, album) => {
  return await fetch(
    `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
  ).then((res) => res.json());
};

export const fetchAndWait = async (url, delay) => {
  const result = await fetch(url).then((res) => res.json());
  await new Promise((resolve) => setTimeout(resolve, delay));
  return result;
};
