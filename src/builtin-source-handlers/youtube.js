export default {
  id: 'youtube',
  version: '1.0.0',
  label: 'Youtube',
  icon: "/handler/youtube/icon.png",
  logo: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Logo_of_YouTube_%282015-2017%29.svg/1280px-Logo_of_YouTube_%282015-2017%29.svg.png',
    height: '30px'
  },
  urlMatch: [
    'https://www.youtube.com/watch?v=*',
    'https://youtu.be/*'
  ],
  resolver: async ({ url }) => {
    const metadata = await fetch(
      `https://noembed.com/embed?url=${url}`
    ).then((response) => response.json())

    return {
      title: metadata.title,
      status: "success",
      sourceUrl: url,
    }
  },
  allow: {
    fullscreen: true,
    pip: false,
    refresh: true,
    volume: true
  },
}
