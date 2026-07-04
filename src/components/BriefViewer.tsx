import React, { useState } from 'react';
import { BriefSection } from '../types';
import { Download, Printer, Edit2, Check, RotateCcw, AlertCircle, FileText, Sparkles, BookOpen } from 'lucide-react';
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
