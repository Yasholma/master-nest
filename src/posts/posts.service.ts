import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostNotFoundException } from 'src/exceptions/index.exceptions';
import User from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostDTO, UpdatePostDTO } from './dtos';
import Post from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.find({ relations: ['author'] });
  }

  async getPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });

    if (post) {
      return post;
    }

    throw new PostNotFoundException(id);
  }

  async replacePost(id: number, post: UpdatePostDTO): Promise<Post> {
    await this.postsRepository.update(id, post);

    const updatedPost = await this.postsRepository.findOne(id, {
      relations: ['author'],
    });
    if (updatedPost) {
      return updatedPost;
    }

    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDTO, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({ ...post, author: user });
    await this.postsRepository.save(newPost);
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    const deletePost = await this.postsRepository.delete(id);
    if (!deletePost.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
