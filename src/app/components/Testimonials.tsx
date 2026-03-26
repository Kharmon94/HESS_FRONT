import { Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import jamalMurrayImg from "figma:asset/ff2227f45b0c35ed60aa75a906e593f2a58a09f8.png";
import daniloGallinariImg from "figma:asset/fe7d84f76a019371f04fbe8ee04027379dc29575.png";
import garyHarrisImg from "figma:asset/51195d822f2cbe4bc41b2da03d05f544885cd030.png";
import kenyonMartinImg from "figma:asset/e67a258d5510d2db3a166498af2bea854be14def.png";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "CEO, TechVentures",
      image: "https://images.unsplash.com/photo-1758518727888-ffa196002e59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc2dvbWFuJTIwZXhlY3V0aXZlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxNzgxNTk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      quote: "This program transformed not just my body, but my entire approach to performance and well-being. The personalized attention and world-class expertise are unmatched.",
      rating: 5
    },
    {
      name: "Marcus Chen",
      role: "Investment Banker",
      image: "https://images.unsplash.com/photo-1758599543154-76ec1c4257df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGV4ZWN1dGl2ZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTc5NDUwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      quote: "In my demanding career, I needed a program that could deliver results efficiently. The elite coaching and comprehensive approach exceeded all expectations.",
      rating: 5
    },
    {
      name: "Jennifer Rodriguez",
      role: "Entrepreneur",
      image: "https://images.unsplash.com/photo-1758875569071-717cfaa97c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHdvbWFuJTIwZml0bmVzcyUyMHN0cm9uZ3xlbnwxfHx8fDE3NzE4MDE5NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      quote: "I've tried countless programs, but nothing compares to this level of customization and support. The results speak for themselves - I'm stronger and more energized than ever.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-32 bg-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mx-[0px] mt-[-50px] mb-[40px]">
          <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
            <span className="text-[#9B7E3A] tracking-widest text-sm">NBA TESTIMONIALS</span>
          </div>
          
          <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto">
            See how Steve Hess impacted the best elites in the world
          </p>
        </div>

        {/* Featured Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Kenyon Martin */}
          <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col">
            <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
              "If people don't know Steve Hess… his energy and enthusiasm daily… just being in the gym with him daily, that just lifted my spirits. Just being around him and just knowing, 'Alright, you're going to play again. You're going to be alright.' Just him telling me that consistently went a long way."
            </p>
            <div className="pt-6 border-t border-[#9B7E3A]/20">
              <div className="flex items-center gap-4">
                <img src={kenyonMartinImg} alt="Kenyon Martin" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-white mb-1">Kenyon Martin</div>
                  <div className="text-[#9B7E3A] text-sm">NBA Veteran</div>
                </div>
              </div>
            </div>
          </div>

          {/* Danilo Gallinari */}
          <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col">
            <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
              "Behind every result, there are people who make it possible. Steve Hess — Denver's legendary strength coach — is one of them. A man who built champions with energy, passion, and heart. Respect to those who work in the shadows, but make the light shine."
            </p>
            <div className="pt-6 border-t border-[#9B7E3A]/20">
              <div className="flex items-center gap-4">
                <img src={daniloGallinariImg} alt="Danilo Gallinari" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-white mb-1">Danilo Gallinari</div>
                  <div className="text-[#9B7E3A] text-sm">NBA Veteran</div>
                </div>
              </div>
            </div>
          </div>

          {/* Jamal Murray */}
          <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col">
            <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
              "It was a lot of fun being around him every day and having his energy influence my mornings... You definitely feel it in your thighs and lungs… but you can't quit on him."
            </p>
            <div className="pt-6 border-t border-[#9B7E3A]/20">
              <div className="flex items-center gap-4">
                <img src={jamalMurrayImg} alt="Jamal Murray" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-white mb-1">Jamal Murray</div>
                  <div className="text-[#9B7E3A] text-sm">NBA All Star</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gary Harris */}
          <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col">
            <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
              "He just figures out different ways for you to have fun and get your work in."
            </p>
            <div className="pt-6 border-t border-[#9B7E3A]/20">
              <div className="flex items-center gap-4">
                <img src={garyHarrisImg} alt="Gary Harris" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <div className="text-white mb-1">Gary Harris</div>
                  <div className="text-[#9B7E3A] text-sm">NBA Player</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member testimonials */}
        <div className="mb-4 text-center">
          <h3 className="text-2xl md:text-3xl text-white mb-2 tracking-wide">What our members say</h3>
          <p className="text-[#6b6b6b] text-sm max-w-xl mx-auto">
            Elite training experiences from clients across industries
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#9B7E3A] text-[#9B7E3A]" />
                ))}
              </div>
              <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="pt-6 border-t border-[#9B7E3A]/20">
                <div className="flex items-center gap-4">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="text-white mb-1">{testimonial.name}</div>
                    <div className="text-[#9B7E3A] text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-[#6b6b6b] mb-6">
            Join hundreds of successful clients who have achieved their goals
          </p>
          <a
            href="#pricing"
            className="inline-block px-8 py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300"
          >
            Start Your Transformation
          </a>
        </div>
      </div>
    </section>
  );
}