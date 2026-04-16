import { Calendar, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

export function NewsSection() {
  const { t } = useLanguage();

  const newsItems = [
    {
      title: t.news_scholarship_title,
      date: '5 Juni 2025',
      time: '10:30 WIB',
      summary: t.news_scholarship_desc,
      category: t.category_education
    },
    {
      title: t.news_app_title,
      date: '3 Juni 2025',
      time: '14:00 WIB',
      summary: t.news_app_desc,
      category: t.category_technology
    },
    {
      title: t.news_festival_title,
      date: '1 Juni 2025',
      time: '09:00 WIB',
      summary: t.news_festival_desc,
      category: t.category_culture
    }
  ];

  const announcements = [
    {
      title: t.announce_holiday_title,
      date: '7 Juni 2025',
      time: '08:00 WIB',
      summary: t.announce_holiday_desc,
      priority: t.priority_important
    },
    {
      title: t.announce_infrastructure_title,
      date: '4 Juni 2025',
      time: '07:00 WIB',
      summary: t.announce_infrastructure_desc,
      priority: t.priority_info
    },
    {
      title: t.announce_health_title,
      date: '2 Juni 2025',
      time: '11:00 WIB',
      summary: t.announce_health_desc,
      priority: t.priority_info
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl mb-4">{t.news_title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.news_desc}
          </p>
        </div>
        
        <Tabs defaultValue="news" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="news" className="text-sm">{t.news_tab}</TabsTrigger>
            <TabsTrigger value="announcements" className="text-sm">{t.announcements_tab}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="space-y-6">
            {newsItems.map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <h3 className="text-lg mb-2 hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground mb-3">{item.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="announcements" className="space-y-6">
            {announcements.map((item, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.priority === t.priority_important ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg mb-2 hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground mb-3">{item.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}