import { GraduationCap, Users, Heart, Briefcase } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

export function ServicesByPersona() {
  const { t } = useLanguage();

  const personas = [
    {
      icon: GraduationCap,
      title: t.persona_student,
      color: 'bg-primary/10 text-primary',
      services: [
        t.student_domicile,
        t.student_legalization,
        t.student_poor_certificate,
        t.student_scholarship
      ]
    },
    {
      icon: Users,
      title: t.persona_family,
      color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
      services: [
        t.family_birth_cert,
        t.family_card,
        t.family_marriage,
        t.family_health
      ]
    },
    {
      icon: Heart,
      title: t.persona_elderly,
      color: 'bg-primary/10 text-primary',
      services: [
        t.elderly_social_aid,
        t.elderly_free_health,
        t.elderly_active_program,
        t.elderly_consultation
      ]
    },
    {
      icon: Briefcase,
      title: t.persona_business,
      color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
      services: [
        t.business_siup_tdp,
        t.business_permit,
        t.business_ads_permit,
        t.business_tax
      ]
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl mb-4">{t.persona_title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.persona_desc}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${persona.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg">{persona.title}</h3>
                </div>
                
                <div className="space-y-3">
                  {persona.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer">
                      <span className="text-sm">{service}</span>
                      <Badge variant="secondary" className="text-xs">
                        →
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}