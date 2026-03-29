import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useInquiries } from "../contexts/InquiryContext";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
}

const emptyForm = {
  fullName: "",
  goals: "",
  email: "",
  phone: "",
};

export function InquiryModal({ isOpen, onClose, packageName }: InquiryModalProps) {
  const { addInquiry } = useInquiries();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState(emptyForm);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setConsent(false);
      setFormData(emptyForm);
      setSubmitError(null);
      setStepError(null);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setStepError(null);
    if (!formData.fullName.trim()) {
      setStepError("Please enter your full name.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStepError(null);
    setStep(1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleNext();
      return;
    }

    if (!formData.email.trim() || !formData.phone.trim()) {
      setSubmitError("Email and phone are required.");
      return;
    }
    if (!consent) {
      setSubmitError("Please agree to receive messages before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addInquiry({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.goals.trim() || "No specific goals provided.",
        interestedPackage: packageName || "Not specified",
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setFormData(emptyForm);
        setConsent(false);
        setStep(1);
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#2a2a2a] border border-[#9B7E3A]/30 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#9B9B9B] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12">
          {!isSubmitted ? (
            <>
              <div className="mb-8">
                {submitError && (
                  <p className="mb-4 text-sm text-red-400 border border-red-400/40 bg-red-950/40 px-4 py-3">
                    {submitError}
                  </p>
                )}
                <p className="text-[#9B7E3A] text-sm tracking-widest mb-2">Step {step} of 2</p>
                <h2 className="text-3xl md:text-4xl text-white mb-4">Schedule Your Consultation</h2>
                {packageName && (
                  <p className="text-[#9B7E3A] text-lg mb-2">
                    Interested in: <span className="font-medium">{packageName}</span>
                  </p>
                )}
                <p className="text-[#9B9B9B]">
                  {step === 1
                    ? "Tell us who you are and what you want to achieve."
                    : "How should we reach you?"}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {step === 1 && (
                  <>
                    {stepError && (
                      <p className="text-sm text-red-400 border border-red-400/40 bg-red-950/40 px-4 py-3">
                        {stepError}
                      </p>
                    )}
                    <div>
                      <label htmlFor="fullName" className="block text-white mb-2">
                        Full Name <span className="text-[#9B7E3A]">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="goals" className="block text-white mb-2">
                        Goals for working with Steve Hess{" "}
                        <span className="text-[#6b6b6b] text-sm">(Optional)</span>
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
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 font-medium"
                    >
                      Next
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
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
                        autoComplete="email"
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                        placeholder="john.doe@email.com"
                      />
                    </div>
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
                        autoComplete="tel"
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3a3a3a] text-white focus:border-[#9B7E3A] focus:outline-none transition-colors"
                        placeholder="(303) 555-0123"
                      />
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer text-left">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-[#3a3a3a] bg-[#1a1a1a] text-[#9B7E3A] focus:ring-[#9B7E3A]"
                      />
                      <span className="text-[#9B9B9B] text-sm leading-relaxed">
                        By submitting you agree to receive SMS or emails for the provided channel. Rates may be
                        applied
                      </span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 py-4 border border-[#9B7E3A]/50 text-[#9B7E3A] hover:bg-[#9B7E3A]/10 transition-all duration-300 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !consent}
                        className="w-full sm:flex-1 py-4 bg-[#9B7E3A] text-[#1a1a1a] hover:bg-[#B8963E] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#9B7E3A]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#9B7E3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl text-white mb-4">Thank You!</h3>
              <p className="text-[#9B9B9B]">
                Your inquiry has been submitted. We&apos;ll get back to you ASAP.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
