import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dtos/index.dtos';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getCategoryById(Number(id));
  }

  @Post()
  async addCategory(@Body() body: CreateCategoryDTO) {
    return this.categoryService.addCategory(body);
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDTO,
  ) {
    return this.categoryService.updateCategory(Number(id), body);
  }
}
