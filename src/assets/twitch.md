```ts
export default function Player({ url }) {
  let channelName = url.split("/")[3] || "";
  channelName = (channelName && channelName.split('?')[0]) || "";

  console.log(url, channelName)

  return (
    <iframe
      id={`embed_${channelName}`}
      src={`https://player.twitch.tv/?muted=true&channel=${channelName}&parent=${location.hostname}`}
      class="stream"
      allowfullscreen="true"
      style={{
        width: "100%",
        height: "100%"
      }}>
    </iframe>
  );
}


```
