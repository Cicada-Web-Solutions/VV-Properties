import type {
  ActivityLogEntry,
  Enquiry,
  EnquiryStatus,
  HeroSlide,
  Testimonial,
} from "@/types";

/**
 * -------------------------------------------------------------
 * V.V. PROPERTIES CLOUD SYNCHRONIZATION MODULE
 * -------------------------------------------------------------
 * Bridges client-side store state with authoritative Supabase Cloud
 * backend API routes with resilient fallback mechanisms.
 */

// -------------------------------------------------------------
// BANNERS SYNC
// -------------------------------------------------------------
export async function fetchBannersFromCloud(): Promise<HeroSlide[] | null> {
  try {
    const res = await fetch("/api/banners", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
        return data.banners.map((b: any, idx: number) => ({
          id: b.id || `slide-${idx + 1}`,
          headline: b.title || b.headline || "Curated Living",
          subtitle: b.subtitle || "",
          image: b.image_url || b.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
          ctaText: b.cta_text || b.ctaText || "Explore Portfolio",
          ctaLink: b.link_url || b.ctaLink || "#properties",
          active: b.is_active !== undefined ? b.is_active : (b.active !== undefined ? b.active : true),
          order: typeof b.display_order === "number" ? b.display_order : (idx + 1),
        }));
      }
    }
  } catch (err) {
    console.warn("[CloudSync] fetchBannersFromCloud error:", err);
  }
  return null;
}

export async function saveBannerToCloud(slide: HeroSlide): Promise<boolean> {
  try {
    const res = await fetch("/api/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        banner: {
          id: slide.id,
          title: slide.headline,
          subtitle: slide.supportingText || "",
          image_url: slide.image,
          link_url: slide.ctaLink,
          display_order: slide.order,
          is_active: slide.active,
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] saveBannerToCloud error:", err);
    return false;
  }
}

export async function deleteBannerFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/banners?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] deleteBannerFromCloud error:", err);
    return false;
  }
}

// -------------------------------------------------------------
// TESTIMONIALS SYNC
// -------------------------------------------------------------
export async function fetchTestimonialsFromCloud(): Promise<Testimonial[] | null> {
  try {
    const res = await fetch("/api/testimonials", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
        return data.testimonials.map((t: any, idx: number) => ({
          id: t.id || `test-${idx + 1}`,
          clientName: t.client_name || t.name || t.clientName || "Valued Client",
          locationOrProperty: t.location || t.locationOrProperty || "Luxury Property Buyer",
          reviewText: t.content || t.reviewText || t.quote || "",
          rating: typeof t.rating === "number" ? t.rating : (t.stars || 5),
          visible: t.is_visible !== undefined ? t.is_visible : true,
          photo: t.photo_url || t.photo || undefined,
          reviewUrl: t.reviewUrl || undefined,
          createdAt: t.created_at || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("[CloudSync] fetchTestimonialsFromCloud error:", err);
  }
  return null;
}

export async function saveTestimonialToCloud(test: Testimonial): Promise<boolean> {
  try {
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testimonial: {
          id: test.id,
          client_name: test.clientName,
          location: test.locationOrProperty,
          content: test.reviewText,
          rating: test.rating,
          photo_url: test.photo || null,
          is_visible: test.visible,
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] saveTestimonialToCloud error:", err);
    return false;
  }
}

export async function deleteTestimonialFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/testimonials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] deleteTestimonialFromCloud error:", err);
    return false;
  }
}

// -------------------------------------------------------------
// ENQUIRIES SYNC
// -------------------------------------------------------------
export async function fetchEnquiriesFromCloud(): Promise<Enquiry[] | null> {
  try {
    const res = await fetch("/api/inquiries", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        return data.inquiries.map((row: any) => {
          const statusStr = String(row.status || "").toLowerCase();
          const status: EnquiryStatus =
            statusStr === "contacted"
              ? "contacted"
              : statusStr === "closed"
                ? "closed"
                : statusStr === "reviewed"
                  ? "reviewed"
                  : "new";

          return {
            id: String(row.id),
            fullName: row.client_name || row.full_name || "Enquirer",
            phone: row.phone || "",
            email: row.email || "",
            propertyId: row.property_id || "",
            propertyTitle:
              row.properties?.title || row.property_title || "General Enquiry",
            message: row.message || "",
            status,
            createdAt: row.created_at || new Date().toISOString(),
          };
        });
      }
    }
  } catch (err) {
    console.warn("[CloudSync] fetchEnquiriesFromCloud error:", err);
  }
  return null;
}

export async function saveEnquiryToCloud(payload: {
  fullName: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  message?: string;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: payload.fullName,
        phone: payload.phone,
        email: payload.email || "",
        propertyId: payload.propertyId || null,
        message: payload.message || "Requested brochure details and a private consultation.",
        source: "Website Property Page",
        inquiryType: "general",
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] saveEnquiryToCloud error:", err);
    return false;
  }
}

export async function patchEnquiryStatusInCloud(
  id: string,
  status: EnquiryStatus
): Promise<boolean> {
  try {
    const dbStatus =
      status === "new"
        ? "New"
        : status === "contacted"
          ? "Contacted"
          : status === "closed"
            ? "Closed"
            : "None";

    const res = await fetch("/api/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: dbStatus }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] patchEnquiryStatusInCloud error:", err);
    return false;
  }
}

export async function deleteEnquiryFromCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/inquiries?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] deleteEnquiryFromCloud error:", err);
    return false;
  }
}

// -------------------------------------------------------------
// ACTIVITY LOGS SYNC
// -------------------------------------------------------------
export async function fetchActivityLogsFromCloud(): Promise<ActivityLogEntry[] | null> {
  try {
    const res = await fetch("/api/activity-logs", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        return data.logs.map((row: any) => {
          const timestamp = row.created_at
            ? new Date(row.created_at).getTime()
            : Date.now();

          return {
            id: String(row.id),
            timestamp,
            username: row.user_name || "Team Member",
            action: row.action || "Activity performed",
            module: row.entity_type || "General",
            formattedDateTime: new Date(timestamp).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          };
        });
      }
    }
  } catch (err) {
    console.warn("[CloudSync] fetchActivityLogsFromCloud error:", err);
  }
  return null;
}

export async function postActivityLogInCloud(
  action: string,
  moduleName = "General",
  actorName = "Team Member",
  role = "team_member"
): Promise<boolean> {
  try {
    const res = await fetch("/api/activity-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: actorName,
        role,
        action,
        module: moduleName,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[CloudSync] postActivityLogInCloud error:", err);
    return false;
  }
}
