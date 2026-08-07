'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Play, Pause, AlertCircle, Check, ChevronDown, X } from 'lucide-react';
import { useVoicePreview } from '@/hooks/useVoicePreview';

export interface Voice {
  id: string;
  displayName: string;
  accent: string;
  gender: string;
  recommended?: boolean;
}

interface VoicePickerProps {
  voices: Voice[];
  selectedVoiceId: string;
  selectedLanguage?: 'en-US' | 'hi-IN';
  onSelectVoice: (voiceId: string) => void;
  disabled?: boolean;
}

export function VoicePicker({ voices, selectedVoiceId, selectedLanguage = 'en-US', onSelectVoice, disabled }: VoicePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'American' | 'British' | 'Female' | 'Male'>('All');
  const [isMobile, setIsMobile] = useState(false);

  const { activePreviewId, previewStatus, playPreview, stopPreview } = useVoicePreview();

  // Stop preview when language changes
  useEffect(() => {
    stopPreview();
  }, [selectedLanguage, stopPreview]);

  // Handle responsive behavior manually via matchMedia to prevent hydration mismatch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    checkMobile(); // Check on mount
    const mql = window.matchMedia('(max-width: 640px)');
    mql.addEventListener('change', checkMobile);
    return () => mql.removeEventListener('change', checkMobile);
  }, []);

  const selectedVoice = useMemo(() => voices.find(v => v.id === selectedVoiceId), [voices, selectedVoiceId]);

  const effectiveFilter = (selectedLanguage === 'hi-IN' && (activeFilter === 'American' || activeFilter === 'British'))
    ? 'All'
    : activeFilter;

  const filteredVoices = useMemo(() => {
    return voices.filter((voice) => {
      // 1. Search Logic
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        voice.displayName.toLowerCase().includes(q) ||
        voice.id.toLowerCase().includes(q) ||
        voice.accent.toLowerCase().includes(q) ||
        voice.gender.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Filter Logic
      if (effectiveFilter === 'All') return true;
      if (effectiveFilter === 'American') return voice.accent.toLowerCase().includes('american');
      if (effectiveFilter === 'British') return voice.accent.toLowerCase().includes('british');
      if (effectiveFilter === 'Female') return voice.gender.toLowerCase() === 'female';
      if (effectiveFilter === 'Male') return voice.gender.toLowerCase() === 'male';

      return true;
    });
  }, [voices, searchQuery, effectiveFilter]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state on close
      setTimeout(() => {
        setSearchQuery('');
        setActiveFilter('All');
        stopPreview();
      }, 200);
    }
  }, [stopPreview]);

  const handleSelect = useCallback((voiceId: string) => {
    onSelectVoice(voiceId);
    setIsOpen(false);
  }, [onSelectVoice]);

  const renderTrigger = () => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setIsOpen(true)}
      className="w-full relative flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-background hover:bg-secondary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground truncate">
            {selectedVoice?.displayName || 'Select Voice'}
          </span>
          {selectedVoice?.recommended && (
            <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              Recommended
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {selectedVoice ? `${selectedVoice.accent} • ${selectedVoice.gender.charAt(0).toUpperCase() + selectedVoice.gender.slice(1)}` : 'Choose a voice model'}
        </span>
      </div>
      
      {/* Collapsed Preview Control */}
      <div 
        className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 bg-secondary/30 hover:bg-secondary/80 hover:border-border text-xs font-medium text-foreground transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          if (!selectedVoice) return;
          if (activePreviewId === selectedVoice.id) {
             playPreview(selectedVoice.id, selectedVoice); // toggle
          } else {
             playPreview(selectedVoice.id, selectedVoice);
          }
        }}
        role="button"
        aria-label={`Listen to ${selectedVoice?.displayName || 'voice'}`}
      >
        {activePreviewId === selectedVoice?.id && previewStatus === 'loading' ? (
           <span className="text-xs">Loading...</span>
        ) : activePreviewId === selectedVoice?.id && previewStatus === 'playing' ? (
           <>
             <Pause className="w-3.5 h-3.5" />
             <span>Pause</span>
           </>
        ) : activePreviewId === selectedVoice?.id && previewStatus === 'error' ? (
           <>
             <AlertCircle className="w-3.5 h-3.5 text-destructive" />
             <span className="text-destructive">Error</span>
           </>
        ) : (
           <>
             <Play className="w-3.5 h-3.5" />
             <span>Listen</span>
           </>
        )}
      </div>

      <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );

  const renderContent = () => (
    <div className="flex flex-col h-full min-h-0 bg-card sm:bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border/50 shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, accent, or gender..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm bg-secondary/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60 transition-colors"
              aria-label="Search voices"
            />
          </div>
          {isMobile && (
            <Dialog.Close asChild>
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-border bg-background hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {(['All', 'American', 'British', 'Female', 'Male'] as const).filter(filter => {
            if (selectedLanguage === 'hi-IN' && (filter === 'American' || filter === 'British')) return false;
            return true;
          }).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                effectiveFilter === filter 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-secondary border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain p-2 min-h-[300px]"
        role="listbox"
        aria-label="Voices"
        onWheel={(e) => e.stopPropagation()}
      >
        {filteredVoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-sm">No voices match your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filteredVoices.map((voice) => {
              const isSelected = voice.id === selectedVoiceId;
              const isPreviewing = activePreviewId === voice.id;
              
              return (
                <div 
                  key={voice.id} 
                  role="option" 
                  aria-selected={isSelected}
                  className={`group relative flex items-center justify-between gap-4 p-3 rounded-xl border transition-colors ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-background border-transparent hover:bg-secondary/40 hover:border-border'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(voice.id)}
                    className="absolute inset-0 w-full h-full text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset z-0"
                    aria-label={`Select ${voice.displayName}`}
                  />
                  
                  <div className="flex flex-col gap-1 z-10 pointer-events-none min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {voice.displayName}
                      </span>
                      {voice.recommended && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                          Recommended
                        </span>
                      )}
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-primary shrink-0 ml-1">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {voice.accent} • {voice.gender.charAt(0).toUpperCase() + voice.gender.slice(1)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPreview(voice.id, voice);
                    }}
                    className={`relative z-10 shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      isPreviewing && previewStatus === 'playing'
                        ? 'border-primary bg-primary/10 text-primary'
                        : isPreviewing && previewStatus === 'loading'
                        ? 'border-border bg-secondary/50 text-muted-foreground'
                        : isPreviewing && previewStatus === 'error'
                        ? 'border-destructive/30 bg-destructive/10 text-destructive'
                        : 'border-border bg-background hover:bg-secondary text-foreground group-hover:border-primary/20 group-hover:bg-primary/5'
                    }`}
                  >
                    {isPreviewing && previewStatus === 'loading' ? (
                       <span>Loading...</span>
                    ) : isPreviewing && previewStatus === 'playing' ? (
                       <>
                         <Pause className="w-3.5 h-3.5" />
                         <span>Pause</span>
                       </>
                    ) : isPreviewing && previewStatus === 'error' ? (
                       <>
                         <AlertCircle className="w-3.5 h-3.5" />
                         <span>Error</span>
                       </>
                    ) : (
                       <>
                         <Play className="w-3.5 h-3.5" />
                         <span>Listen</span>
                       </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Voice
      </label>
      
      {isMobile ? (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
          <Dialog.Trigger asChild>
            {renderTrigger()}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 top-16 z-50 bg-background rounded-t-2xl shadow-xl flex flex-col overflow-hidden outline-none">
              <Dialog.Title className="sr-only">Voice Picker</Dialog.Title>
              <Dialog.Description className="sr-only">Search and select a voice model for text to speech generation.</Dialog.Description>
              {renderContent()}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            {renderTrigger()}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content 
              side="bottom" 
              align="start" 
              sideOffset={8}
              className="z-50 w-[420px] max-h-[500px] flex flex-col bg-background border border-border shadow-2xl rounded-2xl overflow-hidden outline-none"
            >
              {renderContent()}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
