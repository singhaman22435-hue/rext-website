/**
 * YouTube IFrame Audio & Video Engine for REXT
 * Streams music video and audio from YouTube with zero branding
 * and pixel-perfect synchronized rendering across Theater Mode,
 * REXT Vibes Shorts Feed, and Floating Mini-Player.
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    __rext_youtubeEngine: any;
  }
}

class YouTubeEngine {
  public player: any = null;
  public isApiLoaded = false;
  public isReady = false;
  private currentVideoId: string | null = null;
  private queuedVideoId: string | null = null;
  private queuedStartTime: number = 0;
  private pollTimer: number | null = null;
  private currentVolume: number = 85;
  private isVideoVisible: boolean = true;

  // Anchor and Viewport Tracking
  private anchorElement: HTMLElement | null = null;
  private activeOwnerId: string | null = null;
  private isVertical: boolean = false;
  private trackingRaf: number | null = null;
  private trackingFrames: number = 0;
  private resizeObserver: ResizeObserver | null = null;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onEnded?: () => void;
  public onError?: (error: string) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      window.__rext_youtubeEngine = this;
      this.ensureContainer();
      this.loadIframeAPI();

      window.addEventListener('resize', () => this.updatePosition());
      window.addEventListener('scroll', () => this.updatePosition(), true);
    }
  }

  /**
   * Guarantees the existence of the background YouTube container
   */
  private ensureContainer(): HTMLElement {
    let container = document.getElementById('rext-youtube-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'rext-youtube-container';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '320px';
      container.style.height = '180px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      container.style.overflow = 'hidden';
      container.style.visibility = 'hidden';
      document.body.appendChild(container);

      const placeholder = document.createElement('div');
      placeholder.id = 'rext-yt-player-element';
      container.appendChild(placeholder);
    }
    return container;
  }

  private loadIframeAPI() {
    if (window.YT && window.YT.Player) {
      this.isApiLoaded = true;
      this.createPlayer();
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) {
        try { prevReady(); } catch {}
      }
      this.isApiLoaded = true;
      this.createPlayer();
    };

    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }

  private createPlayer() {
    this.ensureContainer();

    if (!window.YT || !window.YT.Player) return;

    try {
      this.player = new window.YT.Player('rext-yt-player-element', {
        height: '100%',
        width: '100%',
        videoId: this.currentVideoId || undefined,
        playerVars: {
          autoplay: 1,
          controls: 0,             // Zero native YouTube controls
          disablekb: 1,            // Disable native keyboard captures
          fs: 0,                   // Disable native fullscreen button
          modestbranding: 1,       // Suppress YouTube logo
          rel: 0,                  // No related third-party suggestions
          playsinline: 1,          // Seamless mobile inline play
          enablejsapi: 1,
          iv_load_policy: 3,       // Disables interactive cards/annotations
          autohide: 1
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
              this.loadAndPlay(targetId, this.queuedStartTime);
              this.queuedVideoId = null;
              this.queuedStartTime = 0;
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
            console.warn('YouTube Player notice code:', event.data);
            if (this.onError) this.onError(`Playback status code (${event.data})`);
          }
        }
      });
    } catch (e) {
      console.warn('YouTube Player initialization deferred:', e);
    }
  }

  /**
   * High-Frequency Position Tracking loop using requestAnimationFrame
   * Runs for 1200ms to smoothly track CSS animations (animate-slide-up, animate-fade-in)
   */
  private startTracking() {
    this.stopTracking();
    this.trackingFrames = 0;
    const maxFrames = 75; // ~1.2s at 60fps

    const track = () => {
      if (!this.anchorElement) return;
      this.updatePosition();
      this.trackingFrames++;
      if (this.trackingFrames < maxFrames) {
        this.trackingRaf = window.requestAnimationFrame(track);
      } else {
        this.trackingRaf = null;
      }
    };
    this.trackingRaf = window.requestAnimationFrame(track);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.anchorElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.updatePosition();
      });
      this.resizeObserver.observe(this.anchorElement);
    }
  }

  private stopTracking() {
    if (this.trackingRaf !== null) {
      window.cancelAnimationFrame(this.trackingRaf);
      this.trackingRaf = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /**
   * Sets the visual anchor element where the YouTube video should be rendered.
   * `ownerId` prevents race conditions where an unmounting view clears another view's anchor.
   */
  public setAnchor(element: HTMLElement | null, ownerId: string, isVertical: boolean = false) {
    if (!element) {
      // Only clear if the caller is the current active owner
      if (this.activeOwnerId === ownerId) {
        this.activeOwnerId = null;
        this.anchorElement = null;
        this.isVertical = false;
        this.stopTracking();
        this.updatePosition();
      }
      return;
    }

    this.activeOwnerId = ownerId;
    this.anchorElement = element;
    this.isVertical = isVertical;
    this.startTracking();
    this.updatePosition();
  }

  /**
   * Safe anchor clear helper with owner verification
   */
  public clearAnchor(ownerId: string) {
    this.setAnchor(null, ownerId);
  }

  /**
   * Legacy compatibility method
   */
  public setAnchorElement(element: HTMLElement | null, isVertical: boolean = false) {
    this.setAnchor(element, 'default', isVertical);
  }

  /**
   * Synchronizes the YouTube container position, size, and cropping with the target anchor.
   */
  public updatePosition() {
    const container = document.getElementById('rext-youtube-container');
    if (!container) return;

    if (!this.isVideoVisible || !this.anchorElement) {
      // Audio-only mode: keep off-screen
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '320px';
      container.style.height = '180px';
      container.style.opacity = '0.001';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-9999';
      container.style.overflow = 'hidden';
      container.style.visibility = 'hidden';
      return;
    }

    const rect = this.anchorElement.getBoundingClientRect();
    const width = rect.width || this.anchorElement.offsetWidth;
    const height = rect.height || this.anchorElement.offsetHeight;

    if (width <= 0 || height <= 0) {
      // Still in 0-size mount frame; will be caught by RAF tracking
      return;
    }

    const computed = window.getComputedStyle(this.anchorElement);
    container.style.position = 'fixed';
    container.style.top = `${rect.top}px`;
    container.style.left = `${rect.left}px`;
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.borderRadius = computed.borderRadius || '16px';
    container.style.overflow = 'hidden';
    container.style.zIndex = '53'; // Just above theater/vibes surface (z-50)
    container.style.opacity = '1';
    container.style.pointerEvents = 'none'; // Critical: all touches/clicks pass to REXT custom overlays
    container.style.visibility = 'visible';
    container.style.transition = 'none';

    const iframe = container.querySelector('iframe');
    if (iframe) {
      if (this.isVertical) {
        // Vertical 9:16 Reels / Shorts Feed Mode (REXT Vibes):
        // Scale and center-crop the 16:9 video so it fills the vertical screen completely with no black bars
        iframe.style.position = 'absolute';
        iframe.style.top = '50%';
        iframe.style.left = '50%';
        iframe.style.width = '350%';
        iframe.style.height = '100%';
        iframe.style.maxWidth = 'none';
        iframe.style.maxHeight = 'none';
        iframe.style.transform = 'translate(-50%, -50%)';
        iframe.style.transformOrigin = 'center center';
        iframe.style.pointerEvents = 'none';
        iframe.style.border = 'none';
      } else {
        // Standard 16:9 Theater & Mini Player Mode:
        // Scale 1.16x to hide top YouTube title bar and bottom watermark
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.maxWidth = '100%';
        iframe.style.maxHeight = '100%';
        iframe.style.transform = 'scale(1.16)';
        iframe.style.transformOrigin = 'center center';
        iframe.style.pointerEvents = 'none';
        iframe.style.border = 'none';
      }
    }
  }

  public setVideoVisibility(visible: boolean) {
    this.isVideoVisible = visible;
    this.updatePosition();
  }

  public getIsVideoVisible(): boolean {
    return this.isVideoVisible;
  }

  /**
   * Loads and plays a YouTube video at an optional start time
   */
  public async loadAndPlay(videoId: string, startSeconds: number = 0): Promise<boolean> {
    this.currentVideoId = videoId;
    this.queuedVideoId = videoId;
    this.queuedStartTime = startSeconds;

    const container = this.ensureContainer();

    // If player is ready, call loadVideoById
    if (this.isReady && this.player && typeof this.player.loadVideoById === 'function') {
      try {
        const cleanStart = Math.max(0, Math.floor(startSeconds));
        try {
          this.player.loadVideoById({
            videoId: videoId,
            startSeconds: cleanStart
          });
        } catch {
          this.player.loadVideoById(videoId, cleanStart);
        }

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
        this.updatePosition();
        return true;
      } catch (err) {
        console.warn('YouTube loadVideo error:', err);
      }
    }

    // Direct Iframe Fallback: if YT API hasn't initialized, embed directly so playback starts immediately
    let iframe = container.querySelector('iframe');
    if (!iframe) {
      const placeholder = document.getElementById('rext-yt-player-element');
      const startParam = Math.floor(startSeconds);
      const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&enablejsapi=1${startParam > 0 ? `&start=${startParam}` : ''}`;

      if (placeholder) {
        const directIframe = document.createElement('iframe');
        directIframe.id = 'rext-yt-player-element';
        directIframe.src = embedSrc;
        directIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        directIframe.setAttribute('allowfullscreen', 'true');
        placeholder.replaceWith(directIframe);
      }
    }

    if (!this.player && window.YT && window.YT.Player) {
      this.createPlayer();
    }

    this.updatePosition();
    return false;
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
      try {
        this.player.playVideo();
        this.startProgressPolling();
      } catch {}
    }
  }

  public pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
        this.stopProgressPolling();
      } catch {}
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
