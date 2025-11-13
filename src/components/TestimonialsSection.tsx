import { useEffect, useRef } from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import { Card } from '@/pages/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Rajesh Kumar',
    company: 'Kumar Steel & Cement',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    text: 'RitzYard has transformed our business with 50% increase in orders within just 3 months. The platform is easy to use and customer support is excellent.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format',
    verified: true
  },
  {
    name: 'Priya Sharma',
    company: 'Sharma Building Materials',
    location: 'Delhi NCR',
    rating: 5,
    text: 'Finally, a platform that understands supplier needs. The analytics dashboard helps me make informed decisions and the verification process builds trust with buyers.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&auto=format',
    verified: true
  },
  {
    name: 'Amit Patel',
    company: 'Patel Construction Supplies',
    location: 'Pune, Maharashtra',
    rating: 5,
    text: 'The automated inventory management has saved us countless hours. We can now focus on expanding our product range instead of paperwork.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format',
    verified: true
  },
  {
    name: 'Anjali Mehta',
    company: 'Mehta Hardware & Supplies',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    text: 'Amazing platform! Our reach has expanded to 10+ cities. The real-time order tracking and payment system makes business so much easier.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&auto=format',
    verified: true
  },
  {
    name: 'Suresh Reddy',
    company: 'Reddy Construction Materials',
    location: 'Hyderabad, Telangana',
    rating: 5,
    text: 'Best decision for our business! Customer inquiries have doubled and the platform handles everything smoothly. Highly recommended for all suppliers.',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&auto=format',
    verified: true
  },
  {
    name: 'Kavita Singh',
    company: 'Singh Timber & Wood Works',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    text: 'RitzYard helped us digitize our entire operations. The support team is responsive and the features are exactly what we needed for growth.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&auto=format',
    verified: true
  }
];

export const TestimonialsSection = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!testimonialsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.testimonial-card', {
        scrollTrigger: {
          trigger: testimonialsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, testimonialsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={testimonialsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-primary" />
            Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by <span className="text-primary">500+ Suppliers</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our suppliers say about their experience with RitzYard
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="testimonial-card p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    {testimonial.verified && (
                      <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                "{testimonial.text}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
