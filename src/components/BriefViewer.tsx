import React, { useState } from 'react';
import { BriefSection } from '../types';
import { Download, Printer, Edit2, Check, RotateCcw, AlertCircle, FileText, Sparkles, BookOpen, Github, ExternalLink, GitBranch, Terminal, Copy, CheckCircle2, X, Info, Folder, File, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BriefViewerProps {
  sections: BriefSection[];
  onUpdateSections: (sections: BriefSection[]) => void;
  onReset: () => void;
}

export default function BriefViewer({ sections, onUpdateSections, onReset }: BriefViewerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ყველა');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // GitHub Modal States
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubTab, setGithubTab] = useState<'preview' | 'code' | 'instructions'>('preview');
  const [copied, setCopied] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushStep, setPushStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const categories = ['ყველა', ...Array.from(new Set(sections.map(s => s.category)))];

  const handleStartEdit = (section: BriefSection) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditContent(section.content);
  };

  const handleSave = (id: string) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        return { ...s, title: editTitle, content: editContent };
      }
      return s;
    });
    onUpdateSections(updated);
    setEditingId(null);
    triggerNotification('ცვლილებები წარმატებით შეინახა ბრიფში!');
  };

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const compileToMarkdown = () => {
    return `# სასტუმრო საზანო — პროექტის ბრიფი და გეგმა (Ethno Sazano Hotel)

> **ბოლო განახლება:** ${new Date().toLocaleDateString('ka-GE')}
> **ოფიციალური დომენები:** esh.ge / ethnosazanohotel.ge / ethnosazanohotel.com
> **წლიური საფასური:** 50 ₾

---

${sections.map(sec => `## ${sec.title}\n\n${sec.content}`).join('\n\n')}

---
*დოკუმენტი წარმოადგენს სასტუმრო საზანოს ოფიციალურ საპროექტო გეგმას.*`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(compileToMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateGitPush = () => {
    setIsPushing(true);
    setPushStep(1);
    setTerminalLogs(['$ git init', 'Initialized empty Git repository in /workspace/hotel-sazano-website/.git/']);
    
    setTimeout(() => {
      setPushStep(2);
      setTerminalLogs(prev => [
        ...prev,
        '$ git remote add origin https://github.com/ethnosazano/hotel-sazano-website.git',
        '$ git add README.md package.json src/',
        'Staging 18 project files for commit...'
      ]);
    }, 1000);

    setTimeout(() => {
      setPushStep(3);
      setTerminalLogs(prev => [
        ...prev,
        '$ git commit -m "docs: sync live hotel brief and domain registry (esh.ge)"',
        '[main (root-commit) 4ae7d21] docs: sync live hotel brief and domain registry',
        ' 3 files changed, 256 insertions(+)',
        ' create mode 100644 README.md'
      ]);
    }, 2200);

    setTimeout(() => {
      setPushStep(4);
      setTerminalLogs(prev => [
        ...prev,
        '$ git push -u origin main',
        'Enumerating objects: 21, done.',
        'Counting objects: 100% (21/21), done.',
        'Delta compression using up to 8 threads',
        'Compressing objects: 100% (19/19), done.',
        'Writing objects: 100% (21/21), 4.25 KiB | 1.06 MiB/s, done.',
        'To https://github.com/ethnosazano/hotel-sazano-website.git',
        ' * [new branch]      main -> main',
        'Branch \'main\' set up to track remote branch \'main\' from \'origin\'.'
      ]);
    }, 3500);

    setTimeout(() => {
      setPushStep(5);
      triggerNotification('პროექტი წარმატებით სინქრონიზდა GitHub-ზე!');
    }, 4800);
  };

  const handleExportWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>სასტუმრო საზანოს ბრიფი და გეგმა</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=FiraGO:wght@400;700&display=swap');
        body {
          font-family: 'FiraGO', 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 40px;
        }
        h1 {
          color: #5c1d24;
          font-size: 18pt;
          border-bottom: 2px solid #c39c59;
          padding-bottom: 5px;
          margin-top: 30px;
          font-weight: bold;
        }
        p {
          font-size: 11pt;
          text-align: justify;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }
        .header-table {
          width: 100%;
          border-bottom: 3px double #5c1d24;
          margin-bottom: 35px;
          padding-bottom: 15px;
        }
        .footer {
          font-size: 9pt;
          color: #777777;
          text-align: center;
          margin-top: 50px;
          border-top: 1px solid #dddddd;
          padding-top: 15px;
        }
        .badge {
          background-color: #f3f4f6;
          padding: 3px 8px;
          font-size: 9pt;
          border-radius: 4px;
          color: #5c1d24;
          font-weight: bold;
          text-transform: uppercase;
        }
        .meta-text {
          font-size: 10pt;
          color: #666666;
        }
      </style>
    </head>
    <body>`;

    const footer = `
      <div class="footer">
        <p>© 2026 სასტუმრო საზანო (Hotel Sazano) • ვებ-პროექტის ბრიფი და ტექნიკური გეგმა</p>
      </div>
    </body>
    </html>`;

    let bodyContent = `
      <table class="header-table">
        <tr>
          <td style="font-size: 24pt; font-weight: bold; color: #5c1d24;">სასტუმრო საზანო (Hotel Sazano)</td>
          <td style="text-align: right; font-size: 10pt; color: #666666; vertical-align: bottom;">
            თარიღი: 2026 წლის 4 ივლისი<br>
            ვერსია: 1.0 (საბოლოო ბრიფი)
          </td>
        </tr>
        <tr>
          <td colspan="2" style="font-size: 12pt; color: #c39c59; font-style: italic; padding-top: 5px;">
            სრულყოფილი ვებ-გვერდის, ჯავშნების სისტემის (PMS), SEO-ს, SMS და OTA ინტეგრაციების ტექნიკური გეგმა
          </td>
        </tr>
      </table>
    `;

    sections.forEach((sec) => {
      bodyContent += `
        <div style="margin-bottom: 35px; page-break-inside: avoid;">
          <span class="badge">${sec.category}</span>
          <h1>${sec.title}</h1>
          <p>${sec.content.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    });

    const sourceHTML = header + bodyContent + footer;
    const blob = new Blob(['\ufeff' + sourceHTML], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'სასტუმრო_საზანო_ვებ_გვერდის_ბრიფი.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerNotification('Word-ის ფაილი წარმატებით ჩამოიტვირთა!');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSections = activeCategory === 'ყველა'
    ? sections
    : sections.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#fcfbf9] p-4 rounded-xl border border-[#8c8c73]/20 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#efeee5] rounded-lg text-sazano-wine">
            <FileText className="w-5 h-5" id="file-text-icon" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              პროექტის ბრიფი და გეგმა
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 font-medium">
                Word მზა ფორმატი
              </span>
            </h2>
            <p className="text-xs text-gray-500">მორგებული, რედაქტირებადი და ექსპორტისთვის გამზადებული დოკუმენტი</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportWord}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-sazano-wine text-white rounded-lg hover:bg-[#494932] transition-colors font-medium text-sm shadow-sm cursor-pointer"
            id="export-word-btn"
          >
            <Download className="w-4 h-4" />
            გადმოწერე Word ფაილი (.doc)
          </button>
          
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-[#fcfbf9] rounded-lg hover:bg-[#efeee5] transition-colors font-medium text-sm cursor-pointer"
            id="print-brief-btn"
          >
            <Printer className="w-4 h-4" />
            ბეჭდვა / PDF
          </button>

          <button
            onClick={() => setShowGithubModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-lg transition-colors font-medium text-sm cursor-pointer shadow-sm"
            id="view-github-btn"
          >
            <Github className="w-4 h-4" />
            GitHub-ზე ნახვა
          </button>

          <button
            onClick={() => {
              if (window.confirm('დარწმუნებული ხართ, რომ გსურთ ბრიფის ტექსტის საწყის ვერსიაზე დაბრუნება?')) {
                onReset();
                triggerNotification('ბრიფი დაბრუნდა საწყის რეჟიმში.');
              }
            }}
            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="საწყისზე დაბრუნება"
            id="reset-brief-btn"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-sazano-wine/10 text-sazano-wine border border-sazano-wine/25'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid & Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation panel */}
        <div className="lg:col-span-1 bg-[#fcfbf9] p-4 rounded-xl border border-[#8c8c73]/20 shadow-xs space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">დოკუმენტის სარჩევი</h3>
          <div className="space-y-1">
            {sections.map((sec, index) => (
              <button
                key={sec.id}
                onClick={() => {
                  const element = document.getElementById(`doc-sec-${sec.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-start gap-2.5 transition-colors cursor-pointer ${
                  activeCategory !== 'ყველა' && sec.category !== activeCategory
                    ? 'opacity-40 hover:opacity-100'
                    : ''
                } hover:bg-[#efeee5]`}
              >
                <span className="text-[10px] bg-[#efeee5] text-sazano-wine font-mono px-1.5 py-0.5 rounded border border-[#8c8c73]/20">
                  {index + 1}
                </span>
                <span className="truncate text-gray-700">{sec.title.replace(/^\d+\.\s*/, '')}</span>
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 px-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sazano-gold" />
            <span>ყველა ტექსტი რედაქტირებადია</span>
          </div>
        </div>

        {/* Word Document Paper Area */}
        <div className="lg:col-span-3 space-y-6">
          {filteredSections.map((sec) => (
            <motion.div
              key={sec.id}
              id={`doc-sec-${sec.id}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#fcfbf9] rounded-xl border border-[#8c8c73]/20 shadow-xs overflow-hidden relative group"
            >
              {/* Card top border mimicking hotel identity */}
              <div className="h-1 bg-sazano-wine" />

              <div className="p-6 sm:p-8">
                {/* Header info */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#efeee5] border border-[#8c8c73]/30 text-sazano-wine rounded-full">
                    {sec.category}
                  </span>
                  {editingId !== sec.id && (
                    <button
                      onClick={() => handleStartEdit(sec)}
                      className="p-1.5 text-gray-400 hover:text-sazano-wine hover:bg-[#efeee5] rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      title="სექციის რედაქტირება"
                      id={`edit-btn-${sec.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {editingId === sec.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sazano-wine focus:border-sazano-wine outline-none"
                    />
                    <textarea
                      rows={8}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full text-sm sm:text-base text-gray-700 leading-relaxed border border-gray-300 rounded-lg p-3.5 focus:ring-2 focus:ring-sazano-wine focus:border-sazano-wine outline-none font-sans"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        გაუქმება
                      </button>
                      <button
                        onClick={() => handleSave(sec.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-xs cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        შენახვა
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-sazano-wine mb-3 flex items-center gap-2">
                      {sec.title}
                    </h2>
                    <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                      {sec.content}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive GitHub Integration Modal */}
      <AnimatePresence>
        {showGithubModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#33332d]/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fcfbf9] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#8c8c73]/25"
            >
              {/* Modal Header */}
              <div className="bg-[#24292e] text-white px-6 py-4 flex items-center justify-between border-b border-[#1b1f23]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Github className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold tracking-tight">პროექტის ბრიფის GitHub რეპოზიტორია</h3>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                        Public
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">საზანოს დოკუმენტაციისა და კოდის სინქრონიზაცია ვებ-დეველოპმენტისთვის</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGithubModal(false);
                    setIsPushing(false);
                    setPushStep(0);
                    setTerminalLogs([]);
                  }}
                  className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  id="close-github-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
                {/* Left Area: Navigation & Code/Guide Viewers (8 cols) */}
                <div className="lg:col-span-8 p-6 space-y-4 border-r border-[#8c8c73]/15 overflow-y-auto max-h-[60vh] lg:max-h-none">
                  
                  {/* Tab Selectors */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setGithubTab('preview')}
                      className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                        githubTab === 'preview'
                          ? 'border-[#5A5A40] text-[#5A5A40]'
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      რეპოზიტორია (Mock Preview)
                    </button>
                    <button
                      onClick={() => setGithubTab('code')}
                      className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                        githubTab === 'code'
                          ? 'border-[#5A5A40] text-[#5A5A40]'
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Terminal className="w-4 h-4" />
                      README.md კოდი (Source Markdown)
                    </button>
                    <button
                      onClick={() => setGithubTab('instructions')}
                      className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                        githubTab === 'instructions'
                          ? 'border-[#5A5A40] text-[#5A5A40]'
                          : 'border-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Info className="w-4 h-4" />
                      დეველოპერის გზამკვლევი
                    </button>
                  </div>

                  {/* Tab Contents */}
                  {githubTab === 'preview' && (
                    <div className="space-y-4 font-sans text-sm">
                      {/* Fake GitHub Repo Info */}
                      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-gray-500" />
                            <span className="font-bold font-mono text-gray-800">main</span>
                            <span className="text-gray-300">|</span>
                            <span><strong>18</strong> ფაილი</span>
                            <span><strong>3</strong> Commit</span>
                          </div>
                          <div className="text-gray-400">
                            ბოლო განახლება: <strong>1 წუთის წინ</strong>
                          </div>
                        </div>

                        {/* File Explorer Replica */}
                        <div className="divide-y divide-gray-100 font-mono text-xs text-gray-700 bg-white">
                          <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-blue-400 fill-blue-100" />
                              <span>src/components/</span>
                            </span>
                            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">feat: add hotel calendar room selector</span>
                          </div>
                          <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-blue-400 fill-blue-100" />
                              <span>public/assets/</span>
                            </span>
                            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">add ethno-sazano hotel illustrations</span>
                          </div>
                          <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-[#5A5A40]">README.md</span>
                            </span>
                            <span className="text-gray-500 truncate max-w-[200px] sm:max-w-none">docs: sync live hotel brief and domain registry (esh.ge)</span>
                          </div>
                          <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span>package.json</span>
                            </span>
                            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">configure build scripts and dependencies</span>
                          </div>
                          <div className="px-4 py-2 hover:bg-gray-50 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <File className="w-4 h-4 text-gray-400" />
                              <span>.env.example</span>
                            </span>
                            <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">add environment placeholders</span>
                          </div>
                        </div>
                      </div>

                      {/* Rendered Markdown Preview Area */}
                      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-7 space-y-6 shadow-2xs">
                        <div className="border-b border-gray-200 pb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-gray-800 text-sm">README.md</span>
                        </div>
                        
                        <div className="prose max-w-none font-sans text-gray-800 space-y-4">
                          <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2">
                            სასტუმრო საზანო — პროექტის ბრიფი და გეგმა (Ethno Sazano Hotel)
                          </h1>

                          <div className="bg-[#efeee5]/30 border border-[#8c8c73]/25 rounded-xl p-4 text-xs space-y-2">
                            <p>🌟 <strong>შემუშავებული დომენები:</strong> esh.ge, ethnosazanohotel.ge, ethnosazanohotel.com</p>
                            <p>💰 <strong>საპროგნოზო წლიური საფასური:</strong> 50 ლარი დომენზე</p>
                            <p>📅 <strong>ბოლო სინქრონიზაცია:</strong> {new Date().toLocaleDateString('ka-GE')}</p>
                          </div>

                          <div className="space-y-4 text-sm leading-relaxed">
                            {sections.slice(0, 3).map((sec) => (
                              <div key={sec.id} className="space-y-2">
                                <h3 className="text-base font-bold text-[#5A5A40] border-l-4 border-sazano-wine pl-2.5 mt-4">
                                  {sec.title}
                                </h3>
                                <p className="text-gray-600 whitespace-pre-line text-xs sm:text-sm pl-2.5">
                                  {sec.content.length > 200 ? `${sec.content.substring(0, 200)}... (გაგრძელება იხილეთ დოკუმენტში)` : sec.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {githubTab === 'code' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-gray-100 border border-gray-200 px-4 py-2 rounded-t-lg">
                        <span className="text-xs text-gray-600 font-mono font-semibold">README.md</span>
                        <button
                          onClick={handleCopyMarkdown}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">კოპირებულია!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>ტექსტის კოპირება</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={14}
                        value={compileToMarkdown()}
                        className="w-full font-mono text-xs p-4 bg-gray-950 text-[#8be9fd] rounded-b-lg border border-gray-800 outline-none select-all leading-relaxed"
                      />
                    </div>
                  )}

                  {githubTab === 'instructions' && (
                    <div className="space-y-4 font-sans text-xs sm:text-sm text-gray-700">
                      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                        <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-amber-700" />
                          როგორ გამოვიყენოთ ეს ბრიფი რეალურ პროექტში?
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          თქვენ შეგიძლიათ ეს Markdown ფაილი განათავსოთ თქვენს რეალურ GitHub რეპოზიტორიაში. ის გახდება თქვენი ვებ-გვერდის მთავარი გვერდი (README), რაც საშუალებას მისცემს ნებისმიერ დეველოპერს ან კლიენტს, ზუსტად ნახოს ტექნიკური დავალება.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900">კონსოლის ბრძანებები (დეველოპერისთვის):</h4>
                        
                        <div className="bg-gray-950 text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-2 shadow-inner border border-gray-800">
                          <p className="text-gray-500"># 1. ინიციალიზაცია ლოკალურად</p>
                          <p>$ git init</p>
                          
                          <p className="text-gray-500"># 2. დაამატეთ ყველა ფაილი და შეინახეთ ბრიფი</p>
                          <p>$ git add README.md</p>
                          <p>$ git commit -m "docs: add initial project brief & domain configs (esh.ge)"</p>
                          
                          <p className="text-gray-500"># 3. დაუკავშირეთ თქვენს GitHub რეპოზიტორიას</p>
                          <p>$ git remote add origin https://github.com/your-username/ethnosazano-hotel.git</p>
                          <p>$ git branch -M main</p>
                          
                          <p className="text-gray-500"># 4. გაუშვით პროექტი GitHub-ზე</p>
                          <p>$ git push -u origin main</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Area: Interactive Sync Terminal Simulation (4 cols) */}
                <div className="lg:col-span-4 p-6 bg-gray-50 flex flex-col justify-between max-h-[40vh] lg:max-h-none">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">ინტეგრაციის მართვა</h4>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded text-gray-700">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">ლოკალური მდგომარეობა</p>
                          <p className="text-xs font-bold text-gray-800">ვებ-გვერდის ბრიფი მზად არის</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>დომენები:</span>
                        <span className="font-bold font-mono text-gray-700">esh.ge, ethnosazanohotel.ge</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>წლიური საფასური:</span>
                        <span className="font-bold text-emerald-600">50 ლარი</span>
                      </div>
                    </div>

                    {/* Interactive Simulation Console */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">სიმულატორის ტერმინალი</p>
                      <div className="h-44 bg-gray-900 text-white p-3 rounded-xl font-mono text-[10px] overflow-y-auto space-y-1 shadow-inner border border-gray-800">
                        {terminalLogs.length === 0 ? (
                          <p className="text-gray-500 italic">ტერმინალი ცარიელია. დასაწყებად დააჭირეთ „GitHub-ზე გაგზავნას“</p>
                        ) : (
                          terminalLogs.map((log, index) => (
                            <p
                              key={index}
                              className={
                                log.startsWith('$')
                                  ? 'text-yellow-400 font-bold'
                                  : log.includes('Success') || log.includes('successfully')
                                  ? 'text-emerald-400 font-bold'
                                  : 'text-gray-300'
                              }
                            >
                              {log}
                            </p>
                          ))
                        )}
                        {isPushing && pushStep < 5 && (
                          <div className="flex items-center gap-1.5 text-yellow-400 mt-1">
                            <span className="animate-ping rounded-full h-1.5 w-1.5 bg-yellow-400"></span>
                            <span>მიმდინარეობს სინქრონიზაცია...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sync Action Trigger */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={simulateGitPush}
                      disabled={isPushing}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                        isPushing
                          ? 'bg-[#8c8c73] opacity-60 cursor-not-allowed'
                          : 'bg-[#5A5A40] hover:bg-[#494932] active:scale-98'
                      }`}
                    >
                      <Github className="w-4 h-4" />
                      {isPushing
                        ? pushStep === 5
                          ? '✓ სინქრონიზებულია'
                          : 'სინქრონიზაცია...'
                        : 'ბრიფის GitHub-ზე გაგზავნა'}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      სინქრონიზაციის სიმულაციური პროცესი GitHub-თან.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Save Alert Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-gray-800"
          >
            <div className="p-1 bg-emerald-500 rounded-full text-white">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium">{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
