export const CommonQueries = {
  getBanner: `SELECT bannerId as id, heading, description, image from banner where isActive is true;`,
  getDiscount: `select description from discount where isActive is true;`,
  getVideos: `select videoId from youtubevideos;`,
};
