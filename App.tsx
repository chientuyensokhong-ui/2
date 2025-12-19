import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Settings, Play, Download, Trash2, Plus, Volume2, MessageSquare, User, FileText, Loader2, Info, Sparkles, HeartPulse, Mic2, Wifi, WifiOff, ShieldCheck, Zap, BarChart3, Headphones, BrainCircuit, Wind, Hash, Infinity, Globe, Users, ToggleLeft, ToggleRight, BookOpen, Palette, Check, Lock, Unlock, KeyRound, X, AlertTriangle, Fingerprint, MapPin, Cpu, ShieldAlert, Menu, HelpCircle, CheckCircle2, XCircle, Terminal, Clock, Skull, Star } from 'lucide-react';
import { AppMode, Speaker, DialogueLine, VoiceProfile, Gender, Region, Age, Pitch, Intonation, BaseVoice, Theme } from './types';
import { generateSpeech, generateDialogue, decodeBase64Audio, createWavBlob, refineText } from './services/tts';

// ============================================================================
// KHU VỰC CẤU HÌNH (ĐƯỢC PHÉP CHỈNH SỬA)
// Bạn có thể thêm bớt giọng đọc, vùng miền, ngữ điệu tại đây.
// ============================================================================

const GENDERS: Gender[] = ['Nam', 'Nữ'];

const REGIONS: Region[] = [
  'Miền Bắc (Hà Nội)', 
  'Miền Trung (Huế/Đà Nẵng)', 
  'Miền Nam (Sài Gòn)', 
  'Chuẩn (Trung lập)',
  'Bắc Bộ (Giọng Cổ)', // Mới thêm
  'Nam Bộ (Miền Tây)'  // Mới thêm
];

const AGES: Age[] = ['Trẻ em', 'Thanh niên', 'Trung niên', 'Người già'];
const PITCHES: Pitch[] = ['Trầm', 'Trung bình', 'Cao'];

const INTONATIONS: Intonation[] = [
  'Tự nhiên', 'Vui vẻ', 'Trầm buồn', 'Trang trọng', 'Kịch tính', 'Hào hứng',
  'Thì thầm', 'Hùng hồn' // Mới thêm
];

const BASE_VOICES: BaseVoice[] = [
  'Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr', 'Leda', 'Aoede',
  // Thêm giọng mới vào đây nếu API hỗ trợ
];

const DEFAULT_PROFILE: VoiceProfile = {
  gender: 'Nam',
  region: 'Miền Bắc (Hà Nội)',
  age: 'Thanh niên',
  pitch: 'Trung bình',
  intonation: 'Tự nhiên',
  baseVoice: 'Kore'
};

// ============================================================================
// KHU VỰC BẢO MẬT CỐT LÕI (CẤM CHỈNH SỬA - DO NOT MODIFY)
// CORE SECURITY KERNEL - 10 LAYERS FIREWALL
// ============================================================================

// Layer 1: Integrity Constants (Hex Obfuscation)
const _0x_L1 = 0x7A120; // 500,000
const _0x_L2 = 0x4E20;  // 20,000

// Layer 5: Author Identity Constants (Immutable)
const _SEC_AUTHOR = "ĐÀO VĂN PHƯƠNG";
const _SEC_CONTACT = "Facebook: Daovanphuong38 - Zalo: 0945053428";
// Hash signature of author name (Simple checksum for demo)
const _SEC_HASH = 13854; 

const _SEC_KEY = "MTQxMDIw"; // Base64 password (141020)
const VN_FLAG_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/2000px-Flag_of_Vietnam.svg.png";

// Object Freeze to prevent runtime modification (Layer 7)
const SECURITY_CONFIG = Object.freeze({
  maxDaily: _0x_L1,
  maxHuman: _0x_L2,
  author: _SEC_AUTHOR,
  contact: _SEC_CONTACT,
  banDuration: 72 * 60 * 60 * 1000
});

// Honeypot Variable (Layer 8)
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window._sys_bypass_check = false; // If hacker sets this to true, we ban.
}

// === SOVEREIGNTY CHALLENGE DATA ===
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
  { id: 9, question: "Vị tướng huyền thoại nào được mệnh danh là Anh cả của Quân đội Nhân dân Việt Nam?", options: ["Võ Nguyên Giáp", "Văn Tiến Dũng", "Nguyễn Chí Thanh", "Hoàng Văn