/**
 * YouTube IFrame Audio & Video Engine for rext
 * Streams ANY music video or audio from YouTube in full length
 * with seamless synchronization to the rext player bar and equalizer.
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

class YouTubeEngine {
  private player: any = null;
  private isApiLoaded = false;
  private isReady = false;
  private currentVideoId: string | null = null;
  private queuedVideoId: string | null = null;
  private pollTimer: number | null = null;
  private currentVolume: number = 85;
  private isVideoVisible: boolean = true;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onEnded?: () => void;
  public onError?: (error: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).__rext_youtubeEngine = this;
      this.loadIframeAPI();
    }
  }

  private loadIframeAPI() {
    if (window.YT && window.YT.Player) {
      this.isApiLoaded = true;
      this.createPlayer();
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      this.isApiLoaded = true;
      this.createPlayer();
    };

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }

  private applyContainerStyles(container: HTMLElement) {
    container.style.position = 'fixed';
    container.style.bottom = '96px';
    container.style.right = '24px';
    container.style.width = '320px';
    container.style.height = '180px';
    container.style.borderRadius = '16px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)';
    container.style.border = '1px solid var(--border-color)';
    container.style.background = '#000';
    container.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';

    if (this.isVideoVisible) {
      container.style.transform = 'translateY(0) scale(1)';
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
      container.style.zIndex = '45';
    } else {
      // Audio-only mode: preserve standard dimensions so YouTube player keeps streaming audio,
      // and translate it below viewport edge
      container.style.transform = 'translateY(400px) scale(0.95)';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-10';
    }
  }

  private createPlayer() {
    let container = document.getElementById('rext-youtube-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rext-youtube-container';
      this.applyContainerStyles(container);
      document.body.appendChild(container);

      const placeholder = document.createElement('div');
      placeholder.id = 'rext-yt-player-element';
      container.appendChild(placeholder);
    }

    try {
      this.player = new window.YT.Player('rext-yt-player-element', {
        height: '100%',
        width: '100%',
        videoId: this.currentVideoId || '34Na4j8AVgA',
        playerVars: {
          autoplay: 1,
          controls: 1,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            try {
              this.player.unMute();
              this.player.setVolume(this.currentVolume);
            } catch {}
            const targetId = this.queuedVideoId || this.currentVideoId;
            if (targetId) {
              this.loadAndPlay(targetId);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
            if (event.data === 1) {
              if (this.onPlayStateChange) this.onPlayStateChange(true);
              this.startProgressPolling();
            } else if (event.data === 2) {
              if (this.onPlayStateChange) this.onPlayStateChange(false);
              this.stopProgressPolling();
            } else if (event.data === 0) {
              if (this.onPlayStateChange) this.onPlayStateChange(false);
              this.stopProgressPolling();
              if (this.onEnded) this.onEnded();
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player notice:', event.data);
            if (this.onError) this.onError(`YouTube playback status (${event.data})`);
          }
        }
      });
    } catch (e) {
      console.warn('YouTube Player creation deferred:', e);
    }
  }

  public setVideoVisibility(visible: boolean) {
    this.isVideoVisible = visible;
    const container = document.getElementById('rext-youtube-container');
    if (container) {
      this.applyContainerStyles(container);
    }
  }

  public getIsVideoVisible(): boolean {
    return this.isVideoVisible;
  }

  public async loadAndPlay(videoId: string): Promise<boolean> {
    this.currentVideoId = videoId;
    this.queuedVideoId = videoId;

    if (!this.isReady || !this.player || typeof this.player.loadVideoById !== 'function') {
      if (window.YT && window.YT.Player && !this.player) {
        this.createPlayer();
      }
      return false;
    }

    try {
      this.player.loadVideoById(videoId, 0);
      try {
        this.player.unMute();
        this.player.setVolume(this.currentVolume);
      } catch {}
      this.player.playVideo();
      this.startProgressPolling();
      this.queuedVideoId = null;
      return true;
    } catch (err) {
      console.warn('YouTube loadVideo error:', err);
      return false;
    }
  }

  public play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      this.player.playVideo();
      this.startProgressPolling();
    }
  }

  public pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      this.player.pauseVideo();
      this.stopProgressPolling();
    }
  }

  public seek(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      this.player.seekTo(seconds, true);
    }
  }

  public setVolume(volume0to1: number) {
    this.currentVolume = Math.round(Math.max(0, Math.min(1, volume0to1)) * 100);
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(this.currentVolume);
      } catch {}
    }
  }

  public stop() {
    if (this.player && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
      } catch {}
    }
    this.stopProgressPolling();
  }

  private startProgressPolling() {
    this.stopProgressPolling();
    this.pollTimer = window.setInterval(() => {
      if (this.player && typeof this.player.getCurrentTime === 'function') {
        const curr = this.player.getCurrentTime() || 0;
        const dur = (typeof this.player.getDuration === 'function' ? this.player.getDuration() : 0) || 0;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(curr, dur);
        }
      }
    }, 250);
  }

  private stopProgressPolling() {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public getCurrentVideoId(): string | null {
    return this.currentVideoId;
  }
}

export const youtubeEngine = new YouTubeEngine();
export default youtubeEngine;
