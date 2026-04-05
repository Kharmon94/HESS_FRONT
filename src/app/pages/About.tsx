import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Target, Award, Users, Heart, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { InquiryModal } from "../components/InquiryModal";
import certificationsImage from "figma:asset/b982846dc19a45ce06ee607af8f83ba9bde4e4cf.png";
import steveHessImage from "figma:asset/0953f30d1d308783d9086a60ea52c35a32dbb428.png";
import aboutHeroImage from "figma:asset/c9bcdf06b5acaac8a162174925e2543b1ead7116.png";
import trainingImage1 from "figma:asset/69714e0e817cf8049a2861962bc9608845651976.png";
import trainingImage2 from "figma:asset/7f983bc4ec6a313da7c993d40461b8fdb5961d76.png";
import trainingImage3 from "figma:asset/678eb321d5d1006b11d3c0aeb7103b551bfc5a92.png";
import trainingImage4 from "figma:asset/0e6f949f1eadd1b0657596a8806fc79a3e57134f.png";
import trainingImage5 from "figma:asset/f7a2be7f2d86a8732a4db7114e133dd2564d09c5.png";
import trainingImage6 from "figma:asset/fe5733427b19fe54060d61a53212ec1d53805ce5.png";
import trainingImage7 from "figma:asset/db1c23da0e4f8339c84206665670112f6740703d.png";
import trainingImage8 from "figma:asset/9a044f9161ab7975aab64e0bb2342b86410ad7d1.png";
import trainingImage9 from "figma:asset/28eb5ff0e7e3a1027c827ad7b2128f19ace30c76.png";
import trainingImage10 from "figma:asset/bef52124c46529f4d2e97c10142d5116f24e4a31.png";

export function About() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allTrainingImages = [
    { src: trainingImage1, alt: "Elite training with NBA athletes" },
    { src: trainingImage2, alt: "Professional strength training session" },
    { src: trainingImage3, alt: "One-on-one elite coaching" },
    { src: trainingImage4, alt: "Battle rope training with NBA player" },
    { src: trainingImage5, alt: "Steve Hess with client at training facility" },
    { src: trainingImage6, alt: "Group training session with Steve" },
    { src: trainingImage7, alt: "Steve training NBA players on court" },
    { src: trainingImage8, alt: "Steve Hess with client at training facility" },
    { src: trainingImage9, alt: "Steve Hess with client at training facility" },
    { src: trainingImage10, alt: "Steve Hess with client at training facility" }
  ];

  // Filter out image 10 on mobile (index 9)
  const trainingImages = isMobile 
    ? allTrainingImages.filter((_, index) => index !== 9)
    : allTrainingImages;

  // Reset slide if current slide is beyond the filtered array
  useEffect(() => {
    if (currentSlide >= trainingImages.length) {
      setCurrentSlide(0);
    }
  }, [trainingImages.length, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trainingImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trainingImages.length) % trainingImages.length);
  };

  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every workout, every meal, every recovery session is designed with intentional purpose for your specific goals."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in training methodology, facility quality, and client service."
    },
    {
      icon: Users,
      title: "Community",
      description: "Join an exclusive network of driven individuals who share your commitment to peak performance."
    },
    {
      icon: Heart,
      title: "Holistic Approach",
      description: "True transformation encompasses physical training, nutrition, recovery, and mindset coaching."
    }
  ];

  const stats = [
    { number: "500+", label: "Client Transformations" },
    { number: "15+", label: "Years of Excellence" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={aboutHeroImage}
            alt="Luxury training facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a]/80 via-[#1a1a1a]/60 to-[#1a1a1a]"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl text-white mb-6">About Us</h1>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
                <span className="text-[#9B7E3A] tracking-widest text-sm">ABOUT STEVE HESS</span>
              </div>
              <div className="space-y-4 text-[#6b6b6b]">
                <p>
                  Steve Hess is the founder and driving force behind Hess Elite, bringing decades of elite performance experience to athletes and everyday individuals alike. Originally from South Africa, Steve moved to the United States for college with a bold vision — to build a life of purpose and achieve success at the highest level. Through resilience, hard work, and belief, he turned that vision into reality.
                </p>
                <p>
                  With more than 20 years as the strength and conditioning leader for the NBA's Denver Nuggets, Steve built a reputation for developing championship-level performance, discipline, and mindset. Today, through Hess Elite, he delivers that same professional standard to every client — combining science-based training with relentless motivation.
                </p>
                <p className="text-[#9B7E3A] italic">
                  KABOOM! Because at Hess Elite, limits are meant to be broken.
                </p>
              </div>
            </div>
            <div className="relative h-[604px]">
              <ImageWithFallback
                src={steveHessImage}
                alt="Steve Hess, founder and lead coach of Hess Elite"
                className="w-full h-full object-cover object-top border border-[#9B7E3A]/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative">
            {/* Slideshow Container */}
            <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-[#1a1a1a]">
              <img 
                src={trainingImages[currentSlide].src}
                alt={trainingImages[currentSlide].alt}
                className={`w-full h-full transition-opacity duration-500 ${
                  currentSlide === 1 || currentSlide === 4 || currentSlide === 7
                    ? 'object-contain' // Images 2, 5, 8 - always contain on all devices
                    : 'object-cover md:object-contain' // Images 1, 3, 4, 6, 7, 9, 10 - cover on mobile, contain on desktop
                }`}
              />
              
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#9B7E3A]/80 hover:bg-[#9B7E3A] text-white p-3 transition-all duration-300 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#9B7E3A]/80 hover:bg-[#9B7E3A] text-white p-3 transition-all duration-300 z-10"
                aria-label="Next image"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {trainingImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-[#9B7E3A] w-8' 
                      : 'bg-[#6b6b6b] hover:bg-[#9B7E3A]/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="text-center mt-4">
              <span className="text-[#6b6b6b] text-sm">
                {currentSlide + 1} / {trainingImages.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
              <span className="text-[#9B7E3A] tracking-widest text-sm">CERTIFICATIONS</span>
            </div>
            <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto">
              Industry-leading credentials and expertise
            </p>
          </div>

          <div className="flex justify-center items-center">
            <img 
              src={certificationsImage} 
              alt="Professional Certifications - RSCC*E, RTS, Best Master's in Sports Medicine Programs, MAT" 
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 relative">
            <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
              <span className="text-[#9B7E3A] tracking-widest text-sm">ELITE CREDENTIALS</span>
            </div>
            <p className="text-[#9B9B9B] text-xl max-w-3xl mx-auto">
              The only trainer in the world with this combination of elite certifications and credentials.
            </p>
            
            {/* Bouncing Arrow - Only visible on mobile when scrollable */}
            <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 animate-bounce">
              <ArrowRight className="w-6 h-6 text-[#9B7E3A]/60" />
            </div>
          </div>

          <div className="overflow-x-auto md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex md:grid md:grid-cols-2 gap-6 md:gap-12 min-w-max md:min-w-0">
              {[
                {
                  title: "NBA STRENGTH & CONDITIONING COACH",
                  description: "Over 20 years as Head Strength & Conditioning Coach for the Denver Nuggets, working directly with NBA championship-caliber athletes. Steve has trained some of the world's most elite basketball players, developing comprehensive programs that optimize strength, power, speed, agility, and injury prevention at the highest level of professional sports.",
                  highlights: [
                    "20+ years with NBA's Denver Nuggets",
                    "Championship-level program development",
                    "Elite athlete performance optimization",
                    "Advanced injury prevention protocols"
                  ]
                },
                {
                  title: "REGISTERED STRENGTH & CONDITIONING COACH – EMERITUS (RSCC*E)",
                  description:
                    "RSCC*E (Registered Strength and Conditioning Coach – Emeritus) is a prestigious designation from the National Strength and Conditioning Association recognizing veteran strength coaches who have demonstrated decades of high-level experience, leadership, and lasting impact in the field of strength and conditioning.",
                  highlights: [
                    "NSCA RSCC*E — emeritus recognition for veteran coaches",
                    "Decades of high-level strength & conditioning leadership",
                    "Lasting impact across athlete development",
                    "Gold-standard professional lineage (NSCA)"
                  ]
                },
                {
                  title: "PRECISION NUTRITION CERTIFIED",
                  description: "Advanced certification in nutrition science and behavior change coaching. This elite credential ensures clients receive evidence-based nutritional strategies tailored to their specific goals, whether it's body composition, performance enhancement, or long-term health optimization.",
                  highlights: [
                    "Level 1 & 2 Precision Nutrition certified",
                    "Behavior change coaching specialist",
                    "Customized nutrition protocols",
                    "Performance fueling strategies"
                  ]
                },
                {
                  title: "MUSCLE ACTIVATION TECHNIQUES (MAT) SPECIALIST",
                  description: "Certified in MAT, a revolutionary system that identifies and corrects muscle imbalances at the neuromuscular level. This advanced modality helps restore proper muscle function, eliminate compensation patterns, and reduce injury risk while maximizing performance potential.",
                  highlights: [
                    "MAT certified practitioner",
                    "Neuromuscular assessment expertise",
                    "Injury prevention specialist",
                    "Movement efficiency optimization"
                  ]
                },
                {
                  title: "RESISTANCE TRAINING SPECIALIST (RTS)",
                  description: "Advanced certification in resistance training methodologies, exercise biomechanics, and program design. This specialized credential emphasizes safe, effective, and scientifically-backed training techniques for building strength, muscle, and athleticism.",
                  highlights: [
                    "RTS certified professional",
                    "Biomechanics and movement analysis",
                    "Advanced programming strategies",
                    "Safe and effective progression models"
                  ]
                },
                {
                  title: "CONTINUING EDUCATION & RESEARCH",
                  description: "Ongoing commitment to staying at the cutting edge of sports science, performance training, and recovery methodologies. Steve regularly attends seminars, workshops, and conferences to ensure clients benefit from the latest research and innovations in the fitness industry.",
                  highlights: [
                    "Regular attendance at industry conferences",
                    "Collaboration with sports scientists",
                    "Implementation of latest research",
                    "Continuous skill and knowledge development"
                  ]
                }
              ].map((credential, index) => (
                <div key={index} className="border border-[#9B7E3A]/20 bg-[#1a1a1a] p-8 hover:border-[#9B7E3A]/40 transition-all duration-300 w-[85vw] md:w-auto flex-shrink-0">
                  <h3 className="text-sm tracking-widest text-[#9B7E3A] mb-4 uppercase">
                    {credential.title}
                  </h3>
                  <p className="text-[#9B9B9B] leading-relaxed mb-6">
                    {credential.description}
                  </p>
                  <ul className="space-y-2">
                    {credential.highlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-[#6b6b6b] flex items-start">
                        <span className="text-[#9B7E3A] mr-2">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-[#6b6b6b] mb-12">
            Join our exclusive community and experience the difference that true luxury fitness delivers
          </p>
          <button className="px-12 py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300" onClick={() => setIsModalOpen(true)}>
            Schedule Consultation
          </button>
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}