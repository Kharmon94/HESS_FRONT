import { useState } from "react";
import { InquiryModal } from "./InquiryModal";

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTakeNextSteps = () => {
    setIsModalOpen(true);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background YouTube Video */}
      <div className="absolute inset-0">
        <iframe
          className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
          src="https://www.youtube.com/embed/QmHg0BQjbQM?autoplay=1&mute=1&loop=1&playlist=QmHg0BQjbQM&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
          title="Background video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a]/95 via-[#1a1a1a]/80 to-[#1a1a1a]/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col justify-between min-h-screen pb-12 pt-24">
        
        {/* Center Text */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm tracking-widest text-white uppercase">Find your KABOOM</p>
        </div>
        
        {/* Call to Action */}
        <div className="mb-12">
          <button 
            onClick={handleTakeNextSteps}
            className="inline-block bg-[#9B7E3A] text-white text-sm tracking-widest uppercase hover:bg-[#9B7E3A]/80 transition-colors duration-300 border border-[#9B7E3A] px-[24px] py-[8px] m-[0px]"
          >
            Take the Next Steps
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="border-t border-[#9B7E3A]/30 pt-6">
            <div className="text-4xl md:text-5xl text-[#9B7E3A] mb-2">21</div>
            <div className="text-[#6b6b6b]">Years in NBA</div>
          </div>
          <div className="border-t border-[#9B7E3A]/30 pt-6">
            <div className="text-4xl md:text-5xl text-[#9B7E3A] mb-2">40</div>
            <div className="text-[#6b6b6b]">Years of Training</div>
          </div>
          <div className="border-t border-[#9B7E3A]/30 pt-6">
            <div className="text-4xl md:text-5xl text-[#9B7E3A] mb-2">2000+</div>
            <div className="text-[#6b6b6b]">Elite Members</div>
          </div>
        </div>
      </div>

      <InquiryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName="Elite Evaluation"
      />
    </section>
  );
}