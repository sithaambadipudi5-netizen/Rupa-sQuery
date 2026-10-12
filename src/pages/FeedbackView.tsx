import React, { useState } from 'react';
import { 
  Mail, 
  Phone,
  GraduationCap,
  Send, 
  Sparkles, 
  MessageSquare, 
  Star, 
  HelpCircle, 
  Bug, 
  Lightbulb, 
  Copy, 
  Check, 
  ExternalLink,
  CheckCircle2,
  Heart,
  Database,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type FeedbackCategory = 'general' | 'bug' | 'feature' | 'course' | 'ai';

export const FeedbackView: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, showToast } = useApp();
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [rating, setRating] = useState<number>(5);
  const [senderName, setSenderName] = useState(user.name || '');
  const [senderEmail, setSenderEmail] = useState(user.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sqlTopic, setSqlTopic] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const authorEmail = 'ambadipudirupavani28@gmail.com';

  const categoryLabels: Record<FeedbackCategory, { label: string; icon: any; desc: string }> = {
    general: { label: 'General Feedback', icon: MessageSquare, desc: 'Overall platform experience & suggestions' },
    feature: { label: 'Feature Request', icon: Lightbulb, desc: 'Ideas for new SQL modules, tools or visualizations' },
    bug: { label: 'Bug / SQL Error', icon: Bug, desc: 'Query execution issues or visual defects' },
    course: { label: 'Course / Practice Problems', icon: HelpCircle, desc: 'Improvements to curriculum & challenge questions' },
    ai: { label: 'Gemini AI Tutor', icon: Sparkles, desc: 'Feedback on AI explanations, hints & tutor accuracy' },
  };

  const mailSubject = subject.trim() 
    ? `[RUPA's Query Feedback] ${subject.trim()}`
    : `[RUPA's Query] ${categoryLabels[category].label} from ${senderName || 'Learner'}`;

  const mailBody = `Hello Rupavani,

Category: ${categoryLabels[category].label}
Experience Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)
Learner Name: ${senderName || user.name || 'Anonymous Learner'}
Learner Email: ${senderEmail || user.email || 'Not provided'}
${sqlTopic ? `Relevant Topic / Schema / Lesson: ${sqlTopic}\n` : ''}
--------------------------------------------------
Feedback / Message:
${message || '(Write your feedback here...)'}
--------------------------------------------------

Platform Context:
- Current Level: Level ${user.level}
- XP Earned: ${user.xp} XP
- Daily Streak: ${user.streak} days
- Lessons Completed: ${user.completedLessons.length}
- Solved Problems: ${user.solvedProblems.length}
- Platform: RUPA's Query Interactive SQL

Thank you!
`;

  const mailtoLink = `mailto:${authorEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast('error', 'Message Required', 'Please provide your comments or suggestions before sending.');
      return;
    }

    // Launch user's default email client
    window.location.href = mailtoLink;
    setIsSent(true);
    showToast('success', 'Email Client Launched', `Draft prepared for ${authorEmail}`);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`To: ${authorEmail}\nSubject: ${mailSubject}\n\n${mailBody}`);
    setCopied(true);
    showToast('success', 'Feedback Copied', 'Draft copied to clipboard! Paste it into your email composer.');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
          <Mail className="w-3.5 h-3.5" />
          <span>Direct Feedback Channel</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mail Feedback to Author
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Share your feedback, problem suggestions, bug reports, or queries directly with <strong>Ambadipudi Rupavani</strong> to improve RUPA's Query.
        </p>
      </div>

      {/* Main Feedback Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* Recipient Notice Header */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Author & Creator: Ambadipudi Rupavani</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-mono font-medium">ambadipudirupavani28@gmail.com</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
            Native Email Client Dispatch
          </span>
        </div>

        {isSent && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Email draft initiated!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">If your mail app didn't open automatically, use the <strong>Copy Email Draft</strong> button below to copy the template into Gmail or your preferred email service.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Category Options */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Select Feedback Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(categoryLabels) as FeedbackCategory[]).map((catKey) => {
                const Item = categoryLabels[catKey];
                const Icon = Item.icon;
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs">{Item.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {Item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Rating */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. Platform Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                {rating === 5 ? '5/5 — Excellent Experience' : `${rating}/5 Stars`}
              </span>
            </div>
          </div>

          {/* 3. User Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="Learner name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Reply Email Address
              </label>
              <input
                type="email"
                placeholder="youremail@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 4. Subject and Optional Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Subject Title
              </label>
              <input
                type="text"
                placeholder="e.g. Great practice problem, SQL Window function query"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Lesson / Problem / Schema Context (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. E-Commerce DB, Level 8 Subqueries"
                value={sqlTopic}
                onChange={(e) => setSqlTopic(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* 5. Detailed Feedback Message */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Your Feedback / Suggestions / Bug Report *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Write your feedback in detail here. What did you enjoy? What can we refine in the curriculum, queries, or AI tutor?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCopyDraft}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Full Draft!' : 'Copy Draft & Recipient'}</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Back to Dashboard
              </button>
              
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Launch Email Client</span>
              </button>
            </div>
          </div>

        </form>

      </div>

      {/* Footer Guidance & Author Reachout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-indigo-600" />
            Direct Email
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Write anytime to <strong className="text-indigo-600 dark:text-indigo-400">ambadipudirupavani28@gmail.com</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-600" />
            Phone / Contact
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct Line: <a href="tel:9701691282" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">+91 9701691282</a>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            College / Institution
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student at <strong>Malla Reddy College of Eng. & Tech (MRCET)</strong>
          </p>
        </div>
      </div>

    </div>
  );
};
