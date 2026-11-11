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
  private anchorElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onEnded?: () => void;
  public onError?: (error: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).__rext_youtubeEngine = this;
      this.loadIframeAPI();

      window.addEventListener('resize', () => this.updatePosition());
      window.addEventListener('scroll', () => this.updatePosition(), true);
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

  public updatePosition() {
    const container = document.getElementById('rext-youtube-container');
    if (!container) return;

    if (!this.isVideoVisible || !this.anchorElement) {
      // Background Audio Mode: Keep YouTube player completely offscreen
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '300px';
      container.style.height = '300px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      container.style.overflow = 'hidden';
      container.style.visibility = 'hidden';
      return;
    }

    // Video Mode: Glue container seamlessly to anchor element
    const rect = this.anchorElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      container.style.visibility = 'hidden';
      return;
    }

    const computed = window.getComputedStyle(this.anchorElement);
    container.style.position = 'fixed';
    container.style.top = `${rect.top}px`;
    container.style.left = `${rect.left}px`;
    container.style.width = `${rect.width}px`;
    container.style.height = `${rect.height}px`;
    container.style.borderRadius = computed.borderRadius || '16px';
    container.style.overflow = 'hidden';
    container.style.zIndex = '52'; // Just above base surfaces, below REXT custom overlay
    container.style.opacity = '1';
    container.style.pointerEvents = 'none'; // Critical: All clicks captured by REXT native overlay
    container.style.visibility = 'visible';
    container.style.transition = 'opacity 0.25s ease-out, border-radius 0.2s ease';

    const iframe = container.querySelector('iframe');
    if (iframe) {
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      // 1.15 scale crops top title bar & watermark outside bounds for a pure native look
      iframe.style.transform = 'scale(1.15)';
      iframe.style.transformOrigin = 'center center';
      iframe.style.pointerEvents = 'none';
      iframe.style.border = 'none';
    }
  }

  public setAnchorElement(element: HTMLElement | null) {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.anchorElement = element;

    if (element && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updatePosition();
      });
      this.resizeObserver.observe(element);
    }

    this.updatePosition();
  }

  private applyContainerStyles(container: HTMLElement) {
    this.updatePosition();
  }

  private createPlayer() {
    let container = document.getElementById('rext-youtube-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rext-youtube-container';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '300px';
      container.style.height = '300px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      container.style.overflow = 'hidden';
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
          controls: 0,             // Pure REXT UI: no YouTube controls, timeline, or buttons
          disablekb: 1,            // No YouTube native keyboard shortcuts
          fs: 0,                   // No native fullscreen button
          modestbranding: 1,       // Suppresses branding
          rel: 0,                  // No unrelated videos
          playsinline: 1,          // Inline mobile playback
          enablejsapi: 1,
          iv_load_policy: 3,       // Disables video annotations & cards
          autohide: 1,
          origin: window.location.origin,
          vq: 'hd1080',
          suggestedQuality: 'hd1080'
        },
        events: {
          onReady: () => {
            this.isReady = true;
            try {
              this.player.unMute();
              this.player.setVolume(this.currentVolume);
              if (typeof this.player.setPlaybackQuality === 'function') {
                this.player.setPlaybackQuality('hd1080');
              }
            } catch {}
            this.updatePosition();
            const targetId = this.queuedVideoId || this.currentVideoId;
            if (targetId) {
              this.loadAndPlay(targetId);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
            if (event.data === 1) {
              try {
                if (typeof this.player.setPlaybackQuality === 'function') {
                  this.player.setPlaybackQuality('hd1080');
                }
              } catch {}
              this.updatePosition();
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
    this.updatePosition();
  }

  public getIsVideoVisible(): boolean {
    return this.isVideoVisible;
  }

  public async loadAndPlay(videoId: string, startSeconds: number = 0): Promise<boolean> {
    this.currentVideoId = videoId;
    this.queuedVideoId = videoId;

    if (!this.isReady || !this.player || typeof this.player.loadVideoById !== 'function') {
      if (window.YT && window.YT.Player && !this.player) {
        this.createPlayer();
      }
      return false;
    }

    try {
      this.player.loadVideoById(videoId, startSeconds, 'hd1080');
      try {
        this.player.unMute();
        this.player.setVolume(this.currentVolume);
        if (typeof this.player.setPlaybackQuality === 'function') {
          this.player.setPlaybackQuality('hd1080');
        }
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

  public seek(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch {}
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
