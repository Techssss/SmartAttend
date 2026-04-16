import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';

interface Translations {
  // Loading
  loading_title: string;
  loading_subtitle: string;
  
  // Header
  search_placeholder: string;
  login: string;
  home: string;
  services: string;
  news: string;
  data: string;
  info: string;
  documents: string;
  permits: string;
  tax: string;
  complaints: string;
  
  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_description: string;
  hero_features: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_main_services: string;
  hero_services_desc: string;
  
  // Service Categories
  service_population: string;
  service_population_desc: string;
  service_tax_payment: string;
  service_tax_desc: string;
  service_business_permit: string;
  service_business_desc: string;
  service_support: string;
  service_support_desc: string;
  service_health: string;
  service_health_desc: string;
  
  // Trust Points
  trust_security: string;
  trust_security_desc: string;
  trust_speed: string;
  trust_speed_desc: string;
  trust_ease: string;
  trust_ease_desc: string;
  
  // Quick Access
  quick_access_badge: string;
  quick_access_title: string;
  quick_access_desc: string;
  start_now: string;
  estimated_time: string;
  completed_today: string;
  services_completed: string;
  average_response: string;
  satisfaction_rate: string;
  online_services: string;
  
  // Services by Persona
  persona_title: string;
  persona_desc: string;
  persona_student: string;
  persona_family: string;
  persona_elderly: string;
  persona_business: string;
  
  // Student Services
  student_domicile: string;
  student_legalization: string;
  student_poor_certificate: string;
  student_scholarship: string;
  
  // Family Services
  family_birth_cert: string;
  family_card: string;
  family_marriage: string;
  family_health: string;
  
  // Elderly Services
  elderly_social_aid: string;
  elderly_free_health: string;
  elderly_active_program: string;
  elderly_consultation: string;
  
  // Business Services
  business_siup_tdp: string;
  business_permit: string;
  business_ads_permit: string;
  business_tax: string;
  
  // News Section
  news_title: string;
  news_desc: string;
  news_tab: string;
  announcements_tab: string;
  
  // Sample News
  news_scholarship_title: string;
  news_scholarship_desc: string;
  news_app_title: string;
  news_app_desc: string;
  news_festival_title: string;
  news_festival_desc: string;
  
  // Sample Announcements
  announce_holiday_title: string;
  announce_holiday_desc: string;
  announce_infrastructure_title: string;
  announce_infrastructure_desc: string;
  announce_health_title: string;
  announce_health_desc: string;
  
  // Agenda Section
  agenda_title: string;
  agenda_desc: string;
  view_all_agenda: string;
  agenda_meeting_title: string;
  agenda_dialog_title: string;
  agenda_smart_city_title: string;
  
  // Agenda Types
  meeting_type: string;
  public_dialog_type: string;
  public_event_type: string;
  
  // Agenda Participants
  officials_participants: string;
  public_officials_participants: string;
  all_citizens_participants: string;
  
  // Transparency Section
  transparency_badge: string;
  transparency_title_1: string;
  transparency_title_2: string;
  transparency_desc: string;
  transparency_features: string;
  
  // Transparency Widgets
  financial_report: string;
  financial_desc: string;
  budget_2025: string;
  budget_desc: string;
  e_report: string;
  e_report_desc: string;
  open_data: string;
  open_data_desc: string;
  
  // Transparency Labels
  total_budget: string;
  development: string;
  reports_received: string;
  datasets: string;
  progress: string;
  
  // Portal
  portal_title: string;
  portal_desc: string;
  budget_distributed: string;
  projects_completed: string;
  transparency_score: string;
  access_portal: string;
  
  // Testimonials
  testimonials_title: string;
  testimonials_desc: string;
  testimonials_cta_1: string;
  testimonials_cta_2: string;
  testimonials_question: string;
  
  // Priority and Category Labels
  priority_important: string;
  priority_info: string;
  category_education: string;
  category_technology: string;
  category_culture: string;
  popular_label: string;
  
  // Footer Accessibility
  accessibility: string;
  text_size: string;
  display_mode: string;
  light: string;
  dark: string;
  language: string;
  disability_support: string;
  access_guide: string;
  
  // Footer Links
  contact_us: string;
  main_services: string;
  information: string;
  transparency: string;
  social_media: string;
  privacy_policy: string;
  terms_conditions: string;
  sitemap: string;
  copyright: string;
}

const translations: Record<Language, Translations> = {
  id: {
    // Loading
    loading_title: "Pemkot Medan",
    loading_subtitle: "Mempersiapkan layanan terbaik untuk Anda...",
    
    // Header
    search_placeholder: "Cari layanan...",
    login: "Masuk",
    home: "Home",
    services: "Layanan",
    news: "Berita",
    data: "Data",
    info: "Info",
    documents: "Dokumen",
    permits: "Perizinan",
    tax: "Pajak",
    complaints: "Pengaduan",
    
    // Hero Section
    hero_badge: "Portal Resmi Pemerintah Kota Medan",
    hero_title_1: "Layanan Digital",
    hero_title_2: "Kota Medan",
    hero_description: "Platform terpadu untuk mengakses seluruh layanan pemerintahan",
    hero_features: "Efisien • Transparan • Terpercaya",
    hero_cta_primary: "Mulai Layanan",
    hero_cta_secondary: "Bantuan 24/7",
    hero_main_services: "Layanan Utama",
    hero_services_desc: "Akses cepat ke layanan yang paling sering digunakan",
    
    // Service Categories
    service_population: "Dokumen Kependudukan",
    service_population_desc: "e-KTP, KK, Akta",
    service_tax_payment: "Pembayaran Pajak",
    service_tax_desc: "PBB, Kendaraan",
    service_business_permit: "Perizinan Usaha",
    service_business_desc: "SIUP, TDP, NIB",
    service_support: "Bantuan & Dukungan",
    service_support_desc: "Call Center 24/7",
    service_health: "Layanan Kesehatan",
    service_health_desc: "Info RS, Puskesmas, Faskes",
    
    // Trust Points
    trust_security: "Keamanan Data",
    trust_security_desc: "Terjamin",
    trust_speed: "Proses Cepat",
    trust_speed_desc: "< 15 menit",
    trust_ease: "Mudah Digunakan",
    trust_ease_desc: "User friendly",
    
    // Quick Access
    quick_access_badge: "Layanan Prioritas",
    quick_access_title: "Akses Cepat Layanan Digital",
    quick_access_desc: "Pilih layanan yang Anda butuhkan untuk mendapatkan bantuan dengan cepat dan efisien",
    start_now: "Mulai Sekarang",
    estimated_time: "Est.",
    completed_today: "hari ini",
    services_completed: "Layanan Selesai",
    average_response: "Rata-rata Respon",
    satisfaction_rate: "Kepuasan Warga",
    online_services: "Layanan Online",
    
    // Services by Persona
    persona_title: "Kamu Warga, Kami Bantu",
    persona_desc: "Layanan yang disesuaikan dengan kebutuhan spesifik setiap kelompok masyarakat",
    persona_student: "Mahasiswa",
    persona_family: "Keluarga",
    persona_elderly: "Lansia",
    persona_business: "Pemilik Usaha",
    
    // Student Services
    student_domicile: "Surat Keterangan Domisili",
    student_legalization: "Legalisir Dokumen",
    student_poor_certificate: "Surat Keterangan Tidak Mampu",
    student_scholarship: "Beasiswa Daerah",
    
    // Family Services
    family_birth_cert: "Akta Kelahiran",
    family_card: "Kartu Keluarga",
    family_marriage: "Surat Nikah",
    family_health: "Layanan Kesehatan",
    
    // Elderly Services
    elderly_social_aid: "Bantuan Sosial",
    elderly_free_health: "Layanan Kesehatan Gratis",
    elderly_active_program: "Program Lansia Aktif",
    elderly_consultation: "Konsultasi Medis",
    
    // Business Services
    business_siup_tdp: "SIUP & TDP",
    business_permit: "Izin Gangguan (HO)",
    business_ads_permit: "Izin Reklame",
    business_tax: "Pajak Restoran & Hotel",
    
    // News Section
    news_title: "Apa yang Baru di Kota Medan?",
    news_desc: "Tetap update dengan berita terbaru dan pengumuman penting dari Pemerintah Kota Medan",
    news_tab: "📰 Berita",
    announcements_tab: "📢 Pengumuman",
    
    // Sample News
    news_scholarship_title: "Pembukaan Pendaftaran Program Beasiswa Kota Medan 2025",
    news_scholarship_desc: "Pemerintah Kota Medan membuka pendaftaran beasiswa untuk siswa berprestasi...",
    news_app_title: "Launching Aplikasi Mobile Layanan Publik Digital",
    news_app_desc: "Aplikasi baru memudahkan warga mengakses layanan publik melalui smartphone...",
    news_festival_title: "Festival Budaya Medan 2025 Segera Dimulai",
    news_festival_desc: "Rayakan keberagaman budaya Medan dalam festival tahunan yang meriah...",
    
    // Sample Announcements
    announce_holiday_title: "Pengumuman Libur Nasional Hari Raya Idul Adha",
    announce_holiday_desc: "Pelayanan publik akan tutup pada tanggal 17 Juni 2025...",
    announce_infrastructure_title: "Perbaikan Infrastruktur Jalan Protokol",
    announce_infrastructure_desc: "Pembangunan flyover dan pelebaran jalan akan dimulai minggu depan...",
    announce_health_title: "Pembukaan Fasilitas Kesehatan Baru di Medan Timur",
    announce_health_desc: "Puskesmas baru siap melayani masyarakat dengan fasilitas modern...",
    
    // Agenda Section
    agenda_title: "Agenda Pemkot",
    agenda_desc: "Transparansi kegiatan pemerintahan untuk membangun kepercayaan publik",
    view_all_agenda: "Lihat Semua Agenda",
    agenda_meeting_title: "Rapat Koordinasi Pembangunan Infrastruktur",
    agenda_dialog_title: "Dialog Publik Anggaran Daerah 2026",
    agenda_smart_city_title: "Launching Program Smart City Medan",
    
    // Agenda Types
    meeting_type: "Rapat",
    public_dialog_type: "Dialog Publik",
    public_event_type: "Acara Publik",
    
    // Agenda Participants
    officials_participants: "Kepala Dinas & Walikota",
    public_officials_participants: "Masyarakat & Pejabat",
    all_citizens_participants: "Seluruh Warga",
    
    // Transparency Section
    transparency_badge: "Transparansi Publik",
    transparency_title_1: "Kami",
    transparency_title_2: "Bertanggung Jawab",
    transparency_desc: "Transparansi dan akuntabilitas dalam setiap aspek pemerintahan",
    transparency_features: "Terpercaya • Terbuka • Akuntabel",
    
    // Transparency Widgets
    financial_report: "Laporan Keuangan",
    financial_desc: "APBD 2025 dan realisasi anggaran",
    budget_2025: "Anggaran 2025",
    budget_desc: "Alokasi dana pembangunan",
    e_report: "e-LAPOR",
    e_report_desc: "Pengaduan dan aspirasi warga",
    open_data: "Data Terbuka",
    open_data_desc: "Akses data publik dan statistik",
    
    // Transparency Labels
    total_budget: "Total Anggaran",
    development: "Pembangunan",
    reports_received: "Laporan Masuk",
    datasets: "Dataset",
    progress: "Progress",
    
    // Portal
    portal_title: "Portal Transparansi Real-time",
    portal_desc: "Akses semua data dan laporan pemerintahan dalam satu dashboard interaktif",
    budget_distributed: "Anggaran Tersalur",
    projects_completed: "Proyek Selesai",
    transparency_score: "Transparansi Skor",
    access_portal: "Akses Portal Transparansi",
    
    // Testimonials
    testimonials_title: "Testimoni dan Aspirasi Warga",
    testimonials_desc: "Suara warga adalah prioritas kami. Berikut pengalaman mereka dengan layanan Pemkot Medan",
    testimonials_cta_1: "Tulis Testimoni",
    testimonials_cta_2: "Sampaikan Aspirasi",
    testimonials_question: "Ingin berbagi pengalaman Anda?",
    
    // Priority and Category Labels
    priority_important: "Penting",
    priority_info: "Info",
    category_education: "Pendidikan",
    category_technology: "Teknologi", 
    category_culture: "Budaya",
    popular_label: "Populer",
    
    // Footer Accessibility
    accessibility: "Aksesibilitas",
    text_size: "Ukuran Teks",
    display_mode: "Mode Tampilan",
    light: "Terang",
    dark: "Gelap",
    language: "Bahasa",
    disability_support: "Dukungan Difabel",
    access_guide: "Panduan Akses",
    
    // Footer Links
    contact_us: "Kontak Kami",
    main_services: "Layanan Utama",
    information: "Informasi",
    transparency: "Transparansi",
    social_media: "Media Sosial",
    privacy_policy: "Kebijakan Privasi",
    terms_conditions: "Syarat & Ketentuan",
    sitemap: "Peta Situs",
    copyright: "2025 Pemerintah Kota Medan. Seluruh hak cipta dilindungi."
  },
  en: {
    // Loading
    loading_title: "Medan City Gov",
    loading_subtitle: "Preparing the best services for you...",
    
    // Header
    search_placeholder: "Search services...",
    login: "Login",
    home: "Home",
    services: "Services",
    news: "News",
    data: "Data",
    info: "Info",
    documents: "Documents",
    permits: "Permits",
    tax: "Tax",
    complaints: "Complaints",
    
    // Hero Section
    hero_badge: "Official Portal of Medan City Government",
    hero_title_1: "Digital Services",
    hero_title_2: "Medan City",
    hero_description: "Integrated platform to access all government services",
    hero_features: "Efficient • Transparent • Trusted",
    hero_cta_primary: "Start Service",
    hero_cta_secondary: "24/7 Support",
    hero_main_services: "Main Services",
    hero_services_desc: "Quick access to the most frequently used services",
    
    // Service Categories
    service_population: "Population Documents",
    service_population_desc: "ID Card, Family Card, Certificates",
    service_tax_payment: "Tax Payment",
    service_tax_desc: "Property Tax, Vehicle Tax",
    service_business_permit: "Business Permits",
    service_business_desc: "Business License, Trade Permit",
    service_support: "Help & Support",
    service_support_desc: "24/7 Call Center",
    service_health: "Health Services",
    service_health_desc: "Hospital, Clinic Info",
    
    // Trust Points
    trust_security: "Data Security",
    trust_security_desc: "Guaranteed",
    trust_speed: "Fast Process",
    trust_speed_desc: "< 15 minutes",
    trust_ease: "Easy to Use",
    trust_ease_desc: "User friendly",
    
    // Quick Access
    quick_access_badge: "Priority Services",
    quick_access_title: "Quick Access Digital Services",
    quick_access_desc: "Choose the service you need to get fast and efficient assistance",
    start_now: "Start Now",
    estimated_time: "Est.",
    completed_today: "today",
    services_completed: "Services Completed",
    average_response: "Average Response",
    satisfaction_rate: "Citizen Satisfaction",
    online_services: "Online Services",
    
    // Services by Persona
    persona_title: "You're a Citizen, We Help",
    persona_desc: "Services tailored to the specific needs of each community group",
    persona_student: "Student",
    persona_family: "Family",
    persona_elderly: "Elderly",
    persona_business: "Business Owner",
    
    // Student Services
    student_domicile: "Domicile Certificate",
    student_legalization: "Document Legalization",
    student_poor_certificate: "Poverty Certificate",
    student_scholarship: "Regional Scholarship",
    
    // Family Services
    family_birth_cert: "Birth Certificate",
    family_card: "Family Card",
    family_marriage: "Marriage Certificate",
    family_health: "Health Services",
    
    // Elderly Services
    elderly_social_aid: "Social Assistance",
    elderly_free_health: "Free Health Services",
    elderly_active_program: "Active Elderly Program",
    elderly_consultation: "Medical Consultation",
    
    // Business Services
    business_siup_tdp: "Business License & Trade Permit",
    business_permit: "Disturbance Permit",
    business_ads_permit: "Advertising Permit",
    business_tax: "Restaurant & Hotel Tax",
    
    // News Section
    news_title: "What's New in Medan City?",
    news_desc: "Stay updated with the latest news and important announcements from Medan City Government",
    news_tab: "📰 News",
    announcements_tab: "📢 Announcements",
    
    // Sample News
    news_scholarship_title: "Opening of Medan City Scholarship Program Registration 2025",
    news_scholarship_desc: "Medan City Government opens scholarship registration for outstanding students...",
    news_app_title: "Launch of Digital Public Service Mobile Application",
    news_app_desc: "New application makes it easier for citizens to access public services via smartphone...",
    news_festival_title: "Medan Cultural Festival 2025 Coming Soon",
    news_festival_desc: "Celebrate Medan's cultural diversity in a festive annual festival...",
    
    // Sample Announcements
    announce_holiday_title: "National Holiday Announcement for Eid al-Adha",
    announce_holiday_desc: "Public services will be closed on June 17, 2025...",
    announce_infrastructure_title: "Protocol Road Infrastructure Improvement",
    announce_infrastructure_desc: "Flyover construction and road widening will start next week...",
    announce_health_title: "Opening of New Health Facility in East Medan",
    announce_health_desc: "New health center ready to serve the community with modern facilities...",
    
    // Agenda Section
    agenda_title: "City Gov Agenda",
    agenda_desc: "Transparency of government activities to build public trust",
    view_all_agenda: "View All Agenda",
    agenda_meeting_title: "Infrastructure Development Coordination Meeting",
    agenda_dialog_title: "Regional Budget 2026 Public Dialog",
    agenda_smart_city_title: "Smart City Medan Program Launch",
    
    // Agenda Types
    meeting_type: "Meeting",
    public_dialog_type: "Public Dialog",
    public_event_type: "Public Event",
    
    // Agenda Participants
    officials_participants: "Department Heads & Mayor",
    public_officials_participants: "Public & Officials",
    all_citizens_participants: "All Citizens",
    
    // Transparency Section
    transparency_badge: "Public Transparency",
    transparency_title_1: "We Are",
    transparency_title_2: "Accountable",
    transparency_desc: "Transparency and accountability in every aspect of governance",
    transparency_features: "Trusted • Open • Accountable",
    
    // Transparency Widgets
    financial_report: "Financial Report",
    financial_desc: "Regional Budget 2025 and budget realization",
    budget_2025: "Budget 2025",
    budget_desc: "Development fund allocation",
    e_report: "e-REPORT",
    e_report_desc: "Citizen complaints and aspirations",
    open_data: "Open Data",
    open_data_desc: "Access to public data and statistics",
    
    // Transparency Labels
    total_budget: "Total Budget",
    development: "Development",
    reports_received: "Reports Received",
    datasets: "Datasets",
    progress: "Progress",
    
    // Portal
    portal_title: "Real-time Transparency Portal",
    portal_desc: "Access all government data and reports in one interactive dashboard",
    budget_distributed: "Budget Distributed",
    projects_completed: "Projects Completed",
    transparency_score: "Transparency Score",
    access_portal: "Access Transparency Portal",
    
    // Testimonials
    testimonials_title: "Citizen Testimonials and Aspirations",
    testimonials_desc: "Citizen voice is our priority. Here are their experiences with Medan City Government services",
    testimonials_cta_1: "Write Testimonial",
    testimonials_cta_2: "Share Aspiration",
    testimonials_question: "Want to share your experience?",
    
    // Priority and Category Labels
    priority_important: "Important",
    priority_info: "Info",
    category_education: "Education",
    category_technology: "Technology",
    category_culture: "Culture",
    popular_label: "Popular",
    
    // Footer Accessibility
    accessibility: "Accessibility",
    text_size: "Text Size",
    display_mode: "Display Mode",
    light: "Light",
    dark: "Dark",
    language: "Language",
    disability_support: "Disability Support",
    access_guide: "Access Guide",
    
    // Footer Links
    contact_us: "Contact Us",
    main_services: "Main Services",
    information: "Information",
    transparency: "Transparency",
    social_media: "Social Media",
    privacy_policy: "Privacy Policy",
    terms_conditions: "Terms & Conditions",
    sitemap: "Site Map",
    copyright: "2025 Medan City Government. All rights reserved."
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    // Check if language is stored in localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['id', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Default to Indonesian
      setLanguage('id');
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('language', language);
    
    // Set document language
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}