import { Link } from "react-router";
import kenyonMartinImg from "figma:asset/e67a258d5510d2db3a166498af2bea854be14def.png";
import daniloGallinariImg from "figma:asset/fe7d84f76a019371f04fbe8ee04027379dc29575.png";
import jamalMurrayImg from "figma:asset/ff2227f45b0c35ed60aa75a906e593f2a58a09f8.png";
import garyHarrisImg from "figma:asset/51195d822f2cbe4bc41b2da03d05f544885cd030.png";

export function Testimonials() {
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

        {/* NBA Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Kenyon Martin */}
          <div className="bg-[#1a1a1a] border border-[#9B7E3A]/20 p-8 flex flex-col">
            <p className="text-[#6b6b6b] text-base mb-6 leading-relaxed italic flex-grow">
              "If people don't know Steve Hess… his energy and enthusiasm daily… just being in the gym with him daily, that just lifted my spirits. Just being around him and just knowing, 'Alright, you're going to play again. You're going to be alright.' Just him telling me that consistently went a long way."
            </p>
            <div className="pt-6 border-t border-[#9B7E3A]/20">
              <div className="flex items-center gap-4">
                <img
                  src={kenyonMartinImg}
                  alt="Kenyon Martin"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-[#1a1a1a]"
                />
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
                <img
                  src={daniloGallinariImg}
                  alt="Danilo Gallinari"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-[#1a1a1a]"
                />
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
                <img
                  src={jamalMurrayImg}
                  alt="Jamal Murray"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-[#1a1a1a]"
                />
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
                <img
                  src={garyHarrisImg}
                  alt="Gary Harris"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 bg-[#1a1a1a]"
                />
                <div>
                  <div className="text-white mb-1">Gary Harris</div>
                  <div className="text-[#9B7E3A] text-sm">NBA Player</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-[#6b6b6b] mb-6">
            Join hundreds of successful clients who have achieved their goals
          </p>
          <Link
            to="/#pricing"
            className="inline-block px-8 py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300"
          >
            Start Your Transformation
          </Link>
        </div>
      </div>
    </section>
  );
}
