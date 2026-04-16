import { MessageCircle, Flag, ArrowUp, Headphones, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function FloatingButtons() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickActions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: () => console.log('WhatsApp clicked')
    },
    {
      icon: Flag,
      label: 'Lapor Masalah',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => console.log('Report clicked')
    },
    {
      icon: Headphones,
      label: 'Call Center',
      color: 'bg-primary hover:bg-primary/90',
      action: () => console.log('Call center clicked')
    }
  ];

  return (
    <>
      {/* Main Floating Action Button */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 shadow-2xl border-0 relative overflow-hidden group"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
          >
            {/* Ripple Effect */}
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={showQuickMenu ? 'close' : 'zap'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {showQuickMenu ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* Quick Action Menu */}
      <AnimatePresence>
        {showQuickMenu && (
          <motion.div 
            className="fixed bottom-24 right-6 z-40 flex flex-col gap-3"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                  onMouseEnter={() => setShowTooltip(action.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="lg"
                      className={`w-14 h-14 rounded-full ${action.color} shadow-lg transition-all duration-300 border-0`}
                      onClick={action.action}
                    >
                      <Icon className="w-6 h-6" />
                    </Button>
                  </motion.div>
                  
                  {/* Tooltip */}
                  <AnimatePresence>
                    {showTooltip === action.label && (
                      <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        className="absolute right-16 top-1/2 -translate-y-1/2"
                      >
                        <Card className="px-3 py-2 bg-black/80 dark:bg-black/90 text-white text-sm whitespace-nowrap border-0 shadow-xl">
                          {action.label}
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div 
            className="fixed bottom-6 left-6 z-50"
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                size="lg"
                variant="secondary"
                className="w-14 h-14 rounded-full shadow-2xl border-0 bg-card/80 backdrop-blur-lg relative overflow-hidden group"
                onClick={scrollToTop}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/20 to-emerald-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowUp className="w-6 h-6 relative z-10" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-emerald-600 z-50 origin-left"
        style={{ 
          scaleX: typeof window !== 'undefined' ? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) : 0 
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: typeof window !== 'undefined' ? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) : 0 }}
        transition={{ duration: 0.1 }}
      />
    </>
  );
}