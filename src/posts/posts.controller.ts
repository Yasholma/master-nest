import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreatePostDTO, UpdatePostDTO } from './dtos';
import { Post as PostDoc } from './interfaces/post.interface';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts(): PostDoc[] {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPostById(@Param('id') id: string): PostDoc {
    return this.postsService.getPostById(Number(id));
  }

  @Post()
  async createPost(@Body() post: CreatePostDTO): Promise<PostDoc> {
    return this.postsService.createPost(post);
  }

  @Put(':id')
  async replacePost(
    @Param('id') id: string,
    @Body() post: UpdatePostDTO,
  ): Promise<PostDoc> {
    return this.postsService.replacePost(Number(id), post);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string): Promise<void> {
    this.postsService.deletePost(Number(id));
  }
}
