import React, { useState } from 'react';
import { 
  Mail, 
  Phone,
  Send, 
  Sparkles, 
  MessageSquare, 
  Star, 
  HelpCircle, 
  Bug, 
  Lightbulb, 
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'general' | 'bug' | 'feature' | 'course' | 'ai';
}

type FeedbackCategory = 'general' | 'bug' | 'feature' | 'course' | 'ai';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'general',
}) => {
  const { user, showToast } = useApp();
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [rating, setRating] = useState<number>(5);
  const [senderName, setSenderName] = useState(user.name || '');
  const [senderEmail, setSenderEmail] = useState(user.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sqlTopic, setSqlTopic] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const authorEmail = 'ambadipudirupavani28@gmail.com';

  const categoryLabels: Record<FeedbackCategory, { label: string; icon: any }> = {
    general: { label: 'General Feedback', icon: MessageSquare },
    feature: { label: 'Feature Request / Idea', icon: Lightbulb },
    bug: { label: 'Bug Report / SQL Issue', icon: Bug },
    course: { label: 'Course Content / Problem Feedback', icon: HelpCircle },
    ai: { label: 'AI Tutor Experience', icon: Sparkles },
  };

  // Build the prefilled email body and subject
  const mailSubject = subject.trim() 
    ? `[RUPA's Query Feedback] ${subject.trim()}`
    : `[RUPA's Query] ${categoryLabels[category].label} from ${senderName || 'Learner'}`;

  const mailBody = `Hello Rupavani,

Category: ${categoryLabels[category].label}
Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)
Learner Name: ${senderName || user.name || 'Anonymous Learner'}
Learner Email: ${senderEmail || user.email || 'Not provided'}
${sqlTopic ? `Relevant Topic / Schema: ${sqlTopic}\n` : ''}
--------------------------------------------------
Feedback / Message:
${message || '(Write your feedback here...)'}
--------------------------------------------------

Sent from RUPA's Query Platform (User Level: ${user.level}, XP: ${user.xp})
`;

  const mailtoLink = `mailto:${authorEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  const handleSendViaEmailClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('error', 'Feedback Required', 'Please enter your message or comments before emailing.');
      return;
    }

    // Trigger standard mailto
    window.location.href = mailtoLink;
    showToast('success', 'Opening Email Client', `Drafting feedback email to ${authorEmail}`);
    onClose();
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`To: ${authorEmail}\nSubject: ${mailSubject}\n\n${mailBody}`);
    setCopied(true);
    showToast('success', 'Feedback Copied', 'Copied draft and recipient email to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Send Feedback to Author
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct email to <strong>Ambadipudi Rupavani</strong> (<span className="text-indigo-600 dark:text-indigo-400">ambadipudirupavani28@gmail.com</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSendViaEmailClient} className="space-y-4">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(categoryLabels) as FeedbackCategory[]).map((catKey) => {
                const Item = categoryLabels[catKey];
                const Icon = Item.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{Item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Platform Experience Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                {rating === 5 ? 'Excellent 🌟' : rating === 4 ? 'Great 👍' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Needs Improvement ⚠️' : 'Poor ❌'}
              </span>
            </div>
          </div>

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Your name..."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Email (for reply)
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Feedback Subject / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Suggestion for Window Functions module or UI improvement"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Topic or Context Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Specific Lesson, Problem, or Database Schema (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Module 6 JOINs, University DB, Problem #42"
              value={sqlTopic}
              onChange={(e) => setSqlTopic(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Detailed Message Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your Detailed Feedback, Thoughts, or Issue Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Share what you liked, what could be clearer, features you'd like to see, or any query errors you encountered..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCopyDraft}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Copy formatted email draft to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Draft!' : 'Copy Email Draft'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </button>
            </div>
          </div>

        </form>

        {/* Direct Email & Phone fallback banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Email: <strong>ambadipudirupavani28@gmail.com</strong></span>
            <span>•</span>
            <span>Phone: <a href="tel:9701691282" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">+91 9701691282</a></span>
          </div>
          <a
            href={`mailto:${authorEmail}`}
            className="font-bold underline hover:text-indigo-600 dark:hover:text-indigo-200 flex items-center gap-1 shrink-0"
          >
            Launch Mail <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
