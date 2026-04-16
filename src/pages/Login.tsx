import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const DEMO_ACCOUNTS = [
  { role: 'admin' as UserRole, email: 'admin@smartattend.vn', name: 'Quản trị viên', id: 'ADMIN001', color: 'bg-[#1e3a5f]', lightKey: 'loginDemoAdmin' as const, path: '/admin' },
  { role: 'teacher' as UserRole, email: 'teacher@smartattend.vn', name: 'TS. Nguyễn Minh Tuấn', id: 'TCH001', department: 'Khoa CNTT', lightKey: 'loginDemoTeacher' as const, path: '/teacher' },
  { role: 'student' as UserRole, email: 'student@smartattend.vn', name: 'Nguyễn Văn An', id: 'STU001', class: 'CS-301', lightKey: 'loginDemoStudent' as const, path: '/student' },
];

const DEMO_STYLES = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
  'bg-purple-50 text-purple-700 border-purple-200',
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const demo = DEMO_ACCOUNTS.find(a => a.email === email);
    if (demo && password === 'demo123') {
      login({ name: demo.name, email: demo.email, role: demo.role, id: demo.id, class: (demo as any).class, department: (demo as any).department });
      navigate(demo.path);
    } else {
      setError(t('loginError'));
    }
    setLoading(false);
  };

  const handleDemoLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    login({ name: acc.name, email: acc.email, role: acc.role, id: acc.id, class: (acc as any).class, department: (acc as any).department });
    navigate(acc.path);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f2440 0%, #1e3a5f 50%, #312e81 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        <div className="absolute bottom-0 left-0 w-full h-1/2"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(99,102,241,0.3), transparent 70%)' }} />

        <div className="relative">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-[18px]" style={{ fontWeight: 700 }}>{t('brandName')}</span>
          </Link>
          <div className="space-y-8">
            <div>
              <h2 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.3 }}>{t('loginWelcome')}</h2>
              <p className="text-white/60 text-[15px]" style={{ lineHeight: 1.7 }}>{t('heroSubtitle')}</p>
            </div>
            {[
              { icon: ShieldCheck, titleKey: 'loginBrandFeature1Title' as const, descKey: 'loginBrandFeature1Desc' as const },
              { icon: GraduationCap, titleKey: 'loginBrandFeature2Title' as const, descKey: 'loginBrandFeature2Desc' as const },
              { icon: ArrowRight, titleKey: 'loginBrandFeature3Title' as const, descKey: 'loginBrandFeature3Desc' as const },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-white text-[14px]" style={{ fontWeight: 600 }}>{t(f.titleKey)}</p>
                  <p className="text-white/50 text-[13px]">{t(f.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-white/40 text-[12px]">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{t('loginAllSystems')}</span>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 text-[17px]" style={{ fontWeight: 700 }}>{t('brandName')}</span>
          </div>

          {/* Language switcher + form card */}
          <div className="flex justify-end mb-3">
            <LanguageSwitcher variant="light" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{t('loginWelcome')}</h1>
              <p className="text-gray-500 text-[14px] mt-1">{t('loginSubtitle')}</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('loginEmail')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t('loginEmailPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-[13px] text-gray-700" style={{ fontWeight: 500 }}>{t('loginPassword')}</label>
                  <a href="#" className="text-[13px] text-blue-600 hover:underline">{t('loginForgot')}</a>
                </div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={t('loginPassPlaceholder')}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ fontWeight: 600 }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>{t('loginBtn')}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-5 text-center">
              <span className="text-[13px] text-gray-500">{t('loginNoAccount')} </span>
              <Link to="/register" className="text-[13px] text-blue-600 hover:underline" style={{ fontWeight: 600 }}>{t('loginRegisterLink')}</Link>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="mt-6">
            <p className="text-center text-[12px] text-gray-400 mb-3" style={{ fontWeight: 500 }}>{t('loginDemoLabel')}</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button key={acc.role} onClick={() => handleDemoLogin(acc)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all hover:shadow-md ${DEMO_STYLES[i]}`}>
                  <p className="text-[12px]" style={{ fontWeight: 600 }}>{t(acc.lightKey)}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{t('loginDemoOnClick')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}