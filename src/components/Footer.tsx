import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Youtube, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useTheme } from './ThemeProvider';
import { useLanguage } from './LanguageProvider';

// Unified Card Component with Dark Mode Support
const UnifiedCard = ({ 
  children, 
  className = "", 
  hover = true,
  variant = "default"
}: { 
  children: React.ReactNode, 
  className?: string,
  hover?: boolean,
  variant?: "default" | "stat" | "trust" | "service" | "footer"
}) => {
  const baseClasses = "bg-card dark:bg-card border border-border/50 rounded-2xl p-6 shadow-sm transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1" : "";
  
  // Variant-specific classes for consistent dimensions
  const variantClasses = {
    service: "min-h-[160px] flex flex-col",
    stat: "min-h-[160px] flex flex-col justify-center text-center",
    trust: "min-h-[80px] flex flex-col justify-center p-3",
    footer: "min-h-0 bg-card/50 dark:bg-card/30 border-border/30",
    default: ""
  };
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export function Footer() {
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large'>('normal');
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleFontSizeChange = (size: 'small' | 'normal' | 'large') => {
    setFontSize(size);
    const root = document.documentElement;
    
    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'normal':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
    }
    
    localStorage.setItem('fontSize', size);
  };

  const quickLinks = {
    id: [
      'KTP & Kartu Keluarga',
      'Izin Usaha', 
      'Pajak Daerah',
      'Pengaduan Online',
      'Layanan Kesehatan',
      'Pendidikan'
    ],
    en: [
      'ID Card & Family Card',
      'Business Permit',
      'Regional Tax', 
      'Online Complaints',
      'Health Services',
      'Education'
    ]
  };

  const informationLinks = {
    id: [
      'Berita Terkini',
      'Pengumuman',
      'Agenda Kegiatan',
      'Profil Medan',
      'Struktur Organisasi',
      'Sejarah Medan'
    ],
    en: [
      'Latest News',
      'Announcements', 
      'Event Agenda',
      'Medan Profile',
      'Organizational Structure',
      'Medan History'
    ]
  };

  const transparencyLinks = {
    id: [
      'Laporan Keuangan',
      'APBD 2025',
      'Data Terbuka',
      'e-LAPOR'
    ],
    en: [
      'Financial Report',
      'Regional Budget 2025',
      'Open Data',
      'e-Report'
    ]
  };

  return (
    <footer className="bg-muted dark:bg-muted border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t.contact_us}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground" />
                <div className="text-muted-foreground">
                  <p>Balai Kota Medan</p>
                  <p>Jl. Balai Kota No.1, Kesawan</p>
                  <p>Medan Barat, Kota Medan</p>
                  <p>Sumatera Utara 20111</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">(061) 4515000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">info@pemkotmedan.go.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">www.pemkotmedan.go.id</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t.main_services}</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks[language].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t.information}</h3>
            <ul className="space-y-2 text-sm">
              {informationLinks[language].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Transparency & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{t.transparency}</h3>
            <ul className="space-y-2 text-sm mb-6">
              {transparencyLinks[language].map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            
            <h4 className="text-sm font-medium mb-3 text-foreground">{t.social_media}</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-muted-foreground hover:bg-primary hover:text-primary-foreground">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-muted-foreground hover:bg-primary hover:text-primary-foreground">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-muted-foreground hover:bg-primary hover:text-primary-foreground">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-muted-foreground hover:bg-primary hover:text-primary-foreground">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-border mb-8" />
        
        {/* Accessibility Options */}
        <UnifiedCard variant="footer" className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{t.accessibility}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">{t.text_size}</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`text-xs border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    fontSize === 'small' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => handleFontSizeChange('small')}
                >
                  A-
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`text-sm border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    fontSize === 'normal' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => handleFontSizeChange('normal')}
                >
                  A
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`text-base border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    fontSize === 'large' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => handleFontSizeChange('large')}
                >
                  A+
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">{t.display_mode}</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    theme === 'light' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="w-4 h-4 mr-1" />
                  {t.light}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    theme === 'dark' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="w-4 h-4 mr-1" />
                  {t.dark}
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">{t.language}</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    language === 'id' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => setLanguage('id')}
                >
                  🇮🇩 ID
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary ${
                    language === 'en' ? 'bg-primary text-primary-foreground border-primary' : ''
                  }`}
                  onClick={() => setLanguage('en')}
                >
                  🇬🇧 EN
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">{t.disability_support}</h4>
              <Button size="sm" variant="outline" className="border-2 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                {t.access_guide}
              </Button>
            </div>
          </div>
        </UnifiedCard>
        
        {/* Copyright */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {t.copyright}</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-primary transition-colors">{t.privacy_policy}</a>
            <span>|</span>
            <a href="#" className="hover:text-primary transition-colors">{t.terms_conditions}</a>
            <span>|</span>
            <a href="#" className="hover:text-primary transition-colors">{t.sitemap}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}