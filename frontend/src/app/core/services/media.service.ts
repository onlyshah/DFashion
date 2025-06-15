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
    user: '/assets/images/default-avatar.svg',
    product: '/assets/images/default-product.svg',
    post: '/assets/images/default-post.svg',
    story: '/assets/images/default-story.svg'
  };

  // Backup fallback images (simple colored placeholders)
  private readonly backupFallbacks = {
    user: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNjIgNiAxOEMxMC4wMSAyMCAxMy45OSAyMCAxOCAxOEMxNi45OSAxNS42MiAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=',
    product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+',
    post: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkJGQ0ZEIi8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNFNUU3RUIiLz4KPC9zdmc+',
    story: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkVGM0Y0Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc2IDguODM3ODQgOS4wMjY3IDExLjE3MTYgNi42OTMwNEMxMy41MDU0IDQuMzU5MzggMTYuNjg2MyAzLjA0MzQ4IDIwIDMuMDQzNDhDMjMuMzEzNyAzLjA0MzQ4IDI2LjQ5NDYgNC4zNTkzOCAyOC44Mjg0IDYuNjkzMDRDMzEuMTYyMiA5LjAyNjcgMzIuNDc4MyAxMi4yMDc2IDMyLjQ3ODMgMTUuNTIxN0MzMi40NzgzIDE4LjgzNTggMzEuMTYyMiAyMi4wMTY3IDI4LjgyODQgMjQuMzUwM0MyNi40OTQ2IDI2LjY4MzkgMjMuMzEzNyAyOCAyMCAyOFoiIGZpbGw9IiNGQ0E1QTUiLz4KPC9zdmc+'
  };

  // Video library - should be loaded from API
  private readonly sampleVideos: any[] = [];

  // Broken URL patterns to fix
  private readonly brokenUrlPatterns = [
    '/uploads/stories/images/',
    '/uploads/stories/videos/',
    'sample-videos.com',
    'localhost:4200/assets/',
    'file://'
  ];

  constructor() {}

  /**
   * Get a reliable fallback image that always works
   */
  getReliableFallback(type: 'user' | 'product' | 'post' | 'story' = 'post'): string {
    return this.backupFallbacks[type];
  }

  /**
   * Check if an image URL is likely to fail
   */
  isLikelyToFail(url: string): boolean {
    return this.isExternalImageUrl(url) || this.isBrokenUrl(url);
  }

  /**
   * Get a safe image URL with fallback handling and broken URL fixing
   */
  getSafeImageUrl(url: string | undefined, type: 'user' | 'product' | 'post' | 'story' = 'post'): string {
    if (!url || url.trim() === '') {
      return this.backupFallbacks[type]; // Use base64 fallback for empty URLs
    }

    // Fix broken URLs
    const fixedUrl = this.fixBrokenUrl(url, type);
    if (fixedUrl !== url) {
      return fixedUrl;
    }

    // Handle localhost URLs that might be broken
    if (url.includes('localhost:4200/assets/')) {
      const assetPath = url.split('localhost:4200')[1];
      return assetPath;
    }

    // For external images that might fail, provide a more reliable fallback
    if (this.isExternalImageUrl(url)) {
      // Return the URL but we know it might fail and will fallback gracefully
      return url;
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
      // Return base64 fallback for invalid URLs
      return this.backupFallbacks[type];
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
        if (pattern === 'localhost:4200/assets/') {
          // Extract the asset path and return it as relative
          const assetPath = url.split('localhost:4200')[1];
          return assetPath;
        }
        if (pattern === 'file://') {
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
   * Handle image load errors with progressive fallback
   */
  handleImageError(event: Event, fallbackType: 'user' | 'product' | 'post' | 'story' = 'post'): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    const originalSrc = img.src;

    // First try: Use SVG fallback from assets
    if (!originalSrc.includes(this.fallbackImages[fallbackType]) && !originalSrc.startsWith('data:')) {
      img.src = this.fallbackImages[fallbackType];

      // Only log meaningful errors (not external image failures)
      if (!this.isExternalImageUrl(originalSrc) && !originalSrc.includes('localhost:4200')) {
        this.logMediaError({
          id: originalSrc,
          type: 'load_error',
          message: `Failed to load image: ${originalSrc}`,
          fallbackUrl: this.fallbackImages[fallbackType]
        });
      }
      return;
    }

    // Second try: Use base64 backup fallback if SVG also fails
    if (originalSrc.includes(this.fallbackImages[fallbackType])) {
      img.src = this.backupFallbacks[fallbackType];
      // Only warn for local asset failures, not external
      if (!this.isExternalImageUrl(originalSrc)) {
        console.warn(`SVG fallback failed, using backup for ${fallbackType}:`, originalSrc);
      }
      return;
    }
  }

  /**
   * Check if URL is an external image (Unsplash, etc.)
   */
  private isExternalImageUrl(url: string): boolean {
    const externalDomains = [
      'unsplash.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'placehold.it',
      'placeholder.com'
    ];

    return externalDomains.some(domain => url.includes(domain));
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
   * Log media errors for debugging (with smart filtering)
   */
  private logMediaError(error: MediaError): void {
    const currentErrors = this.mediaErrors.value;
    this.mediaErrors.next([...currentErrors, error]);

    // Only log to console if it's not an external image failure
    if (!this.isExternalImageUrl(error.id)) {
      console.warn('Media Error:', error);
    }
  }

  /**
   * Clear media errors
   */
  clearMediaErrors(): void {
    this.mediaErrors.next([]);
  }

  /**
   * Preload media for better performance with graceful error handling
   */
  preloadMedia(mediaItems: MediaItem[]): Promise<void[]> {
    const promises = mediaItems.map(media => {
      return new Promise<void>((resolve) => {
        if (media.type === 'image') {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => {
            // Only log errors for non-external images
            if (!this.isExternalImageUrl(media.url)) {
              console.warn(`Failed to preload image: ${media.url}`);
            }
            resolve(); // Resolve anyway to not break the promise chain
          };
          img.src = media.url;
        } else if (media.type === 'video') {
          const video = document.createElement('video');
          video.onloadeddata = () => resolve();
          video.onerror = () => {
            // Only log errors for non-external videos
            if (!this.isExternalImageUrl(media.url)) {
              console.warn(`Failed to preload video: ${media.url}`);
            }
            resolve(); // Resolve anyway to not break the promise chain
          };
          video.src = media.url;
          video.load();
        } else {
          resolve(); // Unknown type, just resolve
        }
      });
    });

    return Promise.all(promises);
  }
}
