import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, Music, Trash2, Play, Pause, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { savePlaylist, loadPlaylist } from '../lib/storage';

const PlaylistManager = ({ onTrackSelect, currentTrack, isPlaying, onPlayPause }) => {
  const [playlist, setPlaylist] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const savedPlaylist = loadPlaylist();
    if (savedPlaylist) {
      setPlaylist(savedPlaylist);
    }
  }, []);

  useEffect(() => {
    savePlaylist(playlist);
  }, [playlist]);

  const handleFileUpload = (files) => {
    const mp3Files = Array.from(files).filter(file => 
      file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.name.toLowerCase().endsWith('.mp3')
    );

    mp3Files.forEach(file => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        const newTrack = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.mp3$/i, ''),
          file: file,
          url: url,
          duration: audio.duration,
          size: file.size
        };

        setPlaylist(prev => {
          const exists = prev.find(track => track.name === newTrack.name && track.size === newTrack.size);
          if (!exists) {
            return [...prev, newTrack];
          }
          return prev;
        });
      });
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeTrack = (trackId) => {
    setPlaylist(prev => {
      const track = prev.find(t => t.id === trackId);
      if (track && track.url) {
        URL.revokeObjectURL(track.url);
      }
      return prev.filter(track => track.id !== trackId);
    });
  };

  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleTrackClick = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      onPlayPause();
    } else {
      onTrackSelect(track);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Playlist
            <Badge variant="secondary" className="ml-2">
              {playlist.length}
            </Badge>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Add Music
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add MP3 Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Drag and drop MP3 files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".mp3,audio/mpeg,audio/mp3"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer" asChild>
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {playlist.length === 0 ? (
          <div className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No music in your playlist yet
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Your First Song
            </Button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`group flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                    currentTrack && currentTrack.id === track.id 
                      ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500' 
                      : ''
                  }`}
                  onClick={() => handleTrackClick(track)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {currentTrack && currentTrack.id === track.id ? (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Play className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-white ml-0.5" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {track.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDuration(track.duration)}</span>
                        <span>•</span>
                        <span>{formatFileSize(track.size)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentTrack && currentTrack.id === track.id && (
                      <Badge variant="secondary" className="text-xs">
                        Now Playing
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {playlist.length > 0 && (
          <>
            <Separator />
            <div className="p-4 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{playlist.length} track{playlist.length !== 1 ? 's' : ''}</span>
                <span>
                  Total: {formatFileSize(playlist.reduce((total, track) => total + track.size, 0))}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistManager;