import { Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => (
  <footer className="bg-stone-100 border-t border-stone-200 pt-16 pb-12 mt-auto">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <h4 className="font-serif text-xl font-bold mb-4">可小乐的Blog.</h4>
          <p className="text-stone-500 text-sm max-w-sm leading-relaxed">
            致力于探索人工智能、设计美学与人类未来的交叉点。我们相信清晰的思考和诚实的写作具有改变世界的力量。
          </p>
        </div>
        <div>
          <h5 className="font-sans font-semibold text-sm uppercase tracking-wider text-stone-400 mb-4">栏目</h5>
          <ul className="space-y-3 text-stone-600 text-sm">
            <li><a href="#" className="hover:text-stone-900">AI 安全</a></li>
            <li><a href="#" className="hover:text-stone-900">研究论文</a></li>
            <li><a href="#" className="hover:text-stone-900">工程博客</a></li>
            <li><a href="#" className="hover:text-stone-900">公司动态</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-sans font-semibold text-sm uppercase tracking-wider text-stone-400 mb-4">关注我们</h5>
          <div className="flex gap-4 text-stone-600">
            <Twitter size={20} className="hover:text-stone-900 cursor-pointer" />
            <Linkedin size={20} className="hover:text-stone-900 cursor-pointer" />
            <Facebook size={20} className="hover:text-stone-900 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-stone-200 text-xs text-stone-500 font-sans">
        <p>© 2024 MyBlog Inc. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-stone-900">隐私政策</a>
          <a href="#" className="hover:text-stone-900">服务条款</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
