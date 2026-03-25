import { Target, Users, Heart } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import eliteExperienceBg from "figma:asset/2d23cb65b39158cb309149f4b1ca7fadd9330c1b.png";
import nbaTrainingImage from "figma:asset/facbf93db288538fa10cf0fcae9dc0aeb4038023.png";
import personalizedProgramsImage from "figma:asset/f5c283b2c1aae596e57738ec2043021942d2360b.png";
import matrxActivationImage from "figma:asset/4cf63f857fe2158b1f7b2b4cf72b05204354eede.png";

export function Features() {
  const features = [
    {
      title: "NBA-LEVEL TRAINING",
      description: "With 20+ years as an NBA strength coach for the Denver Nuggets, Steve Hess brings elite-level training methods to help you build strength, durability, and peak performance.",
      image: nbaTrainingImage
    },
    {
      title: "MATRX ACTIVATION",
      description: "MATrX is a muscle activation system that corrects imbalances, restores proper function, and enables your body to move efficiently while reducing pain and injury risk.",
      image: matrxActivationImage
    },
    {
      title: "PERSONALIZED PROGRAMS",
      description: "Goal-specific training programs fully customized to your needs, ensuring structured progression, accountability, and measurable results every step of the way.",
      image: personalizedProgramsImage
    }
  ];

  return (
    <section id="features" className="min-h-screen bg-[#1a1a1a]">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Large Hero Image */}
        <div className="relative min-h-[60vh] lg:min-h-screen">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758957646695-ec8bce3df462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBneW0lMjBpbnRlcmlvciUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzIyOTYyMjR8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Elite Training Facility"
            className="absolute inset-0 w-full h-full object-cover lg:block hidden"
          />
          <div className="absolute inset-0 bg-black/50 lg:block hidden" />
          
          {/* Centered Text */}
          <div 
            className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center"
            style={{
              backgroundImage: `url('${eliteExperienceBg}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/98 via-[#1a1a1a]/90 to-[#1a1a1a]/75" />
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-wide">
                THE ELITE<br />EXPERIENCE
              </h2>
              
              {/* Mobile Feature Cards - Inline */}
              <div className="lg:hidden space-y-8 mt-12 mb-12">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-xs tracking-widest text-[#9B7E3A] mb-3 uppercase">
                      {feature.title}
                    </h3>
                    <p className="text-[#9B9B9B] leading-relaxed text-sm px-4">
                      {feature.description}
                    </p>
                    {index < features.length - 1 && (
                      <div className="border-b border-[#3a3a3a] mt-8" />
                    )}
                  </div>
                ))}
              </div>
              
              <Link to="/about" className="mt-8 px-8 py-3 bg-[#9B7E3A] text-white text-sm tracking-widest uppercase hover:bg-[#9B7E3A]/80 transition-colors duration-300 border border-[#9B7E3A] inline-block">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Feature Cards (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-center py-12 lg:py-16 px-8 lg:px-16 bg-[#2a2a2a]">
          {features.map((feature, index) => (
            <div key={index}>
              <div className="py-12 lg:py-16 text-center">
                <h3 className="text-xs tracking-widest text-[#9B7E3A] mb-4 uppercase">
                  {feature.title}
                </h3>
                <p className="text-[#9B9B9B] leading-relaxed">
                  {feature.description}
                </p>
              </div>
              {index < features.length - 1 && (
                <div className="border-b border-[#3a3a3a]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}