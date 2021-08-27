import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { ExceptionsLoggerFilter } from 'src/exceptions/index.exceptions';
import { ExcludeNullInterceptor } from 'src/interceptors/exclude-null.interceptor';
import { CreatePostDTO, FindOneParams, UpdatePostDTO } from './dtos';
import { PostsService } from './posts.service';

@Controller('posts')
@UseInterceptors(ExcludeNullInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  @UseFilters(ExceptionsLoggerFilter)
  getPostById(@Param() { id }: FindOneParams) {
    return this.postsService.getPostById(Number(id));
  }

  @Post()
  @UseGuards(JwtAthenticationGuard)
  async createPost(@Body() post: CreatePostDTO) {
    return this.postsService.createPost(post);
  }

  @Put(':id')
  async replacePost(@Param('id') id: string, @Body() post: UpdatePostDTO) {
    return this.postsService.replacePost(Number(id), post);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    this.postsService.deletePost(Number(id));
  }
}
