/**
 * State Management Module
 *
 * Centralized state store for the video editor.
 * All state mutations should go through this module to maintain consistency.
 */

// ============================================================================
// STATE
// ============================================================================

const state = {
  // Video
  currentFile: null,
  videoDuration: 0,

  // Segments
  segments: [],
  selectedSegmentIndex: null,
  exportMode: 'concat', // 'concat' or 'split'

  // Dragging
  isDragging: false,
  dragSegmentIndex: null,
  dragHandleType: null, // 'start', 'end', or 'segment'
  dragStartX: null,
  dragStartSegment: null,

  // Markers
  markers: [],

  // Voiceover
  voiceoverTracks: [],
  currentRecordingTrackId: null,
  nextTrackId: 1,
};

// ============================================================================
// GETTERS
// ============================================================================

export function getCurrentFile() {
  return state.currentFile;
}

export function getVideoDuration() {
  return state.videoDuration;
}

export function getSegments() {
  return state.segments;
}

export function getSegment(index) {
  return state.segments[index];
}

export function getSelectedSegmentIndex() {
  return state.selectedSegmentIndex;
}

export function getExportMode() {
  return state.exportMode;
}

export function getMarkers() {
  return state.markers;
}

export function getVoiceoverTracks() {
  return state.voiceoverTracks;
}

export function getDragState() {
  return {
    isDragging: state.isDragging,
    dragSegmentIndex: state.dragSegmentIndex,
    dragHandleType: state.dragHandleType,
    dragStartX: state.dragStartX,
    dragStartSegment: state.dragStartSegment,
  };
}

// ============================================================================
// SETTERS
// ============================================================================

export function setCurrentFile(file) {
  state.currentFile = file;
}

export function setVideoDuration(duration) {
  state.videoDuration = duration;
}

export function setExportMode(mode) {
  state.exportMode = mode;
}

export function setSelectedSegmentIndex(index) {
  state.selectedSegmentIndex = index;
}

export function setDragState(dragState) {
  Object.assign(state, dragState);
}

export function clearDragState() {
  state.isDragging = false;
  state.dragSegmentIndex = null;
  state.dragHandleType = null;
  state.dragStartX = null;
  state.dragStartSegment = null;
}

// ============================================================================
// SEGMENTS
// ============================================================================

export function addSegment(segment) {
  state.segments.push(segment);
  return state.segments.length - 1; // Return index
}

export function updateSegment(index, updates) {
  Object.assign(state.segments[index], updates);
}

export function removeSegment(index) {
  state.segments.splice(index, 1);
  if (state.selectedSegmentIndex === index) {
    state.selectedSegmentIndex = null;
  } else if (state.selectedSegmentIndex > index) {
    state.selectedSegmentIndex--;
  }
}

export function clearSegments() {
  state.segments = [];
  state.selectedSegmentIndex = null;
}

// ============================================================================
// MARKERS
// ============================================================================

export function addMarker(marker) {
  state.markers.push(marker);
  return state.markers.length - 1;
}

export function removeMarker(index) {
  state.markers.splice(index, 1);
}

export function clearMarkers() {
  state.markers = [];
}

// ============================================================================
// VOICEOVER
// ============================================================================

export function addVoiceoverTrack(track) {
  const trackWithId = { ...track, id: state.nextTrackId++ };
  state.voiceoverTracks.push(trackWithId);
  return trackWithId.id;
}

export function getVoiceoverTrack(id) {
  return state.voiceoverTracks.find(t => t.id === id);
}

export function updateVoiceoverTrack(id, updates) {
  const track = state.voiceoverTracks.find(t => t.id === id);
  if (track) {
    Object.assign(track, updates);
  }
}

export function removeVoiceoverTrack(id) {
  const index = state.voiceoverTracks.findIndex(t => t.id === id);
  if (index >= 0) {
    state.voiceoverTracks.splice(index, 1);
  }
}

export function setCurrentRecordingTrackId(id) {
  state.currentRecordingTrackId = id;
}

export function getCurrentRecordingTrackId() {
  return state.currentRecordingTrackId;
}

// ============================================================================
// DEBUGGING
// ============================================================================

export function getState() {
  return state;
}

export function dumpState() {
  console.log('Current State:', JSON.parse(JSON.stringify(state)));
}
