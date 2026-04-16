import { 
  CreditCard, 
  FileText, 
  Building, 
  MessageSquare, 
  Hospital, 
  ArrowRight,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

const colorVariants = {
  primary: {
    bg: 'bg-primary/5 dark:bg-primary/10',
    icon: 'text-primary',
    gradient: 'from-primary to-emerald-600',
    border: 'border-primary/20 dark:border-primary/30'
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600',
    gradient: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-200 dark:border-emerald-800'
  }
};

export function QuickAccess() {
  const { t } = useLanguage();

  const services = [
    {
      icon: CreditCard,
      title: t.service_population,
      description: t.service_population_desc + ', Birth & Death Certificate',
      href: '#',
      color: 'primary',
      popular: true,
      estimatedTime: '10 menit',
      completedToday: 156
    },
    {
      icon: FileText,
      title: t.service_tax_payment,
      description: t.service_tax_desc + ', Regional Tax',
      href: '#',
      color: 'emerald',
      popular: false,
      estimatedTime: '5 menit',
      completedToday: 89
    },
    {
      icon: Building,
      title: t.service_business_permit,
      description: t.service_business_desc + ', Disturbance Permit',
      href: '#',
      color: 'primary',
      popular: true,
      estimatedTime: '1 hari',
      completedToday: 23
    },
    {
      icon: MessageSquare,
      title: t.complaints,
      description: 'Reports, Complaints & Aspirations',
      href: '#',
      color: 'emerald',
      popular: false,
      estimatedTime: '24 jam',
      completedToday: 67
    },
    {
      icon: Hospital,
      title: t.service_health,
      description: t.service_health_desc,
      href: '#',
      color: 'primary',
      popular: false,
      estimatedTime: 'Realtime',
      completedToday: 234
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-lg rounded-full px-4 py-2 mb-6 border border-border/30 shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-foreground">{t.quick_access_badge}</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 font-bold text-foreground">
            {t.quick_access_title}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.quick_access_desc}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const colors = colorVariants[service.color as keyof typeof colorVariants];
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
                }}
                className="group cursor-pointer"
              >
                <Card className={`relative p-6 lg:p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-secondary/30`}>
                  {/* Popular Badge */}
                  {service.popular && (
                    <motion.div
                      className="absolute top-4 right-4"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Badge className="bg-primary text-primary-foreground border-0 text-xs px-2 py-1">
                        {t.popular_label}
                      </Badge>
                    </motion.div>
                  )}
                  
                  {/* Background Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <motion.div 
                    className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.6 }
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    <Icon className={`w-8 h-8 ${colors.icon} relative z-10 group-hover:scale-110 transition-transform duration-300`} />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <motion.h3 
                      className="text-lg font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {service.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-sm text-muted-foreground mb-6 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {service.description}
                    </motion.p>
                    
                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <motion.div 
                        className="flex items-center justify-between text-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{t.estimated_time} {service.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle className="w-3 h-3" />
                          <span>{service.completedToday} {t.completed_today}</span>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Action */}
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <motion.div
                        className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ x: 4 }}
                      >
                        <span>{t.start_now}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Summary Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            { icon: CheckCircle, value: "15,247", label: t.services_completed, subtext: "Bulan ini", color: "text-primary" },
            { icon: Clock, value: "2.3 menit", label: t.average_response, subtext: "Real-time", color: "text-emerald-500" },
            { icon: Users, value: "98.5%", label: t.satisfaction_rate, subtext: "Rating", color: "text-primary" },
            { icon: ArrowRight, value: "24/7", label: t.online_services, subtext: "Non-stop", color: "text-emerald-500" }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center p-6 bg-card/80 backdrop-blur-lg rounded-xl border border-border/30 hover:shadow-lg transition-all duration-300 group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                <div className={`w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-sm transition-shadow duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <motion.div 
                  className="text-xl lg:text-2xl mb-1 font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.7 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xs text-muted-foreground opacity-70">{stat.subtext}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}