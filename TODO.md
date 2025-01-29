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

**Version 1.2**

- [ ] Implement streaming pools
  - [ ] `I001` Implement a popup with a list of streaming pools
  - [ ] Implement button to save current arrangement as a streaming pool `I002`.
  - [ ] Implement button to open a streaming pool
  - [ ] `I002` Create popup to edit a streaming pool
    - [ ] Implement weight systems for streamings
    - [ ] Implement drag and drop
      - [ ] Drag as a link
      - [ ] Drop: New item to the streaming pool
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

**Backlog**

- [ ] Implement picture-in-picture. (unstable). Ref: https://deepak-mondal.medium.com/using-document-picture-in-picture-with-react-dab900dcc23c
- [ ] Implement 'do not show again' to confirm dialogs. Idea: `notAskAgainId` as numeric value
