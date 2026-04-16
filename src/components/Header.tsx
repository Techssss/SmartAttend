import { Search, Menu, X, Bell, User, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { useLanguage } from './LanguageProvider';
import medanLogo from 'figma:asset/b19f3089870d86e0b580b378ba3c2f27bf1aeb4f.png';

const searchSuggestions = {
  id: ['KTP', 'Pajak', 'Izin Usaha', 'Akta', 'KK', 'Nikah', 'Bantuan', 'Laporan'],
  en: ['ID Card', 'Tax', 'Business Permit', 'Certificate', 'Family Card', 'Marriage', 'Assistance', 'Report']
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const navigationItems = [
    { name: t.home, href: '#', active: true },
    { 
      name: t.services, 
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: t.documents, href: '#' },
        { name: t.permits, href: '#' },
        { name: t.tax, href: '#' },
        { name: t.complaints, href: '#' }
      ]
    },
    { name: t.news, href: '#' },
    { name: t.data, href: '#' },
    { name: t.info, href: '#' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentSuggestions = searchSuggestions[language];
  const filteredSuggestions = currentSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 4);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm border-b' 
          : 'bg-background/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src={medanLogo} 
                alt="Logo Kota Medan" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold">Pemkot Medan</h1>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t.search_placeholder}
                className="pl-10 pr-4 h-9 bg-secondary/50 border-0 rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              
              <AnimatePresence>
                {showSuggestions && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-card rounded-lg shadow-lg border z-50"
                  >
                    <div className="py-1">
                      {filteredSuggestions.map((suggestion) => (
                        <div
                          key={suggestion}
                          className="px-3 py-2 hover:bg-secondary/50 cursor-pointer text-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a 
                  href={item.href} 
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    item.active 
                      ? 'text-primary bg-primary/10' 
                      : 'text-foreground hover:text-primary hover:bg-secondary/50'
                  }`}
                >
                  {item.name}
                  {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
                </a>
                
                {item.hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-card rounded-lg shadow-lg border z-50"
                      >
                        <div className="py-1">
                          {item.dropdownItems?.map((subItem) => (
                            <a 
                              key={subItem.name}
                              href={subItem.href} 
                              className="block px-3 py-2 text-sm hover:bg-secondary/50 transition-colors"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative w-8 h-8 p-0">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs bg-destructive">3</Badge>
            </Button>
            
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            
            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2 h-8"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            >
              <Globe className="w-4 h-4 mr-1" />
              <span className="text-xs">{language.toUpperCase()}</span>
            </Button>
            
            <Button size="sm" className="px-3 h-8 text-xs">
              {t.login}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {!isMenuOpen && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder={t.search_placeholder}
                className="pl-10 pr-4 h-9 bg-secondary/50 border-0 rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="lg:hidden pb-3"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white dark:bg-card rounded-lg p-3 mt-2 border shadow-sm">
                {/* Mobile Search */}
                <div className="mb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input 
                      placeholder={t.search_placeholder}
                      className="pl-10 pr-4 h-9 bg-secondary/50 border-0 rounded-lg text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Mobile Nav */}
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      <a 
                        href={item.href} 
                        className={`flex items-center justify-between py-2 px-2 rounded-lg text-sm transition-colors ${
                          item.active 
                            ? 'text-primary bg-primary/10' 
                            : 'text-foreground hover:bg-secondary/50'
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
                      </a>
                      
                      {item.hasDropdown && (
                        <div className="ml-3 mt-1 space-y-1">
                          {item.dropdownItems?.map((subItem) => (
                            <a
                              key={subItem.name}
                              href={subItem.href}
                              className="block py-1 px-2 rounded text-sm text-muted-foreground hover:text-foreground"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
                
                {/* Mobile Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {language === 'id' ? 'English' : 'Indonesia'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? <Moon className="w-3 h-3 mr-1" /> : <Sun className="w-3 h-3 mr-1" />}
                    {theme === 'light' ? t.dark : t.light}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="relative text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    Notif
                    <Badge className="absolute -top-1 -right-1 w-3 h-3 p-0 text-xs bg-destructive">3</Badge>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}