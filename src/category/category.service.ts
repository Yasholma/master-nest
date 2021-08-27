import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryNotFoundException } from 'src/exceptions/index.exceptions';
import { Repository } from 'typeorm';
import { CreateCategoryDTO, UpdateCategoryDTO } from './dtos/index.dtos';
import Category from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['posts'] });
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne(id, {
      relations: ['posts'],
    });

    if (category) {
      return category;
    }

    throw new CategoryNotFoundException(id);
  }

  async addCategory(categoryData: CreateCategoryDTO): Promise<Category> {
    const newCategory = this.categoryRepository.create({ ...categoryData });
    await this.categoryRepository.save(newCategory);
    return newCategory;
  }

  async updateCategory(
    id: number,
    categoryData: UpdateCategoryDTO,
  ): Promise<Category> {
    await this.categoryRepository.update(id, categoryData);

    const updatedCategory = await this.categoryRepository.findOne(id, {
      relations: ['posts'],
    });
    if (updatedCategory) {
      return updatedCategory;
    }

    throw new CategoryNotFoundException(id);
  }
}
