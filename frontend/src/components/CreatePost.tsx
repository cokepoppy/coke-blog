import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { getRandomColor } from '../data/mockData';
import type { Post } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { endpoints } from '../config/api';

const CreatePost = () => {
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [generatedPost, setGeneratedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  const handleCancel = () => {
      navigate('/');
  };

  const handlePublish = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("请先登录");
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(endpoints.posts, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: generatedPost?.title || topic,
            content: content,
            coverColor: generatedPost?.coverColor || getRandomColor(),
            status: 'published'
          })
        });

        if (response.ok) {
          const data = await response.json();
          const postId = data.data?.id;
          if (postId) {
            navigate(`/posts/${postId}`);
          } else {
            navigate('/');
          }
        } else {
          const data = await response.json();
          alert(`发布失败: ${data.message || '未知错误'}`);
        }
      } catch (error) {
        console.error('Publish error:', error);
        alert('发布出错，请检查网络或后端服务');
      }
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setStep('generating');

    if (content.trim()) {
      setTimeout(() => {
        const newPost: Post = {
          id: Date.now(),
          title: topic,
          excerpt: content.substring(0, 100).replace(/\n/g, ' ') + '...',
          category: "Original",
          date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
          readTime: Math.max(1, Math.ceil(content.length / 500)) + " 分钟阅读",
          author: "Me",
          coverColor: getRandomColor(),
          content: (
            <>
              {content.split('\n').map((para, idx) => (
                 para.trim() && <p key={idx} className="mb-6">{para.trim()}</p>
              ))}
            </>
          )
        };
        setGeneratedPost(newPost);
        setStep('review');
      }, 1000);
      return;
    }

    setTimeout(() => {
      const aiTitle = `关于"${topic}"的深度思考与未来展望`;
      const aiContent = `当我们谈论 **${topic}** 时，我们实际上是在审视人类自身的创造力边界。这是一个激动人心的时代，技术的进步速度往往超过了我们的想象。

### 核心视角的转变

对于 ${topic} 的理解，不能仅仅停留在表面。我们需要深入挖掘其背后的逻辑。就像建筑师在设计摩天大楼之前需要了解地质结构一样，我们在拥抱新技术之前，也必须理解其基础原理。

> "真正的创新往往来自于边缘地带，来自于那些看似不相关的领域之间的碰撞。"

综上所述，${topic} 不仅仅是一个趋势，它是一种信号。它提醒我们保持开放的心态，持续学习，在这个快速变化的世界中找到自己的位置。`;
      
      setContent(aiContent);

      const newPost: Post = {
        id: Date.now(),
        title: aiTitle,
        excerpt: `${topic} 正在重塑我们的认知边界。本文深入探讨了其核心机制、潜在影响以及我们应该如何应对这一变革...`,
        category: "AI Generated",
        date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
        readTime: "3 分钟阅读",
        author: "Claude (AI)",
        coverColor: getRandomColor(),
        content: (
          <>
            <p className="mb-6 first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-4px]">
              当我们谈论 <strong>{topic}</strong> 时，我们实际上是在审视人类自身的创造力边界。这是一个激动人心的时代，技术的进步速度往往超过了我们的想象。
            </p>
            <h3 className="font-serif text-2xl font-medium mt-8 mb-4">核心视角的转变</h3>
            <p className="mb-6">
              对于 {topic} 的理解，不能仅仅停留在表面。我们需要深入挖掘其背后的逻辑。就像建筑师在设计摩天大楼之前需要了解地质结构一样，我们在拥抱新技术之前，也必须理解其基础原理。
            </p>
            <blockquote className="border-l-2 border-stone-800 pl-6 italic my-8 text-xl font-serif text-stone-700">
              "真正的创新往往来自于边缘地带，来自于那些看似不相关的领域之间的碰撞。"
            </blockquote>
            <p className="mb-6">
              综上所述，{topic} 不仅仅是一个趋势，它是一种信号。它提醒我们保持开放的心态，持续学习，在这个快速变化的世界中找到自己的位置。
            </p>
          </>
        )
      };
      setGeneratedPost(newPost);
      setStep('review');
    }, 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 min-h-[60vh] flex flex-col justify-center">

      {step === 'input' && (
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="text-stone-600" size={32} />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900">
            今天想写点什么？
          </h2>
          <p className="text-stone-500 text-lg max-w-lg">
            输入一个话题让 AI 自动生成，或者直接贴入您写好的正文。
          </p>

          <div className="w-full max-w-xl relative mt-8 flex flex-col gap-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="请输入标题..."
              className="w-full bg-transparent border-b-2 border-stone-300 py-4 text-2xl md:text-3xl text-center font-serif text-stone-900 placeholder-stone-300 focus:border-stone-900 focus:outline-none transition-colors"
              autoFocus
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="（可选）在此处贴入正文... 如果留空，AI 将根据标题为您自动撰写全文。"
              className="w-full bg-[#FAFAF8] border border-stone-200 rounded-sm p-4 text-lg font-serif text-stone-700 placeholder-stone-300 focus:border-stone-900 focus:outline-none transition-colors min-h-[200px] resize-none shadow-inner"
            />
          </div>

          <div className="flex gap-4 mt-12">
             <button
              onClick={handleCancel}
              className="px-8 py-3 rounded-full text-stone-500 font-sans font-medium hover:bg-stone-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="group flex items-center gap-2 px-8 py-3 bg-stone-900 text-[#F4F3F0] rounded-full font-sans font-bold tracking-wide hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Sparkles size={18} />
              {content.trim() ? "预览文章" : "生成草稿"}
            </button>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-stone-300 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="animate-spin text-stone-900" size={48} />
          </div>
          <h3 className="font-serif text-2xl font-medium text-stone-700 animate-pulse">
            {content.trim() ? "正在排版整理..." : `正在构思关于"${topic}"的文章...`}
          </h3>
          <div className="flex flex-col gap-2 text-sm text-stone-400 font-sans">
            <span>正在分析语义...</span>
            <span>正在配比色调...</span>
            <span>正在撰写摘要...</span>
          </div>
        </div>
      )}

      {step === 'review' && generatedPost && (
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full mb-4">
              <CheckCircle2 size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">草稿已生成</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
              效果预览
            </h2>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-sm shadow-xl shadow-stone-200/50 border border-stone-100 mb-10 rotate-1 hover:rotate-0 transition-transform duration-500">
            <div
              className="aspect-[21/9] mb-6 overflow-hidden rounded-sm"
              style={{ backgroundColor: generatedPost.coverColor }}
            />

            <h3 className="font-serif text-3xl font-bold text-stone-900 mb-4">{generatedPost.title}</h3>
            <p className="font-serif text-lg text-stone-600 leading-relaxed mb-6">{generatedPost.excerpt}</p>
            <div className="flex items-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <span>{generatedPost.category}</span>
              <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
              <span>{generatedPost.date}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
             <button
              onClick={() => { setStep('input'); setTopic(''); setContent(''); }}
              className="w-full md:w-auto px-8 py-3 rounded-full text-stone-500 font-sans font-medium hover:bg-stone-200 transition-colors"
            >
              放弃并重试
            </button>
            <button
              onClick={handlePublish}
              className="w-full md:w-auto px-10 py-3 bg-[#D97757] text-white rounded-full font-sans font-bold tracking-wide hover:bg-[#c56645] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              立即发布
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
