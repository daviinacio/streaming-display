**Version 0**

- [x] Finish the functional version

**Version 1**

- [x] Refactor how the page behaves and arranges items in the grid
  - [x] Discover a better way to handle the grid items positioning and resizing, avoiding unnecessary iframe refreshes
  - [x] Implement a reducer to handle the calculation of grid items positions
    - [x] Calculate position and size of each item based in column and order
    - [x] Implement a way to insert items in the grid
    - [x] Implement a way to insert a item between two items
    - [x] Implement a way to move items in the grid
    - [x] Implement a way to remove items from the grid
  - [x] Implement a item component with drag and drop capabilities
    - [x] Header with a title and a close button
    - [x] Body with the streaming iframe
    - [x] Footer with the item's controls
      - [ ] ~~Button to toggle the item's mute state
      - [ ] ~~Button to toggle the item's pause state
      - [x] Button to toggle the item's fullscreen mode
      - [x] Button to open the streaming url in a new tab
      - [x] Button to refresh the streaming iframe
  - [x] Implement a draggable component
  - [x] Implement a droppable area component

**Version 1.1**

- [ ] Adjust video sizing
  - [ ] Horizontal scroll
- [x] Improve drag and drop between instances using localStorage
- [x] Improve drag and drop move around
- [x] Improve m3u8 error messages
- [x] Implement m3u8 auto refresh
- [x] m3u8 destroy
- [x] Implement video control
  - [x] Implement mute/unmute
  - [x] Implement play/pause
  - [ ] Implement volume slider
- [ ] Improve UX of video messages
  - [ ] Loading metadata
  - [ ] Loading video
  - [ ] In private stream
  - [ ] Offline


**Version 2.0.0**
- [x] Built-in and custom source handlers
  - [x] Source handlers handles with specific URLs in order to obtain its metadata required for displaying the streaming video.
  - [x] Custom handlers can be created through modern editor, and can be tested before saving.
  - [x] Custom handlers are stored in localStorage.
  - [x] Custom handlers expands the software capabilities.
- [x] URL drag-n-drop
- [x] Multiple instances
- [x] Move streamings through different instances
- [x] Draggable video grid.
- [x] Standardized video controls
- [x] Dark theme
  - [x] Follows the system theme changing if it matches with the current system color schema.
- [x] Fully responsible
- [x] Customize color palette
- [x] Resize grid
  - [x] Disable grid animation on moving handles
  - [x] Create a virtual handles for columns and rows
    - [x] Column handles
    - [ ] ~~Row handles~~
      - [ ] ~~Help to select specific height (depending on the current grid state)~~
        - [ ] ~~Ex: 2/3, 3/4, etc...~~


**Version 2.1.0**
- [ ] Remove link to version 1.
- [ ] Add a help popup
  - [ ] Show keyboard shortcuts
  - [ ] Show tips
- [ ] Create a flag, editable
- [ ] Plugin capabilities
  - [ ] Plugin components
    - [ ] Player
      - Renders everything related to a player and handles source url, it will replace source handlers.
      - 


**Examples**

```tsx
// TwitchPlugin / Player

export default function TwitchPlayer(){
  // Source Handler
  // ...

  // Player
  return (
    <div style={...}>
      <div style={...}>
        <HudControl position="titl`e" />
      </div>
      <iframe src={url} />
    </div>
  )
}

```












<!-- ```tsx
function TwitchPlugin() {
  // Source handler
  const sourceUrl = "...";
  
  // Player
  return (
    <DefaultPlayer
      sourceUrl={sourceUrl}
      hud={false || {
        title: true,
        playback: false,
        progress: false
        tools: false,
      }}
      title={modelName}
      url={url}
    />
  )
}
```

```tsx
// Mandatory named function
function DownloadButton() {
  const [online, setOnline] = React.useState(false);

  React.useEffect(() => {
    ...
  }, [])

  function handleDownload(){
    ...
  }
  
  // Player
  return <>
    <HudControl position="title" visible="focus|blur|always">
      <button
        onClick={handleDownload}
        style={{
          width: 16,
          heigh: 16
        }
      />
    </HudControl>
  </>
}
```

```tsx
// Mandatory named function
function TwitchPlayer() {
  // Player
  return (
    <div>
      <div>
        // If it has no children, i became the renderer.
        <HudControl position="title" />
      </div>

      // Render another element of the same component
      <Test />

      // Render a element of another component
      <DownloadButton />
    </div>
  )
}

// Functions name cannot repeat inside a plugin
function Test(){
  return <div />
}
``` -->



**Backlog**
- [ ] Source handler response flag to useIframe
- [ ] Reset query on handler update
- [ ] Encrypt exported source handlers
- [ ] Import source handler
- [ ] Do not listen to key press if its not at the grid.
- [ ] Implement picture-in-picture. (unstable). Ref: https://deepak-mondal.medium.com/using-document-picture-in-picture-with-react-dab900dcc23c
- [ ] Implement 'do not show again' to confirm dialogs. Idea: `notAskAgainId` as numeric value
- [ ] Refactor m3u8 streaming components
  - [ ] Refactor VideoWrapper
  - [ ] Refactor GenericVideo
  - [ ] Streaming fullscreen should fill the page instead.
  - [ ] Use double click on header to fullscreen the page.
  - [ ] Implement a "alwaysOn" feature
    - [ ] Muted will be 0.01 volume (it will avoid pausing the streaming on changing tab)
  - [ ] Implement a standard for streaming
    - [ ] Status: online, private, offline
    - [ ] Different refresh interval depending of the status
- [ ] Implement a more efficient way to get streaming statuses
  - [ ] Keep streaming thumb if available
  - [ ] Streamings recently available will be check more often.
    - [ ] Or, try to find a way to get all statuses from specific site at once. (avoid denied service)
- [ ] Implement a way to control in a top view the status of all streamings
  - [ ] Define a count of streaming to be displayed at time.
  - [ ] Always priorize streamings with more weight.
  - [ ] Once a streaming become unavailable, it should bring other to replace it.
- [ ] Plugins
  - [ ] Allow users to create, import and export plugins
  - [ ] Plugins are able to add extra functionalities to the app
  - [ ] Plugins can create and manage visual elements in video tiles
  - [ ] Current functionalities will be converted to built-in plugins
    - [ ] Picture-in-picture
    - [ ] Maximize
    - [ ] Copy SourceUrl
    - [ ] Refresh
    - [ ] Volume
  - [ ] Plugin can be for video, or for the whole app
  - [ ] Add a section to source handler screen to enable plugins.
- [ ] User-Data
- [ ] Download Stream through the page <depends-on: plugin>

### Streaming Buckets
**Previous backlog**
- [ ] Implement streaming buckets
  - [ ] `I001` Implement a popup with a list of streaming buckets
  - [ ] Implement button to save current arrangement as a streaming bucket `I002`.
  - [ ] Implement button to open a streaming bucket
  - [ ] `I002` Create popup to edit a streaming bucket
    - [ ] Implement weight systems for streamings
    - [ ] Implement drag and drop
      - [ ] Drag as a link
      - [ ] Drop: New item to the streaming bucket

**2025-12-13**
- [ ] Twitch Chat
  - https://www.twitch.tv/embed/:channel-name/chat?parent=:site-domain
- [ ] 


### Optimize Source Handlers
- [ ] Avoid DOS by scheduling refetch as groups

## Standard Streaming Display Backend
- [ ] Bypass CORS on retrieving streaming details
- [ ] Proxy Twitch Stream
- [ ] 




### Concepts
- Source Handler
  - Handle url to retrieve the required metadata for playing the content.
- Wanted features
  - Extend the app capabilities
    - Download


- URL handling
- Player Component
  - Player HUD
  - Player Controls
