import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  GraduationCap, Camera, Shield, BarChart3, FileText,
  CheckCircle2, ArrowRight, Menu, X, Users, Building2,
  Briefcase, Star, Zap, Eye, Scan, ChevronRight, Play,
  Lock, Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const CLASSROOM_IMG = 'https://images.unsplash.com/photo-1758413350815-7b06dbbfb9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwbGVhcm5pbmd8ZW58MXx8fHwxNzc1NjMyMjg4fDA&ixlib=rb-4.1.0&q=80&w=1080';
const CAMPUS_IMG = 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNhbXB1cyUyMHVuaXZlcnNpdHklMjBidWlsZGluZ3xlbnwxfHx8fDE3NzU2MzIyODh8MA&ixlib=rb-4.1.0&q=80&w=1080';
const OFFICE_IMG = 'https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjB0ZWFtJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3NTYzMjI5M3ww&ixlib=rb-4.1.0&q=80&w=1080';

function FaceRecognitionDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 2000);
    return () => clearInterval(t);
  }, []);

  const states = [
    { label: 'Scanning...', color: 'border-blue-400', dot: 'bg-blue-400', text: 'text-blue-300' },
    { label: 'Liveness check...', color: 'border-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-300' },
    { label: 'Verifying identity', color: 'border-green-400', dot: 'bg-green-400', text: 'text-green-300' },
    { label: 'Attendance recorded!', color: 'border-green-400', dot: 'bg-green-400', text: 'text-green-300' },
  ];
  const s = states[step];

  return (
    <div className="relative">
      <div className="absolute -top-4 -left-6 z-20 bg-white rounded-xl px-3 py-2 shadow-xl border border-gray-100 flex items-center gap-2 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-[11px] text-gray-800" style={{ fontWeight: 600 }}>Nguyen Van An</p>
          <p className="text-[10px] text-green-600" style={{ fontWeight: 500 }}>✓ Present — 08:02</p>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 z-20 bg-white rounded-xl px-3 py-2 shadow-xl border border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[11px] text-gray-700" style={{ fontWeight: 600 }}>98.7% Accuracy</p>
        </div>
      </div>
      <div className="absolute -top-3 -right-8 z-20 bg-indigo-600 text-white rounded-xl px-3 py-1.5 shadow-lg text-[11px]" style={{ fontWeight: 600 }}>
        <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Real-time</div>
      </div>
      <div className="w-[340px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/80 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[12px] text-gray-400" style={{ fontWeight: 500 }}>SmartAttend · Camera A</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-red-400">LIVE</span>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ height: 200 }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60"
            style={{ top: `${30 + step * 20}%`, transition: 'top 2s ease' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-28 border-2 rounded-lg ${s.color} relative transition-all duration-500`}>
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-current rounded-tl" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-current rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-current rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-current rounded-br" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
                <div className="w-12 h-4 rounded-full bg-white/10 border border-white/10 mt-1" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
              <span className={`text-[12px] ${s.text}`} style={{ fontWeight: 500 }}>{s.label}</span>
              <div className="ml-auto">
                {step === 3 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {step === 0 && <Scan className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />}
                {step === 1 && <Eye className="w-4 h-4 text-yellow-400 animate-pulse" />}
                {step === 2 && <Shield className="w-4 h-4 text-green-400" />}
              </div>
            </div>
          </div>
        </div>
        <div className={`px-4 py-3 transition-all duration-500 ${step >= 2 ? 'bg-green-900/30' : 'bg-gray-800/50'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px]" style={{ fontWeight: 700 }}>VA</div>
            <div className="flex-1">
              <p className="text-[13px] text-white" style={{ fontWeight: 600 }}>Nguyen Van An</p>
              <p className="text-[11px] text-gray-400">STU001 · Class CS-301</p>
            </div>
            <div className={`px-2 py-1 rounded-md text-[11px] transition-all duration-500 ${step >= 2 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700 text-gray-500'}`} style={{ fontWeight: 600 }}>
              {step >= 2 ? '✓ Present' : '· · ·'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Camera, title: t('feat1Title'), desc: t('feat1Desc'), color: 'from-blue-500 to-blue-700', bg: 'bg-blue-50' },
    { icon: Eye, title: t('feat2Title'), desc: t('feat2Desc'), color: 'from-indigo-500 to-purple-700', bg: 'bg-indigo-50' },
    { icon: BarChart3, title: t('feat3Title'), desc: t('feat3Desc'), color: 'from-emerald-500 to-green-700', bg: 'bg-emerald-50' },
    { icon: FileText, title: t('feat4Title'), desc: t('feat4Desc'), color: 'from-orange-500 to-red-600', bg: 'bg-orange-50' },
    { icon: Lock, title: t('feat5Title'), desc: t('feat5Desc'), color: 'from-rose-500 to-pink-700', bg: 'bg-rose-50' },
    { icon: Globe, title: t('feat6Title'), desc: t('feat6Desc'), color: 'from-cyan-500 to-teal-700', bg: 'bg-cyan-50' },
  ];

  const steps = [
    { num: '01', icon: Camera, title: t('step1Title'), desc: t('step1Desc'), color: 'from-blue-500 to-indigo-600' },
    { num: '02', icon: Shield, title: t('step2Title'), desc: t('step2Desc'), color: 'from-indigo-500 to-purple-600' },
    { num: '03', icon: CheckCircle2, title: t('step3Title'), desc: t('step3Desc'), color: 'from-purple-500 to-pink-600' },
  ];

  const users = [
    { type: t('userSchoolName'), icon: GraduationCap, desc: t('userSchoolDesc'), img: CAMPUS_IMG, stats: [t('userSchoolStat1'), t('userSchoolStat2'), t('userSchoolStat3')], badge: t('userSchoolBadge'), badgeColor: 'bg-blue-600' },
    { type: t('userUniName'), icon: Building2, desc: t('userUniDesc'), img: CLASSROOM_IMG, stats: [t('userUniStat1'), t('userUniStat2'), t('userUniStat3')], badge: t('userUniBadge'), badgeColor: 'bg-indigo-600' },
    { type: t('userCorpName'), icon: Briefcase, desc: t('userCorpDesc'), img: OFFICE_IMG, stats: [t('userCorpStat1'), t('userCorpStat2'), t('userCorpStat3')], badge: t('userCorpBadge'), badgeColor: 'bg-purple-600' },
  ];

  const testimonials = [
    { name: 'Dr. Nguyen Minh Tuan', role: t('t1Role'), review: t('t1Text') },
    { name: 'Ms. Tran Thi Mai', role: t('t2Role'), review: t('t2Text') },
    { name: 'Mr. Le Van Phuc', role: t('t3Role'), review: t('t3Text') },
  ];

  const navLinks = [t('navFeatures'), t('navHowItWorks'), t('navUsers'), t('navPricing')];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scrolled ? 'bg-[#1e3a5f]' : 'bg-white/20'}`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className={`text-[16px] ${scrolled ? 'text-gray-900' : 'text-white'}`} style={{ fontWeight: 700 }}>{t('brandName')}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(item => (
              <a key={item} href={`#section-${item}`}
                className={`text-[14px] transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}
                style={{ fontWeight: 500 }}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant={scrolled ? 'light' : 'dark'} />
            <Link to="/login"
              className={`px-4 py-2 rounded-lg text-[14px] transition-all ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}`}
              style={{ fontWeight: 500 }}>
              {t('navLogin')}
            </Link>
            <Link to="/register"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[14px] transition-all shadow-sm"
              style={{ fontWeight: 500 }}>
              {t('navGetStarted')}
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} /> : <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-700' : 'text-white'}`} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
            {navLinks.map(item => (
              <a key={item} href="#" className="block py-2 text-[14px] text-gray-700" onClick={() => setMobileOpen(false)}>{item}</a>
            ))}
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
              <div className="flex justify-center py-1"><LanguageSwitcher variant="light" /></div>
              <Link to="/login" className="text-center py-2.5 border border-gray-300 rounded-lg text-[14px] text-gray-700" style={{ fontWeight: 500 }}>{t('navLogin')}</Link>
              <Link to="/register" className="text-center py-2.5 bg-blue-600 text-white rounded-lg text-[14px]" style={{ fontWeight: 500 }}>{t('navGetStarted')}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #312e81 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-white mb-6" style={{ fontWeight: 800, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}>
                {t('heroTitle1')}{' '}
                <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('heroTitle2')}
                </span>
                <br />{t('heroTitle3')}
              </h1>
              <p className="text-white/70 mb-8 max-w-xl mx-auto lg:mx-0" style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Link to="/register" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[15px] transition-all shadow-lg shadow-blue-500/30" style={{ fontWeight: 600 }}>
                  {t('heroCta1')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl text-[15px] transition-all backdrop-blur-sm" style={{ fontWeight: 500 }}>
                  <Play className="w-4 h-4" /> {t('heroCta2')}
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                {[
                  { val: t('stat1Val'), label: t('stat1Label') },
                  { val: t('stat2Val'), label: t('stat2Label') },
                  { val: t('stat3Val'), label: t('stat3Label') },
                  { val: t('stat4Val'), label: t('stat4Label') },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-white" style={{ fontWeight: 800, fontSize: '1.4rem' }}>{stat.val}</p>
                    <p className="text-white/50 text-[12px]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex justify-center lg:justify-end">
              <FaceRecognitionDemo />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none"><path d="M0,80L1440,80L1440,20C1200,60 800,0 400,40C200,60 100,20 0,40L0,80Z" fill="white" /></svg>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[13px] text-gray-400 mb-6" style={{ fontWeight: 500 }}>{t('trustedBy')}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['VNU Hanoi', 'HUST', 'IVY School', 'FPT Education', 'Aptech Vietnam', 'British Council'].map(name => (
              <span key={name} className="text-[14px] text-gray-600" style={{ fontWeight: 600 }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="section-features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[13px] text-blue-600 bg-blue-50 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>{t('featuresTag')}</span>
            <h2 className="text-gray-900 mt-3 mb-4" style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>{t('featuresTitle')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>{t('featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <div className={`w-6 h-6 bg-gradient-to-br ${f.color} rounded-md flex items-center justify-center`}>
                    <f.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1rem' }}>{f.title}</h3>
                <p className="text-gray-500 text-[14px]" style={{ lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="section-howitworks" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[13px] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>{t('howTag')}</span>
            <h2 className="text-gray-900 mt-3 mb-4" style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>{t('howTitle')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto" style={{ fontSize: '1.05rem' }}>{t('howSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300" />
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                  <span className="text-white/70 text-[11px] mt-1" style={{ fontWeight: 700 }}>{step.num}</span>
                </div>
                <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{step.title}</h3>
                <p className="text-gray-500 text-[14px] max-w-xs mx-auto" style={{ lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET USERS */}
      <section id="section-users" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[13px] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>{t('usersTag')}</span>
            <h2 className="text-gray-900 mt-3 mb-4" style={{ fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>{t('usersTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.map((u, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
                <div className="relative h-44 overflow-hidden">
                  <img src={u.img} alt={u.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`${u.badgeColor} text-white text-[11px] px-2.5 py-1 rounded-full`} style={{ fontWeight: 600 }}>{u.badge}</span>
                  </div>
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <u.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-white" style={{ fontWeight: 700, fontSize: '1rem' }}>{u.type}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-500 text-[14px] mb-4" style={{ lineHeight: 1.65 }}>{u.desc}</p>
                  <div className="space-y-1.5">
                    {u.stats.map((stat, j) => (
                      <div key={j} className="flex items-center gap-2 text-[13px] text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{stat}
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className="mt-5 flex items-center gap-1 text-[14px] text-blue-600 hover:gap-2 transition-all" style={{ fontWeight: 600 }}>
                    {t('learnMore')} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[13px] text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full" style={{ fontWeight: 600 }}>{t('testimonialsTag')}</span>
            <h2 className="text-gray-900 mt-3 mb-2" style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>{t('testimonialsTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tst, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-[14px] mb-5 italic" style={{ lineHeight: 1.7 }}>"{tst.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[13px]" style={{ fontWeight: 700 }}>
                    {tst.name.split(' ').slice(-1)[0][0]}
                  </div>
                  <div>
                    <p className="text-gray-900 text-[14px]" style={{ fontWeight: 600 }}>{tst.name}</p>
                    <p className="text-gray-500 text-[12px]">{tst.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #312e81 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-[13px]" style={{ fontWeight: 500 }}>{t('ctaBadge')}</span>
          </div>
          <h2 className="text-white mb-5" style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2 }}>
            {t('ctaTitle1')}<br /><span style={{ opacity: 0.8 }}>{t('ctaTitle2')}</span>
          </h2>
          <p className="text-white/70 mb-10 max-w-lg mx-auto" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1e3a5f] rounded-xl text-[15px] hover:bg-blue-50 transition-all shadow-xl" style={{ fontWeight: 700 }}>
              {t('ctaBtn1')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl text-[15px] hover:bg-white/20 transition-all" style={{ fontWeight: 500 }}>
              {t('ctaBtn2')}
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-[15px]" style={{ fontWeight: 700 }}>{t('brandName')}</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-5" style={{ lineHeight: 1.7 }}>{t('footerDesc')}</p>
              <div className="flex gap-3">
                {['f', 'in', 'tw'].map(s => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[12px] text-gray-400 cursor-pointer hover:bg-gray-700 transition-colors" style={{ fontWeight: 600 }}>{s}</div>
                ))}
              </div>
            </div>
            {[
              { title: t('footerProduct'), links: ['Features', 'Pricing', 'Demo', 'API'] },
              { title: t('footerCompany'), links: [t('footerAbout'), t('footerBlog'), t('footerCareers'), t('footerPress')] },
              { title: t('footerSupport'), links: [t('footerDocs'), t('footerHelp'), t('footerContact'), t('footerPrivacy')] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-white text-[14px] mb-4" style={{ fontWeight: 600 }}>{col.title}</p>
                {col.links.map(link => (
                  <a key={link} href="#" className="block text-[13px] text-gray-500 hover:text-gray-300 mb-2 transition-colors">{link}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[13px] text-gray-600">{t('copyright')}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[12px] text-gray-500">{t('allSystemsNormal')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
