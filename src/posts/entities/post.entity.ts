import { Transform } from 'class-transformer';
import Category from 'src/category/entities/category.entity';
import User from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  // @Column('text', { array: true, nullable: true })
  @Column('simple-array', { nullable: true })
  public paragraphs: string[];

  @Column({ nullable: true })
  @Transform(({ value }) => {
    if (!!value) {
      return value;
    }
  })
  public category?: string;

  @Index('post_authorId_index')
  @ManyToOne(() => User, (author: User) => author.posts)
  public author: User;

  @ManyToMany(() => Category, (category: Category) => category.posts)
  @JoinTable()
  public categories: Category[];
}

export default Post;
