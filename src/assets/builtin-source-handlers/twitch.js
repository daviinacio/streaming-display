export default {
  id: 'twitch',
  version: '1.0.0',
  label: 'Twitch',
  icon: "/handler/twitch/icon.png",
  logo: '/handler/twitch/logo.png',
  urlMatch: [
    'https://www.twitch.tv/*',
  ],
  resolver: ($params = {}) => new Promise(($resolve, $reject) => {
    let $result = {};
    //###---OPEN---###//
    const { url } = $params;
    let channelName = url.split("/")[3] || "";
    channelName = (channelName && channelName.split('?')[0]) || "";

    $result = {
      title: channelName,
      status: "online",
      sourceUrl: url //`https://player.twitch.tv/?channel=${channelName}&amp;parent=${location.hostname}&amp;parent=${location.hostname}`,
    }

    //###---CLOSE---###//
    $resolve($result)
    return $result;
  }),
  allow: {
    maximize: true,
    volume: true,
    refresh: true
  },
}
