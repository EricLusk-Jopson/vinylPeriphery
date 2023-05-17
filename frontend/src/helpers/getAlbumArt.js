// TODO: Move this to another file
export const getAlbumArt = async (album, band) => {
  try {
    const musicBrainzUrl = `https://musicbrainz.org/ws/2/release/?query=release:${album.replaceAll(
      " ",
      "%20"
    )}&artist:${band.replaceAll(" ", "%20")}&fmt=json`;
    console.log(musicBrainzUrl);
    const musicBrainzResponse = await fetch(musicBrainzUrl).then((res) =>
      res.json()
    );
    console.log(musicBrainzResponse);
    // TODO filter results that match the album and band
    // TODO iterate through results so that a valid coverArtResponse is found
    if (
      musicBrainzResponse.releases.length > 0 &&
      musicBrainzResponse?.releases[0]?.id
    ) {
      const coverArtUrl = `http://coverartarchive.org/release/${musicBrainzResponse?.releases[0]?.id}`;
      const coverArtResponse = await fetch(coverArtUrl).then((res) =>
        res.json()
      );

      console.log(coverArtResponse);

      let coverArt;
      if (coverArtResponse.images[0].thumbnails.small) {
        coverArt = await fetch(coverArtResponse.images[0].thumbnails.small);
      } else {
        coverArt = await fetch(coverArtResponse.images[0].image);
      }

      console.log(coverArt);

      if (coverArt.url && coverArt.status === 200) {
        return coverArt.url;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
