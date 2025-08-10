const PLAYLIST_KEY = 'mp3-player-playlist';
const CURRENT_TRACK_KEY = 'mp3-player-current-track';
const PLAYER_STATE_KEY = 'mp3-player-state';

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Playlist management
export const savePlaylist = (playlist) => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
    return true;
  } catch (error) {
    console.error('Failed to save playlist:', error);
    return false;
  }
};

export const loadPlaylist = () => {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const playlist = localStorage.getItem(PLAYLIST_KEY);
    return playlist ? JSON.parse(playlist) : [];
  } catch (error) {
    console.error('Failed to load playlist:', error);
    return [];
  }
};

export const addTrackToPlaylist = (track) => {
  const playlist = loadPlaylist();
  const newTrack = {
    id: Date.now().toString(),
    name: track.name,
    url: track.url,
    duration: track.duration || null,
    addedAt: new Date().toISOString()
  };
  
  const updatedPlaylist = [...playlist, newTrack];
  savePlaylist(updatedPlaylist);
  return newTrack;
};

export const removeTrackFromPlaylist = (trackId) => {
  const playlist = loadPlaylist();
  const updatedPlaylist = playlist.filter(track => track.id !== trackId);
  savePlaylist(updatedPlaylist);
  return updatedPlaylist;
};

export const clearPlaylist = () => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(PLAYLIST_KEY);
    localStorage.removeItem(CURRENT_TRACK_KEY);
    localStorage.removeItem(PLAYER_STATE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear playlist:', error);
    return false;
  }
};

// Current track management
export const saveCurrentTrack = (track) => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(CURRENT_TRACK_KEY, JSON.stringify(track));
    return true;
  } catch (error) {
    console.error('Failed to save current track:', error);
    return false;
  }
};

export const loadCurrentTrack = () => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const track = localStorage.getItem(CURRENT_TRACK_KEY);
    return track ? JSON.parse(track) : null;
  } catch (error) {
    console.error('Failed to load current track:', error);
    return null;
  }
};

// Player state management (volume, repeat, shuffle, etc.)
export const savePlayerState = (state) => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const currentState = loadPlayerState();
    const updatedState = { ...currentState, ...state };
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(updatedState));
    return true;
  } catch (error) {
    console.error('Failed to save player state:', error);
    return false;
  }
};

export const loadPlayerState = () => {
  if (!isLocalStorageAvailable()) {
    return {
      volume: 1,
      repeat: false,
      shuffle: false,
      currentTime: 0
    };
  }
  
  try {
    const state = localStorage.getItem(PLAYER_STATE_KEY);
    const defaultState = {
      volume: 1,
      repeat: false,
      shuffle: false,
      currentTime: 0
    };
    
    return state ? { ...defaultState, ...JSON.parse(state) } : defaultState;
  } catch (error) {
    console.error('Failed to load player state:', error);
    return {
      volume: 1,
      repeat: false,
      shuffle: false,
      currentTime: 0
    };
  }
};

// Utility functions
export const getStorageSize = () => {
  if (!isLocalStorageAvailable()) return 0;
  
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

export const clearAllPlayerData = () => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const keys = [PLAYLIST_KEY, CURRENT_TRACK_KEY, PLAYER_STATE_KEY];
    keys.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Failed to clear player data:', error);
    return false;
  }
};

// Export storage keys for external use if needed
export const STORAGE_KEYS = {
  PLAYLIST: PLAYLIST_KEY,
  CURRENT_TRACK: CURRENT_TRACK_KEY,
  PLAYER_STATE: PLAYER_STATE_KEY
};