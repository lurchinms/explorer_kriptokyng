'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playNotificationSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load the notification sound
    audioRef.current = new Audio('/audio/notification.mp3');
    audioRef.current.volume = 0.5;
    
    // Load saved preference from localStorage
    const savedPreference = localStorage.getItem('sound-enabled');
    if (savedPreference !== null) {
      setIsSoundEnabled(savedPreference === 'true');
    }
  }, []);

  const toggleSound = () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    localStorage.setItem('sound-enabled', newValue.toString());
  };

  const playNotificationSound = () => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.log('Failed to play notification sound:', error);
      });
    }
  };

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playNotificationSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  
  if (!context) {
    console.warn('Sound context not found, using mock implementation');
    return { 
      isSoundEnabled: false, 
      toggleSound: () => {},
      playNotificationSound: () => {}
    };
  }

  return context;
}
