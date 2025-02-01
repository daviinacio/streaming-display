export default {
  id: 'twitch',
  version: '1.0.0',
  label: 'Twitch',
  icon: "/handler/twitch/icon.png",
  logo: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/1280px-Logo_of_YouTube_%282015-2017%29.svg.png',
    height: '30px'
  },
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
      status: "success",
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
