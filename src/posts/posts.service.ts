import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostNotFoundException } from 'src/exceptions/index.exceptions';
import { PaginationResult } from 'src/util/pagination.interface';
import { Repository, In, FindManyOptions, MoreThan } from 'typeorm';
import { CreatePostDTO, UpdatePostDTO } from './dtos';
import { PostSearchService } from './postSearch.service';

import User from 'src/user/entities/user.entity';
import Post from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    private readonly postSearchService: PostSearchService,
  ) {}

  async getAllPosts(
    offset?: number,
    limit?: number,
    startId?: number,
  ): Promise<PaginationResult<Post[]>> {
    const where: FindManyOptions<Post>['where'] = {};
    let separateCount = 0;

    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.postsRepository.count();
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where,
      relations: ['author'],
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
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
      await this.postSearchService.update(updatedPost);
      return updatedPost;
    }

    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDTO, user: User): Promise<Post> {
    const newPost = this.postsRepository.create({ ...post, author: user });
    await this.postsRepository.save(newPost);
    this.postSearchService.indexPost(newPost);
    return newPost;
  }

  async deletePost(id: number): Promise<void> {
    const deletePost = await this.postsRepository.delete(id);
    if (!deletePost.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postSearchService.remove(id);
  }

  async searchPost(
    text: string,
    offset?: number,
    limit?: number,
    startId?: number,
  ): Promise<PaginationResult<Post[]>> {
    const res = await this.postSearchService.search(
      text,
      offset,
      limit,
      startId,
    );
    const ids = res.items.map((item) => item.id);

    if (!ids.length) {
      return {
        items: [],
        count: 0,
      };
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where: {
        id: In(ids),
      },
    });

    return {
      items,
      count,
    };
  }

  async getPostsWithParagraph(paragraph: string): Promise<Post[]> {
    return this.postsRepository.query(
      'SELECT * FROM post WHERE $1 = ANY(paragraphs)',
      [paragraph],
    );
  }
}
