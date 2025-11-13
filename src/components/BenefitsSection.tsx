import { useEffect, useRef } from 'react';
import { TrendingUp, Clock, BarChart3, Headphones } from 'lucide-react';
import { Card } from '@/pages/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    icon: TrendingUp,
    title: 'Increase Revenue',
    description: 'Reach 10,000+ verified buyers and boost your monthly sales by up to 40%',
    stat: '+40%',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Automated order management reduces processing time from hours to minutes',
    stat: '85%',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BarChart3,
    title: 'Business Insights',
    description: 'Advanced analytics help you understand demand patterns and optimize inventory',
    stat: '24/7',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Get expert assistance from our team whenever you need help growing',
    stat: '100%',
    color: 'from-orange-500 to-red-500'
  }
];

export const BenefitsSection = () => {
  const benefitsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!benefitsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.benefit-card', {
        scrollTrigger: {
          trigger: benefitsRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, benefitsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={benefitsRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            Benefits
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">RitzYard</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of suppliers who are growing their business with our platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="benefit-card relative p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7" />
                </div>
                
                <div className={`text-3xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                  {benefit.stat}
                </div>
                
                <h3 className="text-lg font-bold text-foreground">
                  {benefit.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
