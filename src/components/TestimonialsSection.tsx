import { Star, Quote } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage } from './LanguageProvider';

const testimonials = [
  {
    name: 'Budi Santoso',
    role: 'Warga Medan Barat',
    rating: 5,
    comment: 'Saya ngurus izin usaha cuma 10 menit, mantap! Pelayanannya cepat dan petugas sangat membantu.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Siti Nurhaliza',
    role: 'Ibu Rumah Tangga',
    rating: 5,
    comment: 'Aplikasi e-LAPOR sangat membantu untuk melaporkan masalah di lingkungan. Respon cepat dan solusinya tepat.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6c7ad7c?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Ahmad Rahman',
    role: 'Pengusaha Lokal',
    rating: 4,
    comment: 'Proses perpanjangan SIUP sekarang lebih mudah online. Tidak perlu antri lama seperti dulu.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Maria Simbolon',
    role: 'Mahasiswa',
    rating: 5,
    comment: 'Pelayanan pembuatan KTP untuk mahasiswa sangat dipermudah. Terima kasih Pemkot Medan!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Ridho Tarigan',
    role: 'Pensiunan',
    rating: 5,
    comment: 'Program kesehatan gratis untuk lansia sangat membantu. Petugas ramah dan fasilitas lengkap.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Linda Wijaya',
    role: 'Pegawai Swasta',
    rating: 4,
    comment: 'Website baru lebih user-friendly dan informasinya lengkap. Mudah mencari layanan yang dibutuhkan.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'
  }
];

export function TestimonialsSection() {
  const { t } = useLanguage();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-primary/5 dark:to-primary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl mb-4">{t.testimonials_title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.testimonials_desc}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 bg-card">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/20" />
                <p className="text-sm text-muted-foreground italic pl-4">
                  "{testimonial.comment}"
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">{t.testimonials_question}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              {t.testimonials_cta_1}
            </button>
            <button className="px-6 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors">
              {t.testimonials_cta_2}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}