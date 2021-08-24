import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDTO, UpdatePostDTO } from './dtos';
import { Post } from './interfaces/post.interface';

@Injectable()
export class PostsService {
  private lastPostId = 0;
  private posts: Post[] = [];

  getAllPosts(): Post[] {
    return this.posts;
  }

  getPostById(id: number): Post {
    const post = this.posts.find((post) => post.id === id);

    if (post) {
      return post;
    }

    throw new NotFoundException('Post not found');
  }

  replacePost(id: number, post: UpdatePostDTO): Post {
    const postIndex = this.posts.findIndex((post) => post.id === id);

    if (postIndex > -1) {
      this.posts[postIndex].title = post.title;
      this.posts[postIndex].content = post.content;
      return this.posts[postIndex];
    }
    throw new NotFoundException('Post not found');
  }

  createPost(post: CreatePostDTO): Post {
    const newPost: Post = {
      id: ++this.lastPostId,
      ...post,
    };
    this.posts.push(newPost);
    return newPost;
  }

  deletePost(id: number): void {
    const postIndex = this.posts.findIndex((post) => post.id === id);
    if (postIndex > -1) {
      this.posts.splice(postIndex, 1);
    } else {
      throw new NotFoundException('Post not found');
    }
  }
}
