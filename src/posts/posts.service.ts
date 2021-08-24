import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDTO, UpdatePostDTO } from './dtos';
import Post from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async getPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne(id);

    if (post) {
      return post;
    }

    throw new NotFoundException('Post not found');
  }

  async replacePost(id: number, post: UpdatePostDTO): Promise<Post> {
    await this.postsRepository.update(id, post);

    const updatedPost = await this.postsRepository.findOne(id);
    if (updatedPost) {
      return updatedPost;
    }

    throw new NotFoundException('Post not found');
  }

  async createPost(post: CreatePostDTO): Promise<Post> {
    const newPost = this.postsRepository.create(post);
    await this.postsRepository.save(newPost);
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    const deletePost = await this.postsRepository.delete(id);
    if (!deletePost.affected) {
      throw new NotFoundException('Post not found');
    }
  }
}
