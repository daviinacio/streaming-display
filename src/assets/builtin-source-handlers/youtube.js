export default {
  id: 'youtube',
  version: '1.0.0',
  label: 'Youtube',
  icon: "/handler/youtube/icon.png",
  logo: '/handler/youtube/logo.png',
  urlMatch: [
    'https://www.youtube.com/watch?*',
    'https://youtu.be/*',
  ],
  resolver: async ($params = {}) => {
    let $result = {};
    //###---OPEN---###//
    const { url } = $params;
    const metadata = await fetch(
      `https://noembed.com/embed?url=${url}`
    ).then((response) => response.json())

    $result = {
      title: metadata.title,
      status: "online",
      sourceUrl: url,
    }

    //###---CLOSE---###//
    return $result;
  },
  allow: {
    maximize: true,
    volume: true,
    refresh: true
  },
}
