import { useState } from "react";
import { X } from "lucide-react";
import { useInquiries } from "../contexts/InquiryContext";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
}

export function InquiryModal({ isOpen, onClose, packageName }: InquiryModalProps) {
  const { addInquiry } = useInquiries();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    goals: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addInquiry({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.goals || "No specific goals provided.",
        interestedPackage: packageName || "Not specified",
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          goals: "",
        });
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#2a2a2a] border border-[#9B7E3A]/30 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#9B9B9B] hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                {submitError && (
                  <p className="mb-4 text-sm text-red-400 border border-red-400/40 bg-red-950/40 px-4 py-3">
                    {submitError}
                  </p>
                )}
                <h2 className="text-3xl md:text-4xl text-white mb-4">
                  Schedule Your Consultation
                </h2>
                {packageName && (
                  <p className="text-[#9B7E3A] text-lg mb-2">
                    Interested in: <span className="font-medium">{packageName}</span>
                  </p>
                )}
                <p className="text-[#9B9B9B]">
                  Fill out the form below and we'll get back to you ASAP.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name & Last Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-white mb-2">
                      First Name <span className="text-[#9B7E3A]">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-white mb-2">
                      Last Name <span className="text-[#9B7E3A]">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white mb-2">
                    Email <span className="text-[#9B7E3A]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                    placeholder="john.doe@email.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-white mb-2">
                    Phone Number <span className="text-[#9B7E3A]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                    placeholder="(303) 555-0123"
                  />
                </div>

                {/* Goals */}
                <div>
                  <label htmlFor="goals" className="block text-white mb-2">
                    Goals for Training with Steve Hess <span className="text-[#6b6b6b] text-sm">(Optional)</span>
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your fitness goals, current challenges, or what you hope to achieve..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </button>
              </form>
            </>
          ) : (
            // Success Message
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#9B7E3A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#9B7E3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl text-white mb-4">Thank You!</h3>
              <p className="text-[#9B9B9B]">
                Your inquiry has been submitted. We'll get back to you ASAP.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}