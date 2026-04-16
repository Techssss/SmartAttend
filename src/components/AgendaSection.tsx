import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from './LanguageProvider';

export function AgendaSection() {
  const { t } = useLanguage();

  const upcomingAgenda = [
    {
      title: t.agenda_meeting_title,
      date: '8 Juni 2025',
      time: '09:00 - 12:00 WIB',
      location: 'Balai Kota Medan',
      type: t.meeting_type,
      participants: t.officials_participants
    },
    {
      title: t.agenda_dialog_title,
      date: '10 Juni 2025',
      time: '14:00 - 17:00 WIB',
      location: 'Auditorium Pemkot',
      type: t.public_dialog_type,
      participants: t.public_officials_participants
    },
    {
      title: t.agenda_smart_city_title,
      date: '15 Juni 2025',
      time: '10:00 - 16:00 WIB',
      location: 'Lapangan Merdeka',
      type: t.public_event_type,
      participants: t.all_citizens_participants
    }
  ];

  return (
    <section className="py-16 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl mb-4">{t.agenda_title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.agenda_desc}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mini Calendar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg mb-2">Juni 2025</h3>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                    <div key={day} className="p-2 text-center text-muted-foreground">{day}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1;
                    const hasEvent = [8, 10, 15].includes(day);
                    const isToday = day === 7;
                    return (
                      <div
                        key={day}
                        className={`p-2 text-center rounded cursor-pointer hover:bg-primary/10 transition-colors ${
                          isToday ? 'bg-primary text-white' : 
                          hasEvent ? 'bg-primary/10 text-primary' : 
                          'hover:bg-secondary/50'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded"></div>
                    <span>Hari ini</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/10 rounded border"></div>
                    <span>Ada agenda</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Agenda List */}
          <div className="lg:col-span-2 space-y-4">
            {upcomingAgenda.map((agenda, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{agenda.type}</Badge>
                    </div>
                    <h3 className="text-lg mb-3">{agenda.title}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {agenda.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {agenda.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {agenda.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {agenda.participants}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="text-center pt-4">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                {t.view_all_agenda}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}