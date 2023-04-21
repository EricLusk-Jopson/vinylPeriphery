export const getPages = (releasesResponse) => {
  // assumes a pagination url of the form:
  // https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100
  // where the split here isolates the value between page= and &per_page
  return releasesResponse.pagination.urls?.last !== undefined
    ? releasesResponse.pagination.urls?.last?.split(/(\=|\&)/)[2]
    : 1;
};
