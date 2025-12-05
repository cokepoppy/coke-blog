import { AppDataSource } from '../config/database';
import { Post, PostStatus } from '../entities/Post';
import { Category } from '../entities/Category';
import { Tag } from '../entities/Tag';
import { AppError } from '../middlewares/errorHandler';
import { slugify, generateUniqueSlug } from '../utils/slug';
import { In, Not } from 'typeorm';

export class PostService {
  private postRepo = AppDataSource.getRepository(Post);
  private categoryRepo = AppDataSource.getRepository(Category);
  private tagRepo = AppDataSource.getRepository(Tag);

  async getPosts(params: {
    page?: number;
    limit?: number;
    status?: PostStatus;
    category?: string;
    tag?: string;
    search?: string;
    sort?: 'latest' | 'popular' | 'oldest';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    // 筛选条件
    if (params.status) {
      queryBuilder.andWhere('post.status = :status', { status: params.status });
    }

    if (params.category) {
      queryBuilder.andWhere('category.slug = :category', { category: params.category });
    }

    if (params.tag) {
      queryBuilder.andWhere('tags.slug = :tag', { tag: params.tag });
    }

    if (params.search) {
      queryBuilder.andWhere(
        '(post.title LIKE :search OR post.content LIKE :search)',
        { search: `%${params.search}%` }
      );
    }

    // 排序
    switch (params.sort) {
      case 'popular':
        queryBuilder.orderBy('post.viewCount', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('post.publishedAt', 'ASC');
        break;
      default:
        queryBuilder.orderBy('post.publishedAt', 'DESC');
    }

    // 分页
    const [posts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      posts: posts.map(post => this.sanitizePost(post)),
      total,
      page,
      limit,
    };
  }

  async getPostById(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    // 增加浏览次数
    post.viewCount += 1;
    await this.postRepo.save(post);

    return post;
  }

  async getPostBySlug(slug: string) {
    const post = await this.postRepo.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags'],
    });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    // 增加浏览次数
    post.viewCount += 1;
    await this.postRepo.save(post);

    return post;
  }

  async createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    categoryId?: number;
    tags?: string[];
    coverColor?: string;
    coverImage?: string;
    status?: PostStatus;
    isAiGenerated?: boolean;
    authorId: number;
  }) {
    // 生成 slug
    const baseSlug = slugify(data.title);
    const existingPosts = await this.postRepo.find({ select: ['slug'] });
    const slug = generateUniqueSlug(
      baseSlug,
      existingPosts.map(p => p.slug)
    );

    // 计算阅读时间（简单估算：500字/分钟）
    const readTime = Math.max(1, Math.ceil(data.content.length / 500));

    // 处理分类
    let category = null;
    if (data.categoryId) {
      category = await this.categoryRepo.findOne({ where: { id: data.categoryId } });
    }

    // 处理标签
    let tags: Tag[] = [];
    if (data.tags && data.tags.length > 0) {
      tags = await this.processTagsNames(data.tags);
    }

    // 转换内容为HTML（保留换行格式）
    const contentHtml = this.convertTextToHtml(data.content);

    // 创建文章
    const post = this.postRepo.create({
      title: data.title,
      slug,
      content: data.content,
      contentHtml,
      excerpt: data.excerpt || data.content.substring(0, 150),
      categoryId: data.categoryId,
      coverColor: data.coverColor || '#D6D1CB',
      coverImage: data.coverImage,
      status: data.status || PostStatus.DRAFT,
      isAiGenerated: data.isAiGenerated || false,
      authorId: data.authorId,
      readTime,
      tags,
      publishedAt: (data.status === PostStatus.PUBLISHED) ? new Date() : null,
    });

    const savedPost = await this.postRepo.save(post);

    // 更新分类文章数
    if (category && data.status === PostStatus.PUBLISHED) {
      category.postCount += 1;
      await this.categoryRepo.save(category);
    }

    return await this.getPostById(savedPost.id);
  }

  async updatePost(id: number, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    categoryId?: number;
    tags?: string[];
    coverColor?: string;
    coverImage?: string;
    status?: PostStatus;
  }, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author', 'tags'],
    });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    // 检查权限
    if (post.authorId !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权修改此文章');
    }

    // 更新标题时更新 slug
    if (data.title && data.title !== post.title) {
      const baseSlug = slugify(data.title);
      const existingPosts = await this.postRepo.find({
        where: { id: Not(id) },
        select: ['slug'],
      });
      post.slug = generateUniqueSlug(
        baseSlug,
        existingPosts.map(p => p.slug)
      );
    }

    // 更新字段
    Object.assign(post, data);

    // 如果状态变更为已发布，且之前没有发布时间，则设置发布时间
    if (data.status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    // 更新阅读时间和内容HTML
    if (data.content) {
      post.readTime = Math.max(1, Math.ceil(data.content.length / 500));
      post.contentHtml = this.convertTextToHtml(data.content);
    }

    // 处理标签
    if (data.tags) {
      post.tags = await this.processTagsNames(data.tags);
    }

    await this.postRepo.save(post);

    return await this.getPostById(id);
  }

  async deletePost(id: number, userId: number) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    if (post.authorId !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权删除此文章');
    }

    await this.postRepo.remove(post);
  }

  async publishPost(id: number, userId: number) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    if (post.authorId !== userId) {
      throw new AppError(403, 'FORBIDDEN', '无权发布此文章');
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();

    await this.postRepo.save(post);

    return await this.getPostById(id);
  }

  async likePost(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', '文章不存在');
    }

    post.likeCount += 1;
    await this.postRepo.save(post);

    return { likeCount: post.likeCount };
  }

  private async processTagsNames(tagNames: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];

    for (const name of tagNames) {
      const slug = slugify(name);
      let tag = await this.tagRepo.findOne({ where: { slug } });

      if (!tag) {
        tag = this.tagRepo.create({ name, slug });
        await this.tagRepo.save(tag);
      }

      tags.push(tag);
    }

    return tags;
  }

  private sanitizePost(post: Post) {
    // 不返回完整 content，只返回 excerpt（在列表中）
    const { content, ...sanitized } = post;
    return sanitized;
  }

  private convertTextToHtml(text: string): string {
    if (!text) return '';

    // 转义HTML特殊字符
    const escapeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    // 分割段落（双换行符）
    const paragraphs = text.split(/\n\n+/);

    // 将每个段落包裹在<p>标签中，并将单个换行符转换为<br>
    const htmlParagraphs = paragraphs
      .map(para => para.trim())
      .filter(para => para.length > 0)
      .map(para => {
        // 处理段落内的单个换行符
        const lines = para.split('\n').map(line => escapeHtml(line.trim()));
        const paraContent = lines.join('<br>\n');
        return `<p>${paraContent}</p>`;
      });

    return htmlParagraphs.join('\n');
  }
}
