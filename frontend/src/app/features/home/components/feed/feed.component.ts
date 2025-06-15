import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../core/models/post.model';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  loading = true;
  hasMore = true;
  currentPage = 1;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;

    this.postService.getPosts(this.currentPage).subscribe({
      next: (response) => {
        if (this.currentPage === 1) {
          this.posts = response.posts;
        } else {
          this.posts = [...this.posts, ...response.posts];
        }

        this.hasMore = response.pagination.current < response.pagination.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
        this.posts = [];
      }
    });
  }



  loadMorePosts() {
    this.currentPage++;
    this.loadPosts();
  }

  trackByPostId(index: number, post: Post): string {
    return post._id;
  }

  onPostLiked(postId: string) {
    console.log('Post liked:', postId);
    // Handle post like
  }

  onPostCommented(data: { postId: string; comment: string }) {
    console.log('Post commented:', data);
    // Handle post comment
  }

  onPostShared(postId: string) {
    console.log('Post shared:', postId);
    // Handle post share
  }
}
