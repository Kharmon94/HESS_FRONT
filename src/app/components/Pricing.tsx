import { Check } from "lucide-react";
import { useState } from "react";
import { InquiryModal } from "./InquiryModal";

export function Pricing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  const handleScheduleClick = (packageName: string) => {
    setSelectedPackage(packageName);
    setIsModalOpen(true);
  };

  const plans = [
    {
      name: "Elite Evaluation",
      price: "375",
      period: "one-time",
      description: "Perfect for those ready to take the first step",
      features: [
        "Comprehensive Performance Consultation",
        "Movement & Mobility Assessment",
        "Strength & Power Baseline Testing",
        "One High-Performance Training Session",
        "Immediate Coaching & Technique Feedback",
        "Personalized Performance Roadmap Overview",
        "Recommendation for Next Phase of Development",
        "Goal Planning"
      ],
      highlighted: false,
      isCallForPrice: false
    },
    {
      name: "Elite",
      price: "2,500",
      period: "10-pack",
      description: "Our most popular package for committed individuals",
      features: [
        "10 Private Sessions with Steve Hess",
        "MATrX Performance System Integration",
        "Full Performance Assessment & Baseline Testing",
        "Customized Training Plan",
        "Structured Progress Evaluations",
        "Body Composition & Performance Tracking",
        "Injury Prevention Programming",
        "Priority Scheduling",
        "Direct Coach Access Between Sessions"
      ],
      highlighted: true,
      isCallForPrice: false
    },
    {
      name: "VIP",
      price: null,
      period: "custom",
      description: "Fully customizable premium experience tailored to you",
      features: [
        "Ongoing Private Training Access",
        "Full Customizable Programming",
        "Customized Nutrition Blueprint",
        "Supplementation Integration",
        "Advanced Performance Tracking",
        "Monthly Full Reassessment",
        "Direct Coach Access",
        "Recovery & Mobility Programming",
        "Lifestyle & Habit Accountability",
        "Long-Term Performance Roadmap"
      ],
      highlighted: false,
      isCallForPrice: true,
      hasNotice: true,
      notice: "Limited Availability"
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-3 sm:px-5 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 border border-[#9B7E3A]/30 bg-[#9B7E3A]/5">
            <span className="text-[#9B7E3A] tracking-widest text-sm">PRICING</span>
          </div>
          <h2 className="text-4xl md:text-6xl text-white mb-6">
            Package Options
          </h2>
          <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto">
            Choose the perfect plan for your goals. All memberships include our satisfaction guarantee.
          </p>
        </div>

        {/* Pricing Cards: full-width column on mobile; 3-col from md up */}
        <div className="pt-6 md:pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-[#2a2a2a] border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-[#9B7E3A] p-6 shadow-2xl shadow-[#9B7E3A]/20 md:scale-105 md:p-8 md:pt-10"
                    : "border-[#9B7E3A]/10 p-6 hover:border-[#9B7E3A]/30 md:p-8"
                }`}
              >
                {plan.highlighted && (
                  <>
                    <div className="mb-4 text-center md:hidden">
                      <span className="inline-block bg-[#9B7E3A] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#1a1a1a]">
                        Most popular
                      </span>
                    </div>
                    <div className="absolute -top-4 left-1/2 z-10 hidden -translate-x-1/2 bg-[#9B7E3A] px-4 py-1 text-sm font-medium uppercase tracking-wider text-[#1a1a1a] md:block">
                      Most popular
                    </div>
                  </>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl text-white mb-2">{plan.name}</h3>
                  <p className="text-[#6b6b6b] text-sm mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    {plan.isCallForPrice ? (
                      <div>
                        <div className="text-[#9B7E3A] text-3xl mb-1">Call for Pricing</div>
                        <span className="text-[#6b6b6b] text-sm">Custom Package</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[#9B7E3A] text-5xl">${plan.price}</span>
                        <span className="text-[#6b6b6b]">/{plan.period}</span>
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#9B7E3A] flex-shrink-0 mt-0.5" />
                      <span className="text-[#6b6b6b]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleScheduleClick(plan.name)}
                  className={`w-full py-4 transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E]'
                      : 'border-2 border-[#9B7E3A] text-[#9B7E3A] hover:bg-[#9B7E3A]/10'
                  }`}
                >
                  Schedule Your Consultation
                </button>

                {plan.hasNotice && (
                  <div className="mt-6 text-center">
                    <p className="text-[#9B7E3A] text-sm tracking-wider border-t border-[#9B7E3A]/20 pt-4">
                      {plan.notice}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-[#6b6b6b]">
            All plans include our satisfaction guarantee. Flexible payment options available.
          </p>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageName={selectedPackage}
      />
    </section>
  );
}