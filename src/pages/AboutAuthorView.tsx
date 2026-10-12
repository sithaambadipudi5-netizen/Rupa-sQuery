import React, { useState } from 'react';
import { 
  Mail, 
  Phone,
  Award, 
  BookOpen, 
  Database, 
  Sparkles, 
  Heart, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink,
  Target,
  Compass,
  Star,
  Check,
  Copy,
  Briefcase,
  GraduationCap,
  MapPin,
  Clock,
  Layers,
  Send,
  Zap,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AboutAuthorViewProps {
  navigate?: (path: string) => void;
  onOpenFeedback?: () => void;
}

export const AboutAuthorView: React.FC<AboutAuthorViewProps> = ({ navigate, onOpenFeedback }) => {
  const { authorPhoto } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume_builder' | 'mission'>('profile');

  // Interactive Self-Introduction & Resume Customizer
  const [degree, setDegree] = useState('B.Tech in Computer Science & Engineering');
  const [college, setCollege] = useState('Malla Reddy College of Engineering and Technology (MRCET)');
  const [city, setCity] = useState('Hyderabad, Telangana, India');
  const [phone, setPhone] = useState('+91 9701691282');
  const [skillsList, setSkillsList] = useState('SQL, Relational Database Design, PostgreSQL, Python, JavaScript, Problem Solving');
  const [hobbies, setHobbies] = useState('Exploring new tech tools, coding practice, reading tech blogs, continuous learning');
  const [careerGoal, setCareerGoal] = useState('Database Engineer / Full-Stack Data Solutions Developer');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const generatedSelfIntro = `Hello, I am Ambadipudi Rupavani, a motivated, responsible, and enthusiastic ${degree} student at ${college}, based in ${city}. 

I am deeply passionate about ${careerGoal}, relational database systems, and full-stack software development. My core technical and professional competencies include ${skillsList}. 

I am a quick learner and adaptable to new environments, with strong communication, interpersonal, and time-management skills. Outside of core engineering, I enjoy ${hobbies}. 

My career objective is to build a successful career in a challenging and growth-oriented organization where I can apply my knowledge, gain practical experience, contribute value to the team, and continuously elevate my professional capabilities.

Contact:
Phone: ${phone}
Email: ambadipudirupavani28@gmail.com | ambadipudirupavani17@gmail.com`;

  const keyStrengths = [
    {
      title: 'Quick Learner & Adaptable',
      desc: 'Rapidly grasps modern frameworks, database engines, and adjusts seamlessly to dynamic technical environments.',
      icon: Zap,
    },
    {
      title: 'Good Communication & Interpersonal Skills',
      desc: 'Articulates technical concepts clearly, actively listens, and collaborates effectively with cross-functional teams.',
      icon: MessageSquare,
    },
    {
      title: 'Responsible & Committed to Tasks',
      desc: 'Takes strong ownership of deliverables with high accountability, thorough precision, and attention to detail.',
      icon: CheckCircle2,
    },
    {
      title: 'Positive Attitude to Challenges',
      desc: 'Views complex software bugs and algorithmic obstacles as opportunities for continuous skill advancement.',
      icon: Star,
    },
    {
      title: 'Independent & Collaborative Team Player',
      desc: 'Excels at self-directed deep work while thriving in cooperative group workflows and peer code discussions.',
      icon: UserCheck,
    },
    {
      title: 'Time-Management & Organizational Skills',
      desc: 'Prioritizes workflows effectively, meets deadlines reliably, and maintains clean, structured project execution.',
      icon: Clock,
    },
  ];

  const coreInterests = [
    'Learning new technologies, modern cloud ecosystems, and emerging developer tools',
    'Improving communication, leadership, and professional presentation abilities',
    'Exploring new ideas and gaining deep foundational software engineering knowledge',
    'Working on creative, challenging database design and data processing tasks',
    'Personal development, professional ethics, and continuous lifelong learning',
  ];

  return (
    <div id="about-author-container" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <button
            onClick={() => navigate ? navigate('/') : undefined}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('resume_builder')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resume_builder'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Resume / Self-Intro Customizer
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'mission'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Platform Mission
          </button>
        </div>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 bg-white dark:bg-slate-900 shadow-xl space-y-8">
        
        {/* Author Header Grid with Photo & Bio */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          
          {/* Profile Photo with Professional Frame */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 ring-2 ring-indigo-500/30">
              <img
                src={authorPhoto}
                alt="Ambadipudi Rupavani"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white dark:border-slate-900">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Author Details & Quick Contact */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Author & Platform Creator
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                Student at MRCET
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Open to Opportunities
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Ambadipudi Rupavani
            </h1>

            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Student at <strong>Malla Reddy College of Engineering and Technology (MRCET)</strong>. A motivated, responsible, and enthusiastic engineer with a deep passion for relational database architecture, full-stack software development, and continuous learning.
            </p>

            {/* Phone, Email & Communication Action Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              
              {/* Phone Button with Direct Call & Copy */}
              <div className="flex items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/80 overflow-hidden">
                <a
                  href="tel:9701691282"
                  className="px-3.5 py-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Call Rupavani Directly"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+91 9701691282</span>
                </a>
                <button
                  onClick={() => copyToClipboard('9701691282', 'phone_header')}
                  className="px-2.5 py-2 border-l border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 text-xs transition-colors cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedField === 'phone_header' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <a
                href="mailto:ambadipudirupavani28@gmail.com"
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors"
                title="Direct Primary Contact"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>ambadipudirupavani28@gmail.com</span>
              </a>

              <a
                href="mailto:ambadipudirupavani17@gmail.com"
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Secondary Email"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>ambadipudirupavani17@gmail.com</span>
              </a>

              <button
                onClick={() => onOpenFeedback ? onOpenFeedback() : (navigate ? navigate('/feedback') : undefined)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send In-App Feedback</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: FULL PERSONAL PROFILE & DETAILED SPECIFICATIONS */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Personal Profile Summary */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Personal Profile</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Ambadipudi Rupavani</strong> is a motivated, responsible, and enthusiastic individual with a willingness to learn new things and develop new skills. She is interested in personal and professional growth and believes in continuous learning and improving herself.
              </p>
            </div>

            {/* Career Objective */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 border border-sky-200/80 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-sm">
                <Target className="w-4 h-4 text-sky-600" />
                <span>Career Objective</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "To build a successful career in a challenging and growth-oriented environment where I can use my knowledge and skills, gain practical experience, contribute to the organization, and continuously improve my professional abilities."
              </p>
            </div>

            {/* Key Strengths Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Key Strengths & Core Competencies</span>
                </h3>
                <span className="text-xs font-semibold text-slate-400">6 Key Pillars</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyStrengths.map((strength, idx) => {
                  const Icon = strength.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-2 group shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {strength.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-11">
                        {strength.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interests & Professional Qualities 2-Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Areas of Interest */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Compass className="w-4 h-4" />
                  <span>Areas of Interest & Passion</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {coreInterests.map((interest, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Professional Qualities */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Professional Qualities & Work Ethics</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Rupavani is dedicated, sincere, and willing to take on new responsibilities. She values teamwork, punctuality, honesty, and continuous improvement. She is eager to learn from new experiences and make a positive contribution wherever she works.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['Dedicated & Sincere', 'Teamwork', 'Punctuality', 'Honesty', 'Continuous Improvement', 'Adaptable'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Academic Education & Background Card */}
            <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Academic Background & Institution</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Undergraduate Engineering
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Institution / College</div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    Malla Reddy College of Engineering and Technology (MRCET)
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> Hyderabad, Telangana, India
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Degree & Field</div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    B.Tech in Computer Science & Engineering (CSE)
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <BookOpen className="w-3 h-3 text-slate-400" /> Databases, Full-Stack & Core CS
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white space-y-4 border border-indigo-800 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Available for Contact & Queries</span>
                  </div>
                  <h4 className="font-bold text-base sm:text-lg">Let's Connect & Collaborate</h4>
                  <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                    Reach out directly via phone or email for opportunities, project collaborations, feedback, or database discussions.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href="tel:9701691282"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: +91 9701691282</span>
                  </a>
                  <a
                    href="mailto:ambadipudirupavani28@gmail.com"
                    className="px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Email Rupavani</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE RESUME & SELF-INTRODUCTION BUILDER */}
        {activeTab === 'resume_builder' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>Professional Self-Introduction & Resume Profile Generator</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can customize your degree, college, location, skills, and target goal to generate a complete, polished self-introduction ready for job interviews, LinkedIn, or resume summaries.
              </p>
            </div>

            {/* Customizer Inputs Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Education / Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Career Goal / Target Role</label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Skills & Tech Competencies</label>
                <input
                  type="text"
                  value={skillsList}
                  onChange={(e) => setSkillsList(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Hobbies & Interests</label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Formatted Output & Copy Action */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Formatted Professional Introduction Snippet
                </h4>
                <button
                  onClick={() => copyToClipboard(generatedSelfIntro, 'intro')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedField === 'intro' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'intro' ? 'Copied to Clipboard!' : 'Copy Introduction'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                {generatedSelfIntro}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLATFORM MISSION & VISION */}
        {activeTab === 'mission' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Vision & Philosophy</h3>
              <p>
                Relational databases power virtually all modern digital products, financial ledgers, healthcare platforms, and high-scale applications. Yet, traditional database education frequently relies on static slides or disconnected CLI environments that discourage beginners.
              </p>
              <p>
                <strong>RUPA's Query</strong> was created by <strong>Ambadipudi Rupavani</strong> to eliminate that barrier. By unifying an in-browser SQLite execution sandbox, 12 modular curriculum levels, 200+ automated practice problems, and state-of-the-art <strong>Gemini AI Tutoring</strong>, learners develop deep intuition for relational algebra, set logic, and query optimization without needing complex local server installations.
              </p>
            </div>

            {/* Core Tenets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <Code2 className="w-5 h-5 text-sky-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Real-Time Execution</h4>
                <p className="text-xs text-slate-500">Every query executes live against real relational schemas with full table constraints.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Gemini AI Tutoring</h4>
                <p className="text-xs text-slate-500">Instant diagnosis for syntax bugs, edge cases, and progressive hints that teach rather than spoil.</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Career Readiness</h4>
                <p className="text-xs text-slate-500">Curated real-world projects and 60+ technical interview scenarios for top tech companies.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
