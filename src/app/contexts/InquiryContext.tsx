import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, type ApiInquiry } from "@/services/api";
import { useAuth } from "./AuthContext";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  interestedPackage: string;
  submittedDate: string;
  status: "new" | "contacted" | "closed";
}

interface InquiryContextType {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, "id" | "submittedDate" | "status">) => Promise<void>;
  updateInquiryStatus: (inquiryId: string, status: "new" | "contacted" | "closed") => void;
  inquiryUpdateError: string | null;
  clearInquiryUpdateError: () => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

function inquiryFromApi(i: ApiInquiry): Inquiry {
  const date = (i.created_at ?? "").split("T")[0];
  const st = i.status;
  const status: Inquiry["status"] =
    st === "contacted" || st === "closed" || st === "new" ? st : "new";
  return {
    id: i.id,
    name: i.name ?? "",
    email: i.email,
    phone: i.phone ?? "",
    message: i.message,
    interestedPackage: i.interested_package ?? "",
    submittedDate: date || new Date().toISOString().split("T")[0],
    status,
  };
}

export function InquiryProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryUpdateError, setInquiryUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      setInquiries([]);
      return;
    }
    let cancelled = false;
    api
      .listAdminInquiries()
      .then((res) => {
        if (cancelled) return;
        setInquiries(res.inquiries.map(inquiryFromApi));
      })
      .catch(() => {
        if (!cancelled) setInquiries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.role]);

  const addInquiry = async (inquiry: Omit<Inquiry, "id" | "submittedDate" | "status">) => {
    const { inquiry: created } = await api.createInquiry({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      interested_package: inquiry.interestedPackage,
    });
    const row = inquiryFromApi(created);
    setInquiries((prev) => {
      const rest = prev.filter((x) => x.id !== row.id);
      return [row, ...rest];
    });
  };

  const updateInquiryStatus = (inquiryId: string, status: "new" | "contacted" | "closed") => {
    setInquiryUpdateError(null);
    void api
      .updateAdminInquiry(inquiryId, { status })
      .then(({ inquiry }) => {
        setInquiries((prev) =>
          prev.map((x) => (x.id === inquiryId ? inquiryFromApi(inquiry) : x))
        );
      })
      .catch((err) => {
        setInquiryUpdateError(err instanceof Error ? err.message : "Could not update inquiry.");
      });
  };

  const clearInquiryUpdateError = () => setInquiryUpdateError(null);

  return (
    <InquiryContext.Provider
      value={{
        inquiries,
        addInquiry,
        updateInquiryStatus,
        inquiryUpdateError,
        clearInquiryUpdateError,
      }}
    >
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiries() {
  const context = useContext(InquiryContext);
  if (context === undefined) {
    throw new Error("useInquiries must be used within an InquiryProvider");
  }
  return context;
}
