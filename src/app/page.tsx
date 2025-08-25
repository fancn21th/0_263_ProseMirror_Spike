import ProseMirrorEditor from "@/components/ProseMirrorEditor";
import "./editor.css";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            ProseMirror Next.js Demo
          </h1>
          <p className="text-center text-gray-600 mb-8">
            一个基于 ProseMirror 和 Next.js 的简单富文本编辑器演示
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <ProseMirrorEditor />
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              功能特性
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>支持基本的文本格式化（粗体、斜体等）</li>
              <li>支持撤销/重做功能</li>
              <li>支持段落和标题</li>
              <li>支持键盘快捷键</li>
              <li>现代化的用户界面</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
