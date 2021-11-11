import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PaginationResult } from 'src/util/pagination.interface';
import Post from './entities/post.entity';
import {
  PostCountResult,
  PostSearchBody,
  PostSearchResult,
} from './interfaces/post-search-body';

@Injectable()
export class PostSearchService {
  index = 'posts';
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost(post: Post) {
    return this.elasticsearchService.index<PostSearchResult, PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id,
      },
    });
  }

  private async _count(query: string, fields: string[]): Promise<number> {
    const { body } = await this.elasticsearchService.count<PostCountResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query,
            fields,
          },
        },
      },
    });
    return body.count;
  }

  async search(
    text: string,
    offset?: number,
    limit?: number,
    startId?: number,
  ): Promise<PaginationResult<PostSearchBody[]>> {
    let separateCount = 0;

    if (startId) {
      separateCount = await this._count(text, [
        'title',
        'content',
        'paragraphs',
      ]);
    }
    const { body } = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      from: offset,
      size: limit,
      body: {
        query: {
          bool: {
            should: {
              multi_match: {
                query: text,
                fields: ['title', 'content', 'paragraphs'],
              },
            },
            filter: {
              range: {
                id: {
                  gt: startId,
                },
              },
            },
          },
        },
        sort: {
          id: {
            order: 'asc',
          },
        },
      },
    });

    const count = body.hits.total;
    const hits = body.hits.hits;
    const items = hits.map((item) => item._source);

    return {
      count: startId ? separateCount : count,
      items,
    };
  }

  async update(post: Post) {
    const newBody: PostSearchBody = {
      id: post.id,
      title: post.title,
      content: post.title,
      authorId: post.author.id,
    };

    const script = Object.entries(newBody).reduce(
      (result, [key, value]) => `${result} _ctx.source.${key}='${value}'`,
      '',
    );

    return this.elasticsearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: post.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }

  async remove(postId: number): Promise<void> {
    this.elasticsearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }
}
