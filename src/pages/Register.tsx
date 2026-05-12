import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, Eye, EyeOff, ArrowRight, Users, BookOpen, ChevronLeft, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { registerAccount } from '../services/authApi';

type Role = 'student' | 'teacher';
interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  role: Role;
  class?: string;
  department?: string;
}

export function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Khoa Công nghệ Thông tin');
  const [classCode, setClassCode] = useState('CS-301');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRoleSelect = (r: Role) => { setRole(r); setStep(2); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPass) { setError(t('registerPassMismatch')); return; }
    setLoading(true);
    if (!role) { setError('Vui lòng chọn vai trò.'); return; }
    const registration: PendingRegistration = {
      name,
      email,
      password,
      role,
      class: role === 'student' ? classCode : undefined,
      department: role === 'teacher' ? department : undefined,
    };
    setPendingRegistration(registration);
    setStep(3);
    setLoading(false);
  };

  const completeRegistration = async () => {
    if (!pendingRegistration) return;
    setLoading(true);
    setError('');
    try {
      const session = await registerAccount(pendingRegistration);
      login(session.user, session.token);
      navigate(session.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setStep(2);
      setError(err instanceof Error ? err.message : 'Không thể đăng ký tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)' }}>
      <div className="w-full max-w-[500px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <div />
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 text-[18px]" style={{ fontWeight: 700 }}>{t('brandName')}</span>
            </Link>
            <LanguageSwitcher variant="light" />
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-all ${
                  n < step ? 'bg-green-500 text-white' : n === step ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-500'
                }`} style={{ fontWeight: 600 }}>
                  {n < step ? '✓' : n}
                </div>
                {n < 3 && <div className={`w-12 h-1 rounded-full ${n < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-500 mt-1">
            {t('registerStepOf')} {step}/3: {step === 1 ? t('registerStep1') : step === 2 ? t('registerStep2') : t('registerStep3')}
          </p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.3rem' }}>{t('registerWhoAreYou')}</h2>
            <p className="text-gray-500 text-[14px] mb-7">{t('registerWhoDesc')}</p>
            <div className="space-y-4">
              <button onClick={() => handleRoleSelect('student')}
                className="w-full flex items-center gap-5 p-5 border-2 border-gray-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-left">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors shrink-0">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1rem' }}>{t('registerRoleStudent')}</p>
                  <p className="text-gray-500 text-[13px] mt-0.5">{t('registerRoleStudentDesc')}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-400 ml-auto transition-colors" />
              </button>
              <button onClick={() => handleRoleSelect('teacher')}
                className="w-full flex items-center gap-5 p-5 border-2 border-gray-100 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group text-left">
                <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors shrink-0">
                  <BookOpen className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1rem' }}>{t('registerRoleTeacher')}</p>
                  <p className="text-gray-500 text-[13px] mt-0.5">{t('registerRoleTeacherDesc')}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 ml-auto transition-colors" />
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <span className="text-[13px] text-gray-500">{t('registerAlreadyHave')} </span>
              <Link to="/login" className="text-[13px] text-blue-600 hover:underline" style={{ fontWeight: 600 }}>{t('registerLoginLink')}</Link>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 mb-5 transition-colors">
              <ChevronLeft className="w-4 h-4" /> {t('registerBack')}
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === 'teacher' ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                {role === 'teacher' ? <BookOpen className="w-5 h-5 text-indigo-600" /> : <Users className="w-5 h-5 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{t('registerCreateAccount')}{t('registerAccount') ? ` ${t('registerAccount')}` : ''}</h2>
                <p className="text-gray-500 text-[13px]">{t('registerFillInfo')}</p>
              </div>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerName')}</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder={role === 'teacher' ? t('registerNamePH1') : t('registerNamePH2')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required />
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerEmail')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t('registerEmailPH')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required />
              </div>
              {role === 'teacher' && (
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerFaculty')}</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all">
                    <option>{t('registerFaculty1')}</option>
                    <option>{t('registerFaculty2')}</option>
                    <option>{t('registerFaculty3')}</option>
                    <option>{t('registerFaculty4')}</option>
                  </select>
                </div>
              )}
              {role === 'student' && (
                <div>
                  <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerClassCode')}</label>
                  <input value={classCode} onChange={e => setClassCode(e.target.value)} placeholder={t('registerClassPH')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                </div>
              )}
              <div>
                <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerPassword')}</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={t('registerPasswordPH')}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] text-gray-700 mb-1.5" style={{ fontWeight: 500 }}>{t('registerConfirmPass')}</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  placeholder={t('registerConfirmPH')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required />
              </div>
              <button type="submit" disabled={loading}
                className={`w-full py-3.5 text-white rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${role === 'teacher' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                style={{ fontWeight: 600 }}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>{t('registerCreateBtn')}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
              <Camera className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-gray-900 mb-2" style={{ fontWeight: 700, fontSize: '1.3rem' }}>{t('registerFaceTitle')}</h2>
            <p className="text-gray-500 text-[14px] mb-7" style={{ lineHeight: 1.7 }}>{t('registerFaceDesc')}</p>
            <button onClick={completeRegistration} disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] mb-3 transition-all disabled:opacity-60" style={{ fontWeight: 600 }}>
              <span className="flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                {t('registerFaceBtn')}
              </span>
            </button>
            <button onClick={completeRegistration} disabled={loading}
              className="w-full py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-[14px] transition-all" style={{ fontWeight: 500 }}>
              {t('registerFaceSkip')}
            </button>
          </div>
        )}

        <p className="text-center text-[12px] text-gray-400 mt-5">
          {t('registerTerms')}{' '}
          <a href="#" className="underline hover:text-gray-600">{t('registerTermsLink')}</a>{' '}
          {t('registerAnd')}{' '}
          <a href="#" className="underline hover:text-gray-600">{t('registerPrivacyLink')}</a>.
        </p>
      </div>
    </div>
  );
}
