import BlogPostCard from './BlogPostCard';
import type { Post } from '../data/mockData';

interface BlogListProps {
    posts: Post[];
}

const BlogList = ({ posts }: BlogListProps) => {
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-16 md:mb-24 pt-8 border-t border-stone-900">
        <h2 className="font-serif text-5xl md:text-7xl font-medium text-stone-900 mb-6 tracking-tight">
          可小乐的Blog.
        </h2>
        <p className="font-serif text-xl md:text-2xl text-stone-500 max-w-2xl leading-relaxed">
          关于人工智能、设计哲学以及我们如何构建未来的思考与探索。
        </p>
      </div>

      {featuredPost && (
        <section className="mb-24">
          <BlogPostCard post={featuredPost} featured={true} />
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {regularPosts.map(post => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </section>

      <div className="mt-24 text-center">
        <button className="inline-flex items-center px-8 py-4 border border-stone-300 text-stone-600 font-sans text-sm font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 rounded-sm">
          查看更多文章
        </button>
      </div>
    </div>
  );
};

export default BlogList;
