import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  duration?: number; // for videos in seconds
  aspectRatio?: number;
  size?: number; // file size in bytes
}

export interface MediaError {
  id: string;
  type: 'load_error' | 'network_error' | 'format_error';
  message: string;
  fallbackUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private mediaErrors = new BehaviorSubject<MediaError[]>([]);
  public mediaErrors$ = this.mediaErrors.asObservable();

  // Fallback images for different scenarios
  private readonly fallbackImages = {
    user: 'assets/images/default-avatar.svg',
    product: 'assets/images/default-product.svg',
    post: 'assets/images/default-post.svg',
    story: 'assets/images/default-story.svg'
  };

  // Video library - should be loaded from API
  private readonly sampleVideos: any[] = [];

  // Broken URL patterns to fix
  private readonly brokenUrlPatterns = [
    '/uploads/stories/images/',
    '/uploads/stories/videos/',
    'sample-videos.com',
    'localhost:',
    'file://'
  ];

  constructor() {}

  /**
   * Get a safe image URL with fallback handling and broken URL fixing
   */
  getSafeImageUrl(url: string | undefined, type: 'user' | 'product' | 'post' | 'story' = 'post'): string {
    if (!url || url.trim() === '') {
      return this.fallbackImages[type];
    }

    // Fix broken URLs
    const fixedUrl = this.fixBrokenUrl(url, type);
    if (fixedUrl !== url) {
      return fixedUrl;
    }

    // Check if URL is valid
    try {
      new URL(url);
      return url;
    } catch {
      // If not a valid URL, treat as relative path
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url;
      }
      // Return fallback for invalid URLs
      return this.fallbackImages[type];
    }
  }

  /**
   * Fix broken URLs by replacing them with working alternatives
   */
  private fixBrokenUrl(url: string, type: 'user' | 'product' | 'post' | 'story'): string {
    // Check for broken patterns
    for (const pattern of this.brokenUrlPatterns) {
      if (url.includes(pattern)) {
        // Replace with appropriate fallback or working URL
        if (pattern === '/uploads/stories/images/' || pattern === '/uploads/stories/videos/') {
          return this.getReplacementMediaUrl(url, type);
        }
        if (pattern === 'sample-videos.com') {
          return this.getRandomSampleVideo().url;
        }
        if (pattern === 'localhost:' || pattern === 'file://') {
          return this.fallbackImages[type];
        }
      }
    }
    return url;
  }

  /**
   * Get replacement media URL for broken local paths
   */
  private getReplacementMediaUrl(originalUrl: string, type: 'user' | 'product' | 'post' | 'story'): string {
    // Map broken local URLs to working Unsplash URLs based on content
    const urlMappings: { [key: string]: string } = {
      'summer-collection': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
      'behind-scenes': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      'customer-spotlight': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'styling-tips': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'design': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800'
    };

    // Try to match content from filename
    for (const [key, replacementUrl] of Object.entries(urlMappings)) {
      if (originalUrl.toLowerCase().includes(key)) {
        return replacementUrl;
      }
    }

    // Return appropriate fallback
    return this.fallbackImages[type];
  }

  /**
   * Handle image load errors
   */
  handleImageError(event: Event, fallbackType: 'user' | 'product' | 'post' | 'story' = 'post'): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.fallbackImages[fallbackType]) {
      img.src = this.fallbackImages[fallbackType];
      
      // Log error for debugging
      this.logMediaError({
        id: img.src,
        type: 'load_error',
        message: `Failed to load image: ${img.src}`,
        fallbackUrl: this.fallbackImages[fallbackType]
      });
    }
  }

  /**
   * Get a random sample video with enhanced metadata
   */
  getRandomSampleVideo(): { url: string; thumbnail: string; duration: number; title?: string; description?: string } {
    const randomIndex = Math.floor(Math.random() * this.sampleVideos.length);
    return this.sampleVideos[randomIndex];
  }

  /**
   * Get all sample videos with enhanced metadata
   */
  getSampleVideos(): { url: string; thumbnail: string; duration: number; title?: string; description?: string }[] {
    return [...this.sampleVideos];
  }

  /**
   * Get video by content type (for better matching)
   */
  getVideoByType(contentType: 'fashion' | 'style' | 'showcase' | 'tutorial' | 'story'): { url: string; thumbnail: string; duration: number; title?: string; description?: string } {
    const typeMapping: { [key: string]: number } = {
      'fashion': 0, // ForBiggerBlazes - Fashion Showcase
      'style': 1,   // ForBiggerEscapes - Style Journey
      'showcase': 2, // ForBiggerFun - Fashion Fun
      'tutorial': 3, // ForBiggerJoyrides - Style Ride
      'story': 5    // Sintel - Fashion Story
    };

    const index = typeMapping[contentType] || 0;
    return this.sampleVideos[index] || this.sampleVideos[0];
  }

  /**
   * Check if URL is a video
   */
  isVideoUrl(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('video') || 
           lowerUrl.includes('.mp4');
  }

  /**
   * Get video thumbnail
   */
  getVideoThumbnail(videoUrl: string): string {
    // Check if it's one of our sample videos
    const sampleVideo = this.sampleVideos.find(v => v.url === videoUrl);
    if (sampleVideo) {
      return sampleVideo.thumbnail;
    }

    // For other videos, try to generate thumbnail URL or use fallback
    return this.fallbackImages.post;
  }

  /**
   * Get video duration
   */
  getVideoDuration(videoUrl: string): number {
    const sampleVideo = this.sampleVideos.find(v => v.url === videoUrl);
    return sampleVideo ? sampleVideo.duration : 30; // Default 30 seconds
  }

  /**
   * Process media items from database
   */
  processMediaItems(mediaArray: any[]): MediaItem[] {
    if (!mediaArray || !Array.isArray(mediaArray)) {
      return [];
    }

    return mediaArray.map((media, index) => {
      const isVideo = this.isVideoUrl(media.url);
      
      return {
        id: media._id || `media_${index}`,
        type: isVideo ? 'video' : 'image',
        url: this.getSafeImageUrl(media.url),
        thumbnailUrl: isVideo ? this.getVideoThumbnail(media.url) : undefined,
        alt: media.alt || '',
        duration: isVideo ? this.getVideoDuration(media.url) : undefined,
        aspectRatio: media.aspectRatio || (isVideo ? 16/9 : 1),
        size: media.size
      };
    });
  }

  /**
   * Add sample videos to existing media array with intelligent content matching
   */
  enhanceWithSampleVideos(mediaArray: any[], videoCount: number = 2, contentHint?: string): MediaItem[] {
    const processedMedia = this.processMediaItems(mediaArray);

    // Add sample videos if we don't have enough media or if videos are broken
    const needsVideoEnhancement = processedMedia.length < 3 ||
      processedMedia.some(media => media.type === 'video' && this.isBrokenUrl(media.url));

    if (needsVideoEnhancement) {
      const videosToAdd = Math.min(videoCount, this.sampleVideos.length);

      for (let i = 0; i < videosToAdd; i++) {
        // Try to match video content to the hint
        let sampleVideo;
        if (contentHint) {
          sampleVideo = this.getVideoByContentHint(contentHint, i);
        } else {
          sampleVideo = this.sampleVideos[i];
        }

        processedMedia.push({
          id: `enhanced_video_${i}`,
          type: 'video',
          url: sampleVideo.url,
          thumbnailUrl: sampleVideo.thumbnail,
          alt: sampleVideo.title || `Enhanced video ${i + 1}`,
          duration: sampleVideo.duration,
          aspectRatio: 16/9
        });
      }
    }

    return processedMedia;
  }

  /**
   * Get video based on content hint for better matching
   */
  private getVideoByContentHint(hint: string, fallbackIndex: number = 0): any {
    const lowerHint = hint.toLowerCase();

    if (lowerHint.includes('fashion') || lowerHint.includes('style')) {
      return this.getVideoByType('fashion');
    }
    if (lowerHint.includes('tutorial') || lowerHint.includes('tips')) {
      return this.getVideoByType('tutorial');
    }
    if (lowerHint.includes('showcase') || lowerHint.includes('collection')) {
      return this.getVideoByType('showcase');
    }
    if (lowerHint.includes('story') || lowerHint.includes('behind')) {
      return this.getVideoByType('story');
    }

    return this.sampleVideos[fallbackIndex] || this.sampleVideos[0];
  }

  /**
   * Check if URL is broken
   */
  private isBrokenUrl(url: string): boolean {
    return this.brokenUrlPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Log media errors for debugging
   */
  private logMediaError(error: MediaError): void {
    const currentErrors = this.mediaErrors.value;
    this.mediaErrors.next([...currentErrors, error]);
    console.warn('Media Error:', error);
  }

  /**
   * Clear media errors
   */
  clearMediaErrors(): void {
    this.mediaErrors.next([]);
  }

  /**
   * Preload media for better performance
   */
  preloadMedia(mediaItems: MediaItem[]): Promise<void[]> {
    const promises = mediaItems.map(media => {
      return new Promise<void>((resolve, reject) => {
        if (media.type === 'image') {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${media.url}`));
          img.src = media.url;
        } else if (media.type === 'video') {
          const video = document.createElement('video');
          video.onloadeddata = () => resolve();
          video.onerror = () => reject(new Error(`Failed to load video: ${media.url}`));
          video.src = media.url;
          video.load();
        }
      });
    });

    return Promise.all(promises);
  }
}
