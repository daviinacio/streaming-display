export default {
  id: "twitch-builtin",
  components: [
    {
      enabled: true,
      name: "Player",
      type: "Player",
      code: 'export default function TwitchPlayer({ src, ...props }) {\n  let channelName = src.split("/")[3] || "";\n  channelName = (channelName && channelName.split(\'?\')[0]) || "";\n\n  const [hasStarted, setHasStarted] = React.useState(false);\n  const [playing, setPlaying] = React.useState(false);\n\n  React.useEffect(() => {\n    setPlaying(false);\n    const timeout = setTimeout(() => {\n      setPlaying(true);\n      setTimeout(() => setPlaying(false));\n      setTimeout(() => setPlaying(true), 100);\n    }, 1000);\n    return () => clearTimeout(timeout);\n  }, []);\n\n  return (\n    <ReactPlayer\n      src={src}\n      title={channelName}\n      playing={playing}\n      onPlaying={() => setHasStarted(true)}\n      style={{ zIndex: hasStarted ? 1 : 9999999 }}\n      {...props}\n    />\n  )\n}\n',
      isEdit: false,
      isDirty: true,
    },
  ],
  enabled: true,
  match: ["https://www.twitch.tv/*"],
  name: "Twitch",
  isBuiltin: false,
};
