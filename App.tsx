import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Settings, Play, Download, Trash2, Plus, Volume2, MessageSquare, User, FileText, Loader2, Info, Sparkles, HeartPulse, Mic2, Wifi, WifiOff, ShieldCheck, Zap, BarChart3, Headphones, BrainCircuit, Wind, Hash, Infinity, Globe, Users, ToggleLeft, ToggleRight, BookOpen, Palette, Check, Lock, Unlock, KeyRound, X, AlertTriangle, Fingerprint, MapPin, Cpu, ShieldAlert, Menu, HelpCircle, CheckCircle2, XCircle, Terminal, Clock, Skull, Star } from 'lucide-react';
import { AppMode, Speaker, DialogueLine, VoiceProfile, Gender, Region, Age, Pitch, Intonation, BaseVoice, Theme } from './types';
import { generateSpeech, generateDialogue, decodeBase64Audio, createWavBlob, refineText } from './services/tts';

const GENDERS: Gender[] = ['Nam', 'Nữ'];
const REGIONS: Region[] = ['Miền Bắc (Hà Nội)', 'Miền Trung (Huế/Đà Nẵng)', 'Miền Nam (Sài Gòn)', 'Chuẩn (Trung lập)'];
const AGES: Age[] = ['Trẻ em', 'Thanh niên', 'Trung niên', 'Người già'];
const PITCHES: Pitch[] = ['Trầm', 'Trung bình', 'Cao'];
const INTONATIONS: Intonation[] = ['Tự nhiên', 'Vui vẻ', 'Trầm buồn', 'Trang trọng', 'Kịch tính', 'Hào hứng'];
const BASE_VOICES: BaseVoice[] = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Leda', 'Aoede'];

const DEFAULT_PROFILE: VoiceProfile = {
  gender: 'Nam',
  region: 'Miền Bắc (Hà Nội)',
  age: 'Thanh niên',
  pitch: 'Trung bình',
  intonation: 'Tự nhiên',
  baseVoice: 'Kore'
};

// --- SECURITY CONSTANTS (DO NOT MODIFY) ---
// Hex values used for runtime integrity checks.
// 500,000 = 0x7A120
const _0x_L1 = 0x7A120; 
// 20,000 = 0x4E20
const _0x_L2 = 0x4E20;  

const _SEC_KEY = "MTQxMDIw"; // Base64 password (141020)
const VN_FLAG_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/2000px-Flag_of_Vietnam.svg.png";

// === LAYER 4: SOVEREIGNTY CHALLENGE DATA ===
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

const QUESTION_POOL: QuizQuestion[] = [
  { id: 1, question: "Quần đảo Hoàng Sa thuộc chủ quyền của quốc gia nào?", options: ["Việt Nam", "Trung Quốc", "Philippines", "Quốc tế"], correctAnswer: "Việt Nam" },
  { id: 2, question: "Quần đảo Trường Sa thuộc chủ quyền của quốc gia nào?", options: ["Malaysia", "Việt Nam", "Brunei", "Đài Loan"], correctAnswer: "Việt Nam" },
  { id: 3, question: "Hai quần đảo Hoàng Sa và Trường Sa thuộc biển nào?", options: ["Biển Hoa Đông", "Biển Đông", "Biển Java", "Biển Philippines"], correctAnswer: "Biển Đông" },
  { id: 4, question: "Bằng chứng lịch sử nào khẳng định chủ quyền của Việt Nam đối với Hoàng Sa - Trường Sa?", options: ["Châu bản triều Nguyễn", "Sách cổ Trung Quốc", "Bản đồ phương Tây cổ", "Cả 3 đáp án trên"], correctAnswer: "Cả 3 đáp án trên" },
  { id: 5, question: "Đơn vị hành chính huyện đảo Hoàng Sa thuộc thành phố nào?", options: ["Khánh Hòa", "Đà Nẵng", "Hải Phòng", "Quảng Ngãi"], correctAnswer: "Đà Nẵng" },
  { id: 6, question: "Đơn vị hành chính huyện đảo Trường Sa thuộc tỉnh nào?", options: ["Bà Rịa - Vũng Tàu", "Khánh Hòa", "Bình Thuận", "Ninh Thuận"], correctAnswer: "Khánh Hòa" },
  { id: 7, question: "Ngày Quốc khánh nước CHXHCN Việt Nam là ngày nào?", options: ["30/4", "1/5", "2/9", "19/8"], correctAnswer: "2/9" },
  { id: 8, question: "Chiến thắng Điện Biên Phủ lừng lẫy năm châu chấn động địa cầu diễn ra năm nào?", options: ["1945", "1954", "1968", "1975"], correctAnswer: "1954" },
  { id: 9, question: "Vị tướng huyền thoại nào được mệnh danh là Anh cả của Quân đội Nhân dân Việt Nam?", options: ["Võ Nguyên Giáp", "Văn Tiến Dũng", "Nguyễn Chí Thanh", "Hoàng Văn Thái"], correctAnswer: "Võ Nguyên Giáp" },
  { id: 10, question: "Sự kiện 30/4/1975 đánh dấu điều gì?", options: ["Giải phóng miền Nam, thống nhất đất nước", "Chiến thắng Điện Biên Phủ", "Cách mạng tháng Tám thành công", "Thành lập Đảng"], correctAnswer: "Giải phóng miền Nam, thống nhất đất nước" },
  { id: 11, question: "Ai là người đọc bản Tuyên ngôn Độc lập khai sinh ra nước VNDCCH?", options: ["Phạm Văn Đồng", "Hồ Chí Minh", "Trường Chinh", "Lê Duẩn"], correctAnswer: "Hồ Chí Minh" },
  { id: 12, question: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là?", options: ["TP. Hồ Chí Minh", "Huế", "Hà Nội", "Đà Nẵng"], correctAnswer: "Hà Nội" },
  { id: 13, question: "Tên nước Việt Nam thời vua Hùng là gì?", options: ["Đại Cồ Việt", "Văn Lang", "Âu Lạc", "Vạn Xuân"], correctAnswer: "Văn Lang" },
  { id: 14, question: "Ai là người đánh tan quân Nam Hán trên sông Bạch Đằng năm 938?", options: ["Lê Hoàn", "Ngô Quyền", "Trần Hưng Đạo", "Lý Thường Kiệt"], correctAnswer: "Ngô Quyền" },
  { id: 15, question: "Tác phẩm 'Nam quốc sơn hà' được coi là bản Tuyên ngôn độc lập đầu tiên gắn liền với ai?", options: ["Lý Thường Kiệt", "Trần Hưng Đạo", "Nguyễn Trãi", "Quang Trung"], correctAnswer: "Lý Thường Kiệt" },
  { id: 16, question: "Cố đô nào của Việt Nam được UNESCO công nhận là Di sản văn hóa thế giới?", options: ["Hoa Lư", "Huế", "Thăng Long", "Cổ Loa"], correctAnswer: "Huế" },
  { id: 17, question: "Bãi biển nào của Việt Nam được mệnh danh là một trong những vịnh đẹp nhất thế giới?", options: ["Nha Trang", "Lăng Cô", "Hạ Long", "Vũng Tàu"], correctAnswer: "Hạ Long" },
  { id: 18, question: "Đỉnh núi cao nhất Việt Nam (Nóc nhà Đông Dương) là?", options: ["Pu Si Lung", "Fansipan", "Bạch Mộc Lương Tử", "Tây Côn Lĩnh"], correctAnswer: "Fansipan" },
  { id: 19, question: "Hang động tự nhiên lớn nhất thế giới tại Quảng Bình tên là gì?", options: ["Động Phong Nha", "Động Thiên Đường", "Hang Sơn Đoòng", "Hang Én"], correctAnswer: "Hang Sơn Đoòng" },
  { id: 20, question: "Bài hát Quốc ca của Việt Nam có tên gốc là gì?", options: ["Tiến quân ca", "Chào cờ", "Việt Nam quê hương tôi", "Đất nước trọn niềm vui"], correctAnswer: "Tiến quân ca" },
  { id: 21, question: "Lá cờ đỏ sao vàng xuất hiện lần đầu trong cuộc khởi nghĩa nào?", options: ["Khởi nghĩa Bắc Sơn", "Khởi nghĩa Nam Kỳ", "Xô Viết Nghệ Tĩnh", "Cách mạng tháng 8"], correctAnswer: "Khởi nghĩa Nam Kỳ" },
  { id: 22, question: "Thành phố nào được mệnh danh là 'Thành phố mang tên Bác'?", options: ["Hà Nội", "Hồ Chí Minh", "Vinh", "Cao Bằng"], correctAnswer: "Hồ Chí Minh" },
  { id: 23, question: "Vị vua nào đã dời đô từ Hoa Lư về Thăng Long?", options: ["Lý Thái Tổ", "Đinh Tiên Hoàng", "Lê Đại Hành", "Trần Thái Tông"], correctAnswer: "Lý Thái Tổ" },
  { id: 24, question: "Việt Nam có biên giới đất liền với những quốc gia nào?", options: ["Trung Quốc, Lào, Thái Lan", "Trung Quốc, Lào, Campuchia", "Lào, Campuchia, Thái Lan", "Trung Quốc, Campuchia, Myanmar"], correctAnswer: "Trung Quốc, Lào, Campuchia" },
  { id: 25, question: "Tứ bất tử trong tín ngưỡng dân gian Việt Nam gồm những ai?", options: ["Sơn Tinh, Thủy Tinh, Thánh Gióng, Chử Đồng Tử", "Tản Viên Sơn Thánh, Phù Đổng Thiên Vương, Chử Đồng Tử, Liễu Hạnh", "Lạc Long Quân, Âu Cơ, Hùng Vương, An Dương Vương", "Thạch Sanh, Tấm Cám, Sọ Dừa, Thánh Gióng"], correctAnswer: "Tản Viên Sơn Thánh, Phù Đổng Thiên Vương, Chử Đồng Tử, Liễu Hạnh" },
  { id: 26, question: "Trận chiến trên không 'Điện Biên Phủ trên không' diễn ra năm nào?", options: ["1968", "1972", "1975", "1954"], correctAnswer: "1972" },
  { id: 27, question: "Dòng sông nào được ví là 'dòng sông thi ca' xứ Huế?", options: ["Sông Hồng", "Sông Hương", "Sông Hàn", "Sông Thu Bồn"], correctAnswer: "Sông Hương" },
  { id: 28, question: "Loại hoa nào được xem là Quốc hoa (không chính thức) của Việt Nam?", options: ["Hoa Đào", "Hoa Mai", "Hoa Sen", "Hoa Cúc"], correctAnswer: "Hoa Sen" },
  { id: 29, question: "Món ăn nào của Việt Nam nổi tiếng toàn thế giới?", options: ["Phở", "Bún chả", "Bánh mì", "Tất cả các món trên"], correctAnswer: "Tất cả các món trên" },
  { id: 30, question: "Việt Nam gia nhập Liên Hợp Quốc vào năm nào?", options: ["1975", "1977", "1986", "1995"], correctAnswer: "1977" }
];

// === THEME CONFIGURATION ===
const THEMES: Theme[] = [
  {
    id: 'cyber', name: 'Cyber Gold',
    colors: { bg: '#0E1117', paper: '#161B22', card: '#0E1117', text: '#E2E8F0', subText: '#94A3B8', accent: '#FFD700', border: '#1F2937', highlight: 'rgba(255, 215, 0, 0.1)' }
  },
  {
    id: 'light', name: 'Professional Light',
    colors: { bg: '#F8FAFC', paper: '#FFFFFF', card: '#F1F5F9', text: '#0F172A', subText: '#64748B', accent: '#2563EB', border: '#E2E8F0', highlight: 'rgba(37, 99, 235, 0.1)' }
  },
  {
    id: 'matrix', name: 'Matrix Green',
    colors: { bg: '#000000', paper: '#111111', card: '#050505', text: '#4ADE80', subText: '#22C55E', accent: '#00FF00', border: '#14532D', highlight: 'rgba(0, 255, 0, 0.15)' }
  },
  {
    id: 'ocean', name: 'Ocean Blue',
    colors: { bg: '#020617', paper: '#0F172A', card: '#1E293B', text: '#E2E8F0', subText: '#94A3B8', accent: '#38BDF8', border: '#1E293B', highlight: 'rgba(56, 189, 248, 0.15)' }
  },
  {
    id: 'sunset', name: 'Sunset Red',
    colors: { bg: '#180808', paper: '#250F0F', card: '#180808', text: '#FFE4E6', subText: '#FDA4AF', accent: '#FB7185', border: '#4C1D1D', highlight: 'rgba(251, 113, 133, 0.15)' }
  },
  {
    id: 'royal', name: 'Royal Purple',
    colors: { bg: '#160826', paper: '#240F3E', card: '#160826', text: '#E9D5FF', subText: '#C084FC', accent: '#A855F7', border: '#4C1D95', highlight: 'rgba(168, 85, 247, 0.15)' }
  },
  {
    id: 'mint', name: 'Fresh Mint',
    colors: { bg: '#042F2E', paper: '#115E59', card: '#042F2E', text: '#CCFBF1', subText: '#5EEAD4', accent: '#2DD4BF', border: '#134E4A', highlight: 'rgba(45, 212, 191, 0.15)' }
  },
  {
    id: 'coffee', name: 'Warm Coffee',
    colors: { bg: '#1C1917', paper: '#292524', card: '#1C1917', text: '#F5F5F4', subText: '#A8A29E', accent: '#D6D3D1', border: '#44403C', highlight: 'rgba(214, 211, 209, 0.15)' }
  },
  {
    id: 'rose', name: 'Sweet Rose',
    colors: { bg: '#FFF1F2', paper: '#FFE4E6', card: '#FFF1F2', text: '#881337', subText: '#BE123C', accent: '#E11D48', border: '#FECDD3', highlight: 'rgba(225, 29, 72, 0.1)' }
  },
  {
    id: 'dracula', name: 'Midnight Gray',
    colors: { bg: '#18181B', paper: '#27272A', card: '#18181B', text: '#F4F4F5', subText: '#A1A1AA', accent: '#E4E4E7', border: '#3F3F46', highlight: 'rgba(228, 228, 231, 0.15)' }
  }
];

// --- COMPONENT MOVED OUTSIDE TO FIX RE-RENDER/FOCUS BUGS ---
const ProfileSelector = React.memo(({ profile, onChange, onPreview, isPreviewing, theme }: { 
  profile: VoiceProfile, 
  onChange: (p: VoiceProfile) => void,
  onPreview: () => void,
  isPreviewing: boolean,
  theme: Theme
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold" style={{ color: theme.colors.subText }}>Giọng gốc</label>
        <select 
          value={profile.baseVoice} 
          onChange={(e) => onChange({ ...profile, baseVoice: e.target.value as BaseVoice })} 
          className="w-full rounded-lg px-2 py-1.5 text-xs outline-none transition-all border"
          style={{ backgroundColor: theme.colors.card, color: theme.colors.accent, borderColor: theme.colors.border }}
        >
          {BASE_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold" style={{ color: theme.colors.subText }}>Ngữ điệu</label>
        <select 
          value={profile.intonation} 
          onChange={(e) => onChange({ ...profile, intonation: e.target.value as Intonation })} 
          className="w-full rounded-lg px-2 py-1.5 text-xs outline-none border"
          style={{ backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }}
        >
          {INTONATIONS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase font-bold" style={{ color: theme.colors.subText }}>Vùng miền</label>
        <select 
          value={profile.region} 
          onChange={(e) => onChange({ ...profile, region: e.target.value as Region })} 
          className="w-full rounded-lg px-2 py-1.5 text-xs outline-none border"
          style={{ backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }}
        >
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
    <button 
      onClick={onPreview} 
      disabled={isPreviewing}
      className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all disabled:opacity-50"
      style={{ backgroundColor: theme.colors.highlight, color: theme.colors.text, borderColor: theme.colors.border }}
    >
      {isPreviewing ? <Loader2 size={12} className="animate-spin" /> : <Headphones size={12} />}
      {isPreviewing ? "ĐANG TẠO MẪU..." : "NGHE THỬ GIỌNG NÀY"}
    </button>
  </div>
));

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing system core...");

  useEffect(() => {
    const messages = [
      "Establishing secure connection...",
      "Verifying geolocation...",
      "Loading Vietnamese voice models...",
      "Calibrating AI neural network...",
      "Checking integrity signatures...",
      "Optimizing audio latency...",
      "Ready to synthesize."
    ];
    
    let step = 0;
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 100));
      if (step < messages.length) {
        setStatus(messages[step]);
        step++;
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0E1117] text-[#E2E8F0] font-sans">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
        <div className="relative w-24 h-24 border-t-4 border-yellow-500 rounded-full animate-spin flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
           <Cpu size={40} className="text-yellow-500 animate-pulse" />
        </div>
      </div>
      
      <h1 className="text-2xl font-black tracking-widest uppercase mb-2 animate-bounce">
        TTS COMMUNITY
      </h1>
      <div className="flex items-center gap-2 mb-8">
        <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase">VN Edition</span>
        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold uppercase">AI Core v2.5</span>
      </div>

      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mb-4 relative">
        <div 
          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="h-6 flex items-center justify-center">
         <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider animate-pulse">
           [{progress.toFixed(0)}%] {status}
         </p>
      </div>

      <div className="absolute bottom-10 text-[10px] text-gray-600 font-mono">
        SECURE CONNECTION • ENCRYPTED • COPYRIGHT © DAO VAN PHUONG
      </div>
    </div>
  );
};

// --- SECURITY LOCKOUT SCREEN (72 HOURS BAN + UNLOCK) ---
const SecurityLockoutScreen = ({ unlockTime, onUnlock }: { unlockTime: number, onUnlock: () => void }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = unlockTime - now;

      if (diff <= 0) {
        onUnlock();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [unlockTime, onUnlock]);

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === atob(_SEC_KEY)) {
       onUnlock();
    } else {
       setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black text-red-500 p-8 text-center font-mono">
      <div className="animate-pulse mb-8">
        <Skull size={120} strokeWidth={1} className="text-red-600" />
      </div>
      <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">HỆ THỐNG BẢO MẬT ĐÃ KÍCH HOẠT</h1>
      <p className="text-xl text-red-300 mb-8 max-w-2xl border-t border-b border-red-900 py-4 uppercase">
        Phát hiện hành vi gian lận: Chỉnh sửa thông số Quota trái phép.
      </p>
      
      <div className="flex flex-col items-center gap-2 mb-10">
        <p className="text-xs uppercase tracking-widest text-red-600">THỜI GIAN KHÓA CÒN LẠI (72 GIỜ)</p>
        <div className="text-5xl md:text-6xl font-black font-mono bg-red-950 px-8 py-6 rounded-xl border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-pulse">
          {timeLeft}
        </div>
      </div>

      <div className="w-full max-w-xs">
         <form onSubmit={handleAdminUnlock} className="space-y-4">
            <p className="text-xs text-red-400 uppercase">Mở khóa khẩn cấp (Admin)</p>
            <div className="relative">
               <input 
                  type="password" 
                  placeholder="Nhập mật khẩu Admin..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-red-950/30 border border-red-800 text-red-200 px-4 py-3 rounded outline-none focus:border-red-500 transition-all text-center placeholder:text-red-800"
               />
               <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-white"><Unlock size={16} /></button>
            </div>
            {error && <p className="text-xs font-bold text-red-500 bg-red-950 py-1 px-2 rounded">MẬT KHẨU SAI</p>}
         </form>
      </div>
      
      <p className="mt-12 text-xs text-red-800">
        ERROR CODE: 0xINTEGRITY_VIOLATION_QUOTA_MOD
      </p>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SINGLE);
  const [speed, setSpeed] = useState(1.0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forceOffline, setForceOffline] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>('cyber');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  
  // Security Ban State (72h)
  const [isBanned, setIsBanned] = useState(false);
  const [banUnlockTime, setBanUnlockTime] = useState(0);

  // Auth & Security State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  
  // Security Checks
  const [isCheckingSecurity, setIsCheckingSecurity] = useState(true);
  const [isVietnameseIp, setIsVietnameseIp] = useState(false);
  const [clientIp, setClientIp] = useState<string>("Unknown");
  const [hardwareFingerprint, setHardwareFingerprint] = useState<string>("");
  const [dailyUsage, setDailyUsage] = useState<number>(0);

  // Human 99% Mode Limits
  const [useHumanMode, setUseHumanMode] = useState(true);
  const [humanUsage, setHumanUsage] = useState<number>(0);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("--:--:--");

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [quizPassed, setQuizPassed] = useState(false);
  const [pendingDownloadLink, setPendingDownloadLink] = useState<string|null>(null);

  const [singleProfile, setSingleProfile] = useState<VoiceProfile>(DEFAULT_PROFILE);
  const [singleText, setSingleText] = useState("Chào mừng bạn đến với FREE - TTS COMMUNITY!\n\nĐây là công cụ chuyển đổi văn bản thành giọng nói miễn phí, hỗ trợ đa vùng miền (Bắc, Trung, Nam) và cảm xúc tự nhiên.\n\nChúc bạn có những trải nghiệm tuyệt vời!");
  
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: '1', name: 'ĐÀO PHƯƠNG', profile: { ...DEFAULT_PROFILE, gender: 'Nam', baseVoice: 'Kore', intonation: 'Tự nhiên' } },
    { id: '2', name: 'NGUYỄN NHUNG', profile: { ...DEFAULT_PROFILE, gender: 'Nữ', baseVoice: 'Leda', intonation: 'Trang trọng', region: 'Miền Nam (Sài Gòn)' } },
  ]);
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    { id: '1', speakerId: '1', text: 'Chào Nhung, cậu đã thử phiên bản TTS Community mới chưa?' },
    { id: '2', speakerId: '2', text: 'Rồi Phương ơi! Nghe nói bản này hoàn toàn miễn phí và không giới hạn từ luôn đó.' },
  ]);

  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'raw'>('builder');

  const theme = useMemo(() => THEMES.find(t => t.id === activeThemeId) || THEMES[0], [activeThemeId]);
  const isSystemOnline = isOnline && !forceOffline;

  const charCount = useMemo(() => {
    if (mode === AppMode.SINGLE) return singleText.length;
    return dialogue.reduce((acc, line) => acc + line.text.length, 0);
  }, [mode, singleText, dialogue]);

  const wordCount = useMemo(() => {
    const countWords = (str: string) => str.trim().split(/\s+/).filter(word => word !== "").length;
    if (mode === AppMode.SINGLE) return countWords(singleText);
    return dialogue.reduce((acc, line) => acc + countWords(line.text), 0);
  }, [mode, singleText, dialogue]);

  // Generate a hardware fingerprint
  useEffect(() => {
    const getFingerprint = () => {
      const nav = window.navigator as any;
      const screen = window.screen;
      const hardwareConcurrency = nav.hardwareConcurrency || 'unknown';
      const deviceMemory = nav.deviceMemory || 'unknown';
      const userAgent = nav.userAgent;
      const screenRes = `${screen.width}x${screen.height}`;
      // Simple hash simulation
      const raw = `${userAgent}-${hardwareConcurrency}-${deviceMemory}-${screenRes}`;
      let hash = 0;
      for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `HW-${Math.abs(hash)}`;
    };
    setHardwareFingerprint(getFingerprint());
  }, []);

  // BAN LOGIC CHECK (On Mount)
  useEffect(() => {
    const lockoutKey = 'tts_sec_lockout_72h';
    const storedLockout = localStorage.getItem(lockoutKey);
    if (storedLockout) {
      const unlockTime = parseInt(storedLockout, 10);
      if (Date.now() < unlockTime) {
        setIsBanned(true);
        setBanUnlockTime(unlockTime);
      } else {
        localStorage.removeItem(lockoutKey); // Remove expired ban
      }
    }
  }, []);

  // --- INTEGRITY CHECK (Prevents Source Code Modification of Limits) ---
  useEffect(() => {
    if (isBanned || isAdmin) return;

    // Verify if constants have been tampered with
    // 500,000 should match 0x7A120
    // 20,000 should match 0x4E20
    const verifyL1 = 0x7A120;
    const verifyL2 = 0x4E20;

    if (_0x_L1 !== verifyL1 || _0x_L2 !== verifyL2) {
       // TAMPER DETECTED: Trigger 72h Ban
       const BAN_DURATION_MS = 72 * 60 * 60 * 1000; // 72 hours
       const unlockTime = Date.now() + BAN_DURATION_MS;
       
       localStorage.setItem('tts_sec_lockout_72h', unlockTime.toString());
       
       setBanUnlockTime(unlockTime);
       setIsBanned(true);
    }
  }, [isBanned, isAdmin]);

  const handleUnlockBan = () => {
    setIsBanned(false);
    localStorage.removeItem('tts_sec_lockout_72h');
    setIsAdmin(true); // Grant admin access upon unlock
  };

  // IP Geolocation Check & Usage Tracking & GLOBAL LOADING LOGIC
  useEffect(() => {
    const checkSecurity = async () => {
      setIsCheckingSecurity(true);
      
      const checkService = async (url: string): Promise<{ip: string, country: string} | null> => {
         try {
           const res = await fetch(url);
           if (!res.ok) throw new Error('Network response was not ok');
           const data = await res.json();
           
           if (data.ip && data.country_code) return { ip: data.ip, country: data.country_code };
           if (data.ipAddress && data.countryCode) return { ip: data.ipAddress, country: data.countryCode };
           if (data.ip && data.country) return { ip: data.ip, country: data.country };
           return null;
         } catch (e) {
           return null;
         }
      };

      try {
        let result = await checkService('https://ipwho.is/');
        if (!result) result = await checkService('https://api.db-ip.com/v2/free/self');
        if (!result) result = await checkService('https://ipapi.co/json/');

        if (result) {
          setClientIp(result.ip);
          setIsVietnameseIp(result.country === 'VN' || result.country === 'Vietnam');
        } else {
          setClientIp("Unknown");
          setIsVietnameseIp(false);
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Load Daily Total Usage
        const storageKey = `tts_usage_${today}`;
        const storedUsage = localStorage.getItem(storageKey);
        if (storedUsage) {
          setDailyUsage(parseInt(storedUsage, 10));
        } else {
          setDailyUsage(0);
          for(let i=0; i<localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith('tts_usage_') && key !== storageKey) {
              localStorage.removeItem(key);
            }
          }
        }

        // Load Human 99% Usage
        const humanStorageKey = `tts_human_usage_${today}`;
        const storedHumanUsage = localStorage.getItem(humanStorageKey);
        if (storedHumanUsage) {
          setHumanUsage(parseInt(storedHumanUsage, 10));
        } else {
          setHumanUsage(0);
          for(let i=0; i<localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith('tts_human_usage_') && key !== humanStorageKey) {
              localStorage.removeItem(key);
            }
          }
        }

      } catch (error) {
        console.error("Security check failed:", error);
        setIsVietnameseIp(false); 
      } finally {
        setIsCheckingSecurity(false);
      }
    };

    const initApp = async () => {
      // Simulate minimum load time for effect (2.5s) concurrent with security check
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));
      await Promise.all([checkSecurity(), minLoadTime]);
      setIsGlobalLoading(false);
    };

    initApp();
  }, []);

  // Countdown Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0); // Reset at midnight
        const diff = tomorrow.getTime() - now.getTime();
        
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isOverDailyLimit = !isAdmin && (dailyUsage + charCount) > _0x_L1;
  const isOverHumanLimit = !isAdmin && useHumanMode && (humanUsage + charCount) > _0x_L2;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === atob(_SEC_KEY)) {
      setIsAdmin(true);
      setShowAuthModal(false);
      setAuthError(false);
      setPasswordInput("");
    } else {
      setAuthError(true);
    }
  };

  const handleRefine = async () => {
    if (!isSystemOnline || refining) return;
    setRefining(true);
    try {
      if (mode === AppMode.SINGLE) {
        const polished = await refineText(singleText);
        setSingleText(polished);
      } else {
        const newDialogue = await Promise.all(dialogue.map(async line => ({
          ...line,
          text: await refineText(line.text)
        })));
        setDialogue(newDialogue);
      }
    } catch (error) {
      console.error("Refine failed", error);
    } finally {
      setRefining(false);
    }
  };

  const handlePreview = async (profile: VoiceProfile, sourceId: string) => {
    if (!isSystemOnline) return alert("Cần kết nối mạng để nghe thử.");
    setPreviewLoading(sourceId);
    try {
      const sampleText = "Chào bạn, đây là mẫu giọng đọc thực tế với nhịp thở tự nhiên của tôi.";
      const audioData = await generateSpeech(sampleText, profile, 1.0);
      if (audioData) {
        const blob = createWavBlob(audioData);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (error: any) {
      console.error("Preview failed", error);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleConvert = async () => {
    if (!isSystemOnline) return alert("Vui lòng kiểm tra kết nối mạng.");
    if (!isAdmin && isOverDailyLimit) return alert(`Bạn đã vượt quá giới hạn tổng ${_0x_L1.toLocaleString()} ký tự/ngày.`);
    
    // Check Human 99% Limit
    if (useHumanMode && !isAdmin && isOverHumanLimit) {
      return alert(`Bạn đã hết quota Human 99% (${_0x_L2.toLocaleString()} ký tự/ngày). Vui lòng tắt chế độ "Human 99%" để tiếp tục sử dụng chất lượng thường.`);
    }

    setLoading(true);
    setAudioUrl(null);
    try {
      let pcmData: Uint8Array | undefined;
      
      if (mode === AppMode.SINGLE) {
        pcmData = await generateSpeech(singleText, singleProfile, speed);
      } else {
        const dialogueData = dialogue.map(line => {
          const speaker = speakers.find(s => s.id === line.speakerId);
          return {
            speakerName: speaker?.name || "Người nói",
            profile: speaker?.profile || DEFAULT_PROFILE,
            text: line.text
          };
        });
        pcmData = await generateDialogue(dialogueData);
      }

      if (pcmData) {
        setAudioUrl(URL.createObjectURL(createWavBlob(pcmData)));
        const today = new Date().toISOString().split('T')[0];
        
        // Update Total Usage
        const storageKey = `tts_usage_${today}`;
        const newUsage = dailyUsage + charCount;
        setDailyUsage(newUsage);
        localStorage.setItem(storageKey, newUsage.toString());

        // Update Human Usage if applicable
        if (useHumanMode) {
           const humanStorageKey = `tts_human_usage_${today}`;
           const newHumanUsage = humanUsage + charCount;
           setHumanUsage(newHumanUsage);
           localStorage.setItem(humanStorageKey, newHumanUsage.toString());
        }
      }
    } catch (error: any) {
      alert(`Lỗi hệ thống: ${error.message || "Không thể kết nối API"}`);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (link: string) => {
    setPendingDownloadLink(link);
    const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
    setCurrentQuestions(shuffled.slice(0, 10)); // Pick 10 random questions
    setUserAnswers({});
    setQuizPassed(false);
    setShowQuiz(true);
  };

  const handleQuizAnswer = (qId: number, answer: string) => {
    setUserAnswers(prev => ({...prev, [qId]: answer}));
  };

  const submitQuiz = () => {
    let correct = 0;
    currentQuestions.forEach(q => {
        if(userAnswers[q.id] === q.correctAnswer) correct++;
    });
    
    // LAYER 4 SECURITY: MUST GET 10/10
    if (correct === 10) {
        setQuizPassed(true);
        if (pendingDownloadLink) {
          const a = document.createElement('a');
          a.href = pendingDownloadLink;
          a.download = `community_tts_${Date.now()}.wav`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => setShowQuiz(false), 3000); 
    } else {
        alert(`Bạn chỉ trả lời đúng ${correct}/10 câu. Cần trả lời đúng tuyệt đối 10/10 câu để xác minh kiến thức chủ quyền và tải xuống.`);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, url: string) => {
    // LAYER 3 SECURITY: IP BLOCK
    if (!isAdmin && !isVietnameseIp) {
      e.preventDefault();
      startQuiz(url);
    }
    // If VN IP or Admin, allow default download behavior
  };

  const handleTabChange = (tab: 'builder' | 'raw') => {
    setActiveTab(tab);
  };

  if (isBanned) {
    return <SecurityLockoutScreen unlockTime={banUnlockTime} onUnlock={handleUnlockBan} />;
  }

  if (isGlobalLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full flex flex-col transition-colors duration-300 overflow-hidden" style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}>
      
      {/* AUTH MODAL (Standard) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl shadow-2xl border" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.accent }}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black uppercase flex items-center gap-2" style={{ color: theme.colors.text }}>
                 <Lock size={18} className="text-red-500" /> Admin Access
               </h3>
               <button onClick={() => setShowAuthModal(false)} style={{ color: theme.colors.subText }}><X size={20}/></button>
            </div>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: theme.colors.subText }}>
              Tính năng này (Mã nguồn) bị giới hạn. Vui lòng nhập mật khẩu quản trị viên để mở khóa.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
               <div className="space-y-2">
                 <div className="relative">
                   <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.colors.subText }} />
                   <input 
                    type="password" 
                    autoFocus
                    placeholder="Nhập mật khẩu..." 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none focus:border-opacity-100 transition-all"
                    style={{ backgroundColor: theme.colors.bg, borderColor: authError ? '#EF4444' : theme.colors.border, color: theme.colors.text }}
                   />
                 </div>
                 {authError && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={10} /> Mật khẩu không đúng</p>}
               </div>
               <button type="submit" className="w-full py-3 rounded-xl font-black text-xs uppercase hover:brightness-110 transition-all" style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg }}>
                 Mở Khóa
               </button>
            </form>
          </div>
        </div>
      )}

      {/* QUIZ MODAL FOR NON-VN IP (LAYER 4 SECURITY) */}
      {showQuiz && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 p-4">
           <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border-4 shadow-2xl relative overflow-hidden" 
             style={{ backgroundColor: theme.colors.bg, borderColor: quizPassed ? '#22C55E' : '#DA251D' }}>
              
              {/* Header - RED/YELLOW PATRIOTIC THEME */}
              <div className="p-6 border-b-4 flex justify-between items-center relative z-10 bg-[#DA251D] border-[#FFFF00]">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-full bg-[#FFFF00] text-[#DA251D] shadow-lg animate-pulse"><Star size={32} fill="currentColor" /></div>
                     <div>
                        <h2 className="text-2xl font-black uppercase tracking-wider text-[#FFFF00] drop-shadow-md">Thử thách Chủ quyền</h2>
                        <p className="text-xs text-white font-bold opacity-90 uppercase">Trả lời đúng 10/10 câu hỏi Lịch sử để tải xuống</p>
                     </div>
                  </div>
                  <button onClick={() => setShowQuiz(false)} className="hover:bg-red-900/50 p-2 rounded-full transition-colors text-white"><X size={24} /></button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-[#0E1117] to-[#1A0505]">
                 {quizPassed ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 space-y-6 animate-in zoom-in">
                       <div className="relative">
                          <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full"></div>
                          <CheckCircle2 size={100} className="text-green-500 relative z-10" />
                       </div>
                       <h3 className="text-3xl font-black uppercase text-green-500 tracking-widest text-center">Xác minh thành công!</h3>
                       <p className="text-gray-300 text-center max-w-lg text-lg">
                         Cảm ơn bạn đã khẳng định kiến thức về chủ quyền Việt Nam. File âm thanh đang được tải xuống...
                       </p>
                    </div>
                 ) : (
                    <div className="grid gap-6">
                       <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-center mb-4">
                          <p className="text-red-400 text-sm font-bold uppercase tracking-widest">
                            <ShieldAlert size={16} className="inline mr-2" />
                            Phát hiện IP nước ngoài: {clientIp}
                          </p>
                       </div>
                       {currentQuestions.map((q, idx) => (
                          <div key={q.id} className="space-y-4 p-6 rounded-2xl border border-gray-800 bg-gray-900/80 hover:bg-gray-900 transition-all shadow-lg">
                             <h3 className="font-bold text-base md:text-lg flex gap-3 text-gray-200">
                                <span className="text-[#FFFF00] font-black min-w-[30px]">Câu {idx + 1}.</span> 
                                {q.question}
                             </h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                                {q.options.map((opt) => (
                                   <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${userAnswers[q.id] === opt ? 'bg-[#FFFF00]/10 border-[#FFFF00] text-[#FFFF00]' : 'border-gray-700 hover:border-gray-500 text-gray-400'}`}>
                                      <input 
                                        type="radio" 
                                        name={`q-${q.id}`} 
                                        value={opt}
                                        checked={userAnswers[q.id] === opt}
                                        onChange={() => handleQuizAnswer(q.id, opt)}
                                        className="hidden" 
                                      />
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userAnswers[q.id] === opt ? 'border-[#FFFF00]' : 'border-gray-500'}`}>
                                         {userAnswers[q.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]" />}
                                      </div>
                                      <span className="text-sm font-bold">{opt}</span>
                                   </label>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              {/* Footer */}
              {!quizPassed && (
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
                    <div className="text-sm text-gray-500 font-mono font-bold">
                       ĐÃ TRẢ LỜI: <span className="text-white">{Object.keys(userAnswers).length}</span>/10
                    </div>
                    <button 
                      onClick={submitQuiz}
                      disabled={Object.keys(userAnswers).length < 10}
                      className="px-10 py-4 rounded-xl bg-[#FFFF00] hover:bg-yellow-400 text-[#DA251D] font-black uppercase text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,0,0.3)] tracking-widest"
                    >
                       Xác nhận
                    </button>
                </div>
              )}
           </div>
        </div>
      )}

      <header className="p-4 border-b flex justify-between items-center shadow-2xl z-30 transition-colors duration-300 relative" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}>
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg border transition-colors"
            style={{ borderColor: theme.colors.border, color: theme.colors.accent }}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="overflow-hidden">
            <h1 className="text-sm md:text-lg font-black tracking-tighter uppercase italic flex flex-wrap items-center gap-2" style={{ color: theme.colors.text }}>
              TTS COMMUNITY <span className="px-1.5 py-0.5 rounded text-[8px] md:text-[10px] not-italic font-black border" style={{ backgroundColor: theme.colors.accent, color: theme.colors.bg, borderColor: theme.colors.accent }}>VN ONLY</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ADE80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <Wind size={12} className="animate-pulse" /> Breath Sync Active
          </div>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
            style={{ 
              backgroundColor: isAdmin ? 'rgba(34, 197, 94, 0.1)' : theme.colors.card, 
              color: isAdmin ? '#4ADE80' : theme.colors.subText,
              borderColor: isAdmin ? '#4ADE80' : theme.colors.border 
            }}
            title={isAdmin ? "Đã mở khóa Admin" : "Chế độ Khách (Bị giới hạn)"}
          >
            {isAdmin ? <Unlock size={12} /> : <Lock size={12} />} <span className="hidden md:inline">{isAdmin ? "Admin Unlocked" : "Guest Mode"}</span>
          </button>
          <button 
            onClick={() => setForceOffline(!forceOffline)}
            className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all hover:scale-105 active:scale-95 cursor-pointer select-none`}
            style={{ 
              backgroundColor: isSystemOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isSystemOnline ? '#4ADE80' : '#F87171',
              borderColor: isSystemOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }}
            title="Click để giả lập trạng thái Offline"
          >
            {isSystemOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* SIDEBAR - Responsive: Drawer on Mobile, Fixed on Desktop */}
        <aside 
          className={`
            fixed lg:static top-0 left-0 z-50 h-full w-[85%] max-w-[320px] lg:w-72 border-r p-5 space-y-6 overflow-y-auto transition-all duration-300
            ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}
        >
          {/* Close button only visible on mobile */}
          <div className="lg:hidden flex justify-end mb-4">
             <button onClick={() => setShowMobileMenu(false)} style={{ color: theme.colors.text }}><X size={24} /></button>
          </div>
          
          {/* SECURITY STATUS CARD */}
          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: theme.colors.subText }}>
              <ShieldCheck size={14} /> Security Matrix
            </label>
            <div className="p-3 border rounded-xl text-[9px] font-mono space-y-2" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.subText }}>
               <div className="flex justify-between items-center">
                  <span>IP:</span>
                  <span className={isVietnameseIp ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{clientIp}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span>REGION:</span>
                  <span className={isVietnameseIp ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{isCheckingSecurity ? "SCANNING..." : (isVietnameseIp ? "VIETNAM (VN)" : "RESTRICTED")}</span>
               </div>
               <div className="flex justify-between items-center" title={hardwareFingerprint}>
                  <span>HW-ID:</span>
                  <span className="text-gray-500">{hardwareFingerprint.substring(0, 12)}...</span>
               </div>
               <div className="flex justify-between items-center">
                  <span>INTEGRITY:</span>
                  <span className="text-green-500 font-bold">SECURE (L4)</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: theme.colors.subText }}>
              <BarChart3 size={14} /> Server Status
            </label>
            <div className="p-4 border rounded-xl space-y-3" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
              <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: theme.colors.border }}>
                <span className="text-[10px] font-bold uppercase" style={{ color: theme.colors.subText }}>Next Reset:</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded border flex items-center gap-1" style={{ backgroundColor: theme.colors.bg, color: theme.colors.accent, borderColor: theme.colors.border }}>
                   <Clock size={10} /> {timeUntilReset}
                </span>
              </div>

              {/* GLOBAL LIMIT */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold" style={{ color: theme.colors.subText }}>DAILY QUOTA:</span>
                <span className="text-xs font-mono font-black" style={{ color: isOverDailyLimit ? '#EF4444' : theme.colors.text }}>
                   {dailyUsage.toLocaleString()} / {isAdmin ? "∞" : _0x_L1.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: theme.colors.border }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${isAdmin ? 0 : Math.min(100, (dailyUsage / _0x_L1) * 100)}%`, backgroundColor: isOverDailyLimit ? '#EF4444' : theme.colors.text }}></div>
              </div>
              
              {/* HUMAN 99% LIMIT */}
              <div className="flex justify-between items-center pt-1 border-t border-dashed" style={{ borderColor: theme.colors.border }}>
                <span className="text-[10px] font-bold" style={{ color: theme.colors.accent }}>HUMAN 99%:</span>
                <span className="text-xs font-mono font-black" style={{ color: isOverHumanLimit ? '#EF4444' : theme.colors.accent }}>
                   {humanUsage.toLocaleString()} / {isAdmin ? "∞" : _0x_L2.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.border }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${isAdmin ? 0 : Math.min(100, (humanUsage / _0x_L2) * 100)}%`, backgroundColor: isOverHumanLimit ? '#EF4444' : theme.colors.accent }}></div>
              </div>
            </div>
          </div>

           {/* THEME SWITCHER */}
           <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: theme.colors.subText }}>
              <Palette size={14} /> Giao diện ({activeThemeId})
            </label>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveThemeId(t.id)}
                  className="w-full aspect-square rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: t.colors.bg, 
                    borderColor: activeThemeId === t.id ? theme.colors.accent : t.colors.border 
                  }}
                  title={t.name}
                >
                  {activeThemeId === t.id && <Check size={12} style={{ color: t.colors.accent }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6">
             <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border shadow-lg" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center justify-center gap-2 font-black text-xs mb-2 uppercase tracking-widest" 
                  style={{ 
                    background: 'linear-gradient(90deg, #F59E0B, #EF4444, #F59E0B)', 
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                  <User size={14} className="text-yellow-500" fill="currentColor" /> ĐÀO VĂN PHƯƠNG
                </div>
                <p className="text-[10px] text-center leading-relaxed italic border-t pt-2 mt-2 mb-3" style={{ color: theme.colors.subText, borderColor: theme.colors.border }}>
                  "Thiết kế bởi Đào Văn Phương - Facebook: Daovanphuong38 - Zalo: 0945053428"
                </p>
                <div className="w-full rounded-lg overflow-hidden border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                     <img src={VN_FLAG_URL} alt="Vietnam" className="w-full h-auto aspect-[3/2] object-cover" />
                </div>
             </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showMobileMenu && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowMobileMenu(false)}></div>}

        <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          <section className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 lg:overflow-y-auto border-r transition-colors duration-300" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
            <div className="border rounded-3xl p-4 lg:p-6 space-y-4 lg:space-y-6 shadow-2xl relative overflow-hidden group transition-colors duration-300" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}>
              <div className="absolute top-0 left-0 w-1 h-full transition-all" style={{ backgroundColor: theme.colors.highlight }}></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest" style={{ color: theme.colors.subText }}><Settings size={14} /> Voice Configuration</div>
                <div className="text-[10px] font-mono flex items-center gap-2" style={{ color: theme.colors.subText }}>
                  <Hash size={12} /> {wordCount.toLocaleString()} WORDS | {charCount.toLocaleString()} CHARS
                </div>
              </div>

              {mode === AppMode.SINGLE ? (
                <ProfileSelector 
                  profile={singleProfile} 
                  onChange={setSingleProfile} 
                  onPreview={() => handlePreview(singleProfile, 'single')}
                  isPreviewing={previewLoading === 'single'}
                  theme={theme}
                />
              ) : (
                <div className="space-y-4">
                  {speakers.map((s, idx) => (
                    <div key={s.id} className="p-4 rounded-2xl border hover:border-opacity-100 transition-all" style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase italic tracking-wider flex items-center gap-2" style={{ color: theme.colors.accent }}><User size={12} /> {s.name}</span>
                        <input value={s.name} onChange={(e) => {
                          const ns = [...speakers];
                          ns[idx] = { ...ns[idx], name: e.target.value };
                          setSpeakers(ns);
                        }} className="bg-transparent border-b text-xs text-right outline-none transition-all" style={{ color: theme.colors.text, borderColor: theme.colors.border }} />
                      </div>
                      <ProfileSelector 
                        profile={s.profile} 
                        onChange={(p) => {
                          const ns = speakers.map((sp, i) => i === idx ? { ...sp, profile: p } : sp);
                          setSpeakers(ns);
                        }} 
                        onPreview={() => handlePreview(s.profile, s.id)}
                        isPreviewing={previewLoading === s.id}
                        theme={theme}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* CONTROLS SECTION */}
              <div className="pt-4 border-t space-y-4" style={{ borderColor: theme.colors.border }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: theme.colors.subText }}>Chế độ vận hành</label>
                        <div className="flex p-1 rounded-xl border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.card }}>
                            <button onClick={() => setMode(AppMode.SINGLE)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all`}
                                style={{
                                backgroundColor: mode === AppMode.SINGLE ? theme.colors.accent : 'transparent',
                                color: mode === AppMode.SINGLE ? theme.colors.bg : theme.colors.subText,
                                }}
                            >
                                <Volume2 size={14} /> ĐƠN THOẠI
                            </button>
                            <button onClick={() => setMode(AppMode.DIALOGUE)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all`}
                                style={{
                                backgroundColor: mode === AppMode.DIALOGUE ? theme.colors.accent : 'transparent',
                                color: mode === AppMode.DIALOGUE ? theme.colors.bg : theme.colors.subText,
                                }}
                            >
                                <MessageSquare size={14} /> ĐỐI THOẠI
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: theme.colors.subText }}>
                             Chất lượng Human 99% {isOverHumanLimit && !isAdmin ? "(ĐÃ HẾT QUOTA)" : ""}
                        </label>
                        <button 
                            onClick={() => !isOverHumanLimit && setUseHumanMode(!useHumanMode)}
                            disabled={isOverHumanLimit && !isAdmin}
                            className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between transition-all ${isOverHumanLimit && !isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-opacity-100'}`}
                            style={{ 
                                borderColor: useHumanMode ? theme.colors.accent : theme.colors.border, 
                                backgroundColor: theme.colors.card,
                                color: useHumanMode ? theme.colors.accent : theme.colors.subText
                            }}
                        >
                            <span className="text-[10px] font-bold">
                                {useHumanMode ? "ĐANG BẬT (CAO CẤP)" : "ĐANG TẮT (TIÊU CHUẨN)"}
                            </span>
                            {useHumanMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                    </div>
                  </div>
              </div>
            </div>

            <div className="border rounded-3xl flex flex-col h-[400px] shadow-2xl overflow-hidden relative transition-colors duration-300" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}>
               <div className="flex border-b items-center overflow-x-auto" style={{ backgroundColor: theme.colors.border, borderColor: theme.colors.border }}>
                 <button onClick={() => setActiveTab('builder')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-4`}
                   style={{ 
                     backgroundColor: activeTab === 'builder' ? theme.colors.bg : theme.colors.paper,
                     color: activeTab === 'builder' ? theme.colors.accent : theme.colors.subText,
                     borderBottom: activeTab === 'builder' ? `2px solid ${theme.colors.accent}` : 'none'
                   }}
                 >Visual Editor</button>
                 <button onClick={() => handleTabChange('raw')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap px-4`}
                    style={{ 
                     backgroundColor: activeTab === 'raw' ? theme.colors.bg : theme.colors.paper,
                     color: activeTab === 'raw' ? theme.colors.accent : theme.colors.subText,
                     borderBottom: activeTab === 'raw' ? `2px solid ${theme.colors.accent}` : 'none'
                   }}
                 >
                   Source Script
                 </button>
                 <button 
                  onClick={handleRefine}
                  disabled={refining || !isSystemOnline}
                  className="px-4 lg:px-6 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-l disabled:opacity-50 transition-all group whitespace-nowrap"
                  style={{ color: '#60A5FA', borderColor: theme.colors.border, backgroundColor: theme.colors.paper }}
                 >
                   {refining ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} className="group-hover:scale-110 transition-transform" />}
                   {refining ? "AI Refining" : "Smart Refine"}
                 </button>
               </div>
               <div className="flex-1 p-4 lg:p-8 overflow-y-auto" style={{ backgroundColor: theme.colors.card }}>
                 {activeTab === 'builder' ? (
                   mode === AppMode.SINGLE ? (
                     <textarea value={singleText} onChange={(e) => setSingleText(e.target.value)} 
                       className="w-full h-full bg-transparent resize-none outline-none text-base lg:text-lg leading-relaxed font-light" 
                       style={{ color: theme.colors.text }}
                       placeholder="Nhập văn bản không giới hạn tại đây..." 
                     />
                   ) : (
                     <div className="space-y-4">
                        {dialogue.map((line, idx) => (
                          <div key={line.id} className="flex gap-2 lg:gap-4 items-start group animate-in slide-in-from-left-2 duration-300">
                            <select value={line.speakerId} onChange={(e) => {
                              const nd = [...dialogue];
                              nd[idx] = { ...nd[idx], speakerId: e.target.value };
                              setDialogue(nd);
                            }} className="w-20 lg:w-24 shrink-0 border text-[10px] font-black rounded-lg p-2 outline-none cursor-pointer"
                              style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border, color: theme.colors.accent }}
                            >
                              {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <textarea value={line.text} onChange={(e) => {
                              const nd = [...dialogue];
                              nd[idx] = { ...nd[idx], text: e.target.value };
                              setDialogue(nd);
                            }} className="flex-1 border rounded-xl p-3 text-sm outline-none resize-none min-h-[40px] transition-all"
                               style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border, color: theme.colors.text }}
                             rows={1} />
                            <button onClick={() => setDialogue(dialogue.filter((_, i) => i !== idx))} className="mt-2 transition-colors" style={{ color: theme.colors.subText }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                        <button onClick={() => setDialogue([...dialogue, { id: Date.now().toString(), speakerId: speakers[0].id, text: '' }])} 
                          className="w-full py-4 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-tighter transition-all hover:border-opacity-100"
                          style={{ borderColor: theme.colors.border, color: theme.colors.subText }}
                        >+ Add New Voice Line</button>
                     </div>
                   )
                 ) : <pre className="text-xs font-mono leading-loose whitespace-pre-wrap" style={{ color: theme.colors.text }}>{mode === AppMode.SINGLE ? singleText : dialogue.map(l => `${speakers.find(s => s.id === l.speakerId)?.name}: ${l.text}`).join('\n')}</pre>}
               </div>
            </div>

            <button onClick={handleConvert} disabled={loading || !isSystemOnline || (isOverDailyLimit && !isAdmin)} 
              className={`w-full font-black py-4 lg:py-6 rounded-3xl flex items-center justify-center gap-2 lg:gap-4 shadow-xl transition-all disabled:opacity-50 disabled:grayscale group ${!isAdmin && isOverDailyLimit ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.01] active:scale-[0.98]'}`}
              style={{ backgroundColor: !isAdmin && isOverDailyLimit ? '#EF4444' : theme.colors.accent, color: theme.colors.bg }}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (!isAdmin && isOverDailyLimit ? <Lock size={24} /> : <Play size={24} className="group-hover:translate-x-1 transition-transform" fill="currentColor" />)}
              <span className="text-sm lg:text-xl uppercase tracking-tighter text-center">
                {!isAdmin && isOverDailyLimit ? `QUÁ GIỚI HẠN ${_0x_L1 / 1000}K KÝ TỰ` : "KẾT XUẤT ÂM THANH (PHIÊN BẢN CỘNG ĐỒNG) 🚀"}
              </span>
            </button>
          </section>

          <section className="w-full lg:w-96 p-4 lg:p-6 flex flex-col space-y-4 lg:space-y-6 border-t lg:border-t-0 lg:border-l transition-colors duration-300 lg:overflow-y-auto" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}>
             <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: theme.colors.subText }}>Output Management</label>
             <div className="min-h-[300px] lg:flex-1 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center space-y-8 shadow-inner relative overflow-hidden transition-colors duration-300"
               style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}
             >
                {!audioUrl && !loading && (
                  <div className="flex flex-col items-center justify-center space-y-6 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                      <img src={VN_FLAG_URL} alt="Vietnam Flag" className="relative w-48 lg:w-64 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] rounded-lg" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: theme.colors.text }}>Ready for Community Render</p>
                         <div className="flex items-center justify-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-yellow-500"></span>
                            <p className="text-[10px] font-bold text-yellow-600">HOANG SA & TRUONG SA BELONG TO VIETNAM</p>
                            <span className="h-1 w-1 rounded-full bg-yellow-500"></span>
                         </div>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 rounded-full animate-spin" style={{ borderColor: theme.colors.highlight, borderTopColor: theme.colors.accent }}></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" size={32} style={{ color: theme.colors.accent }} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black tracking-widest animate-pulse uppercase italic" style={{ color: theme.colors.accent }}>Processing Free Request...</p>
                      <p className="text-[10px] uppercase font-bold" style={{ color: theme.colors.subText }}>Applying Natural Pauses</p>
                    </div>
                  </div>
                )}

                {audioUrl && !loading && (
                  <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-xl border-4"
                      style={{ backgroundColor: theme.colors.accent, borderColor: theme.colors.bg }}
                    >
                      <Volume2 size={64} style={{ color: theme.colors.bg }} />
                    </div>
                    <div className="space-y-6">
                      <div className="inline-block px-4 py-1.5 text-[10px] font-black rounded-full border uppercase"
                        style={{ backgroundColor: theme.colors.highlight, color: theme.colors.accent, borderColor: theme.colors.highlight }}
                      >Community Build Ready</div>
                      <audio src={audioUrl} controls className="w-full h-10" style={{ accentColor: theme.colors.accent }} />
                      
                      <div className="relative">
                        <a 
                          href={audioUrl} 
                          onClick={(e) => handleDownloadClick(e, audioUrl)}
                          download={`community_tts_${Date.now()}.wav`}
                          className="flex items-center justify-center gap-3 w-full py-5 font-black rounded-3xl text-xs transition-all shadow-xl uppercase tracking-widest hover:brightness-110 cursor-pointer"
                          style={{ backgroundColor: theme.colors.text, color: theme.colors.bg }}
                        >
                          <Download size={18} /> Download WAV
                        </a>
                      </div>
                    </div>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 gap-3">
               <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}>
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><Zap size={16} className="text-blue-400" /></div>
                    <span className="text-[10px] uppercase font-black" style={{ color: theme.colors.subText }}>Latency</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-blue-400">OPTIMIZED</span>
               </div>
               <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: theme.colors.paper, borderColor: theme.colors.border }}>
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}><ShieldCheck size={16} className="text-green-400" /></div>
                    <span className="text-[10px] uppercase font-black" style={{ color: theme.colors.subText }}>Access</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-green-400">UNLIMITED</span>
               </div>
             </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;