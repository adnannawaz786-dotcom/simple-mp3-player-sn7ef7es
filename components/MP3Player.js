import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MP3Player = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load playlist from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mp3-player-playlist');
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);
      } catch (error) {
        console.error('Error loading playlist from localStorage:', error);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('mp3-player-playlist', JSON.stringify(playlist));
    }
  }, [playlist]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const mp3Files = files.filter(file => file.type === 'audio/mpeg' || file.name.endsWith('.mp3'));
    
    mp3Files.forEach(file => {
      const url = URL.createObjectURL(file);
      const track = {
        id: Date.now() + Math.random(),
        name: file.name.replace('.mp3', ''),
        url: url,
        file: file
      };
      
      setPlaylist(prev => [...prev, track]);
    });

    // Reset file input
    event.target.value = '';
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const next = (currentTrack + 1) % playlist.length;
    setCurrentTrack(next);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prev = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    setIsPlaying(false);
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const removeTrack = (trackId) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(track => track.id !== trackId);
      const removedIndex = prev.findIndex(track => track.id === trackId);
      
      if (removedIndex === currentTrack && currentTrack >= newPlaylist.length) {
        setCurrentTrack(Math.max(0, newPlaylist.length - 1));
      } else if (removedIndex < currentTrack) {
        setCurrentTrack(prev => prev - 1);
      }
      
      return newPlaylist;
    });
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrackData = playlist[currentTrack];

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* Hidden audio element */}
      {currentTrackData && (
        <audio
          ref={audioRef}
          src={currentTrackData.url}
          preload="metadata"
        />
      )}

      {/* File Upload */}
      <Card className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,.mp3"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          Add MP3 Files
        </Button>
      </Card>

      {/* Player Controls */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Track Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg truncate">
              {currentTrackData?.name || 'No track selected'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={1}
              className="w-full"
              disabled={!currentTrackData}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTrack}
              disabled={playlist.length === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              size="icon"
              onClick={togglePlay}
              disabled={playlist.length === 0}
              className="w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTrack}
              disabled={playlist.length === 0}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4" />
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {/* Playlist */}
      {playlist.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Playlist ({playlist.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    index === currentTrack
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => selectTrack(index)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {track.name}
                    </p>
                    {index === currentTrack && (
                      <p className="text-xs text-primary">Now playing</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrack(track.id);
                    }}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {playlist.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">No tracks in your playlist</p>
            <p className="text-sm text-muted-foreground">
              Upload some MP3 files to get started
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MP3Player;