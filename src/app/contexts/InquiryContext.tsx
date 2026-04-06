import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
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
  refetchInquiries: () => Promise<void>;
  inquiryUpdateError: string | null;
  clearInquiryUpdateError: () => void;
}

const InquiryContext = createContext<InquiryContextType | undefined>(undefined);

function inquiryFromApi(i: ApiInquiry): Inquiry {
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
    submittedDate: (i.created_at ?? "").trim() || new Date().toISOString(),
    status,
  };
}

export function InquiryProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryUpdateError, setInquiryUpdateError] = useState<string | null>(null);

  const fetchInquiries = useCallback(
    async (opts?: { reportError?: boolean }) => {
      const reportError = opts?.reportError ?? false;
      if (currentUser?.role !== "admin") {
        setInquiries([]);
        return;
      }
      try {
        const res = await api.listAdminInquiries();
        setInquiries(res.inquiries.map(inquiryFromApi));
        if (reportError) setInquiryUpdateError(null);
      } catch {
        setInquiries([]);
        if (reportError) setInquiryUpdateError("Could not load inquiries.");
      }
    },
    [currentUser?.id, currentUser?.role]
  );

  useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  const refetchInquiries = useCallback(async () => {
    await fetchInquiries({ reportError: true });
  }, [fetchInquiries]);

  const addInquiry = async (inquiry: Omit<Inquiry, "id" | "submittedDate" | "status">) => {
    const { inquiry: created } = await api.createInquiry({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      message: inquiry.message,
      interested_package: inquiry.interestedPackage,
    });
    if (currentUser?.role === "admin") {
      const row = inquiryFromApi(created);
      setInquiries((prev) => {
        const rest = prev.filter((x) => x.id !== row.id);
        return [row, ...rest];
      });
    }
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
        refetchInquiries,
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
