import { ArrowRight, Shield, Clock, Users, Phone, FileText, CreditCard, Building, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from './LanguageProvider';

// Fixed Unified Card Component with Dark Mode Support
const UnifiedCard = ({ 
  children, 
  className = "", 
  hover = true,
  variant = "default"
}: { 
  children: React.ReactNode, 
  className?: string,
  hover?: boolean,
  variant?: "default" | "stat" | "trust" | "service"
}) => {
  const baseClasses = "bg-card dark:bg-card border border-border/50 rounded-2xl p-6 shadow-sm transition-all duration-300";
  const hoverClasses = hover ? "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1" : "";
  
  // Variant-specific classes for consistent dimensions
  const variantClasses = {
    service: "min-h-[160px] flex flex-col",
    stat: "min-h-[160px] flex flex-col justify-center text-center",
    trust: "min-h-[80px] flex flex-col justify-center p-3",
    default: ""
  };
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

export function HeroSection() {
  const { t } = useLanguage();

  const popularServices = [
    {
      icon: FileText,
      title: t.service_population,
      subtitle: t.service_population_desc,
      category: t.documents,
      popular: true
    },
    {
      icon: CreditCard,
      title: t.service_tax_payment,
      subtitle: t.service_tax_desc,
      category: t.tax,
      popular: true
    },
    {
      icon: Building,
      title: t.service_business_permit,
      subtitle: t.service_business_desc,
      category: t.permits,
      popular: false
    },
    {
      icon: Phone,
      title: t.service_support,
      subtitle: t.service_support_desc,
      category: t.services,
      popular: false
    }
  ];

  const compactStats = [
    { number: '1.2M+', label: 'Warga Terlayani', sublabel: 'Total pengguna' },
    { number: '95%', label: 'Tingkat Kepuasan', sublabel: 'Rating layanan' },
    { number: '24/7', label: 'Waktu Layanan', sublabel: 'Akses kapan saja' }
  ];

  const trustPoints = [
    { 
      icon: Shield, 
      label: t.trust_security, 
      desc: t.trust_security_desc
    },
    { 
      icon: Clock, 
      label: t.trust_speed, 
      desc: t.trust_speed_desc
    },
    { 
      icon: Zap, 
      label: t.trust_ease, 
      desc: t.trust_ease_desc
    }
  ];

  return (
    <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background pt-16">
      
      {/* Background Elements - More Subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-16 text-center">
          
          {/* Government Badge - Consistent with UnifiedCard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <UnifiedCard hover={false} className="inline-block px-6 py-3 min-h-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-primary font-medium text-sm">
                  {t.hero_badge}
                </span>
              </div>
            </UnifiedCard>
          </motion.div>

          {/* Headline - Better Typography */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6 mb-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              {t.hero_title_1}
              <br />
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                {t.hero_title_2}
              </span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {t.hero_description}
              <span className="block text-foreground font-medium mt-2">
                {t.hero_features}
              </span>
            </motion.p>
          </motion.div>

          {/* Professional CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {/* Primary CTA */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3.5 text-base font-semibold rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group">
                <FileText className="w-5 h-5 mr-2" />
                {t.hero_cta_primary}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            
            {/* Secondary CTA */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="lg" className="border-2 border-border hover:bg-secondary/50 px-8 py-3.5 text-base font-semibold rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                {t.hero_cta_secondary}
              </Button>
            </motion.div>
          </motion.div>

          {/* Service Cards - Improved Layout */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-5xl mb-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-2">{t.hero_main_services}</h3>
              <p className="text-sm text-muted-foreground">{t.hero_services_desc}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative cursor-pointer h-full"
                >
                  <UnifiedCard variant="service" className="relative h-full">
                    {service.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-1 font-medium z-10">
                        {t.popular_label}
                      </Badge>
                    )}
                    
                    {/* Icon - Fixed at top */}
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300 flex-shrink-0">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    {/* Content - Flexible space */}
                    <div className="flex-1 flex flex-col justify-between text-left">
                      <div>
                        <h4 className="font-semibold text-base text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                          {service.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {service.subtitle}
                        </p>
                      </div>
                      <div className="text-xs text-primary/70 font-medium">
                        {service.category}
                      </div>
                    </div>
                  </UnifiedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Cards - Consistent Height */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="w-full max-w-5xl space-y-8"
          >

            
            {/* Trust Cards - Horizontal Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trustPoints.map((item, index) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2
                  }}
                  className="group cursor-pointer"
                >
                  <UnifiedCard variant="trust" className="text-center">
                    <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mx-auto mb-1 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
                      <item.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-foreground group-hover:text-primary transition-colors mb-0.5">
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground opacity-70">
                        {item.desc}
                      </div>
                    </div>
                  </UnifiedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>



          {/* Subtle Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.7 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 border border-muted-foreground/30 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-2 bg-muted-foreground/50 rounded-full mt-1.5"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}