export default {
  id: 'twitch',
  version: '1.0.0',
  label: 'Twitch',
  icon: "/handler/twitch/icon.png",
  logo: '/handler/twitch/logo.png',
  urlMatch: [
    'https://www.twitch.tv/*',
  ],
  resolver: async ($params = {}) => {
    let $result = {};
    //###---OPEN---###//
    const { url } = $params;
    let channelName = url.split("/")[3] || "";
    channelName = (channelName && channelName.split('?')[0]) || "";

    $result = {
      title: channelName,
      status: "online",
      sourceUrl: url,
    }

    //###---CLOSE---###//
    return $result;
  },
  allow: {
    fullscreen: true,
    pip: false,
    refresh: true,
    volume: true
  },
}
