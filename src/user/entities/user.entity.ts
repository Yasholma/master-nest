import { Exclude } from 'class-transformer';
import PublicFile from 'src/file/entities/file.entity';
import Post from 'src/posts/entities/post.entity';
import PrivateFile from 'src/privateFiles/privateFile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Address from './address.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ nullable: true })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @OneToOne(() => Address, { eager: true, cascade: true })
  @JoinColumn()
  public address?: Address;

  @OneToMany(() => Post, (post: Post) => post.author)
  public posts?: Post[];

  @OneToOne(() => PublicFile, { eager: true, nullable: true })
  @JoinColumn()
  public avatar?: PublicFile;

  @OneToMany(() => PrivateFile, (privateFile: PrivateFile) => privateFile.owner)
  public files?: PrivateFile[];
}

export default User;
