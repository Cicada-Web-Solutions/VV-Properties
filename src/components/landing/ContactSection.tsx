'use client';

import React, { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Send,
  Star,
} from 'lucide-react';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { SITE_CONFIG } from '@/config/site';
import { useVVStore } from '@/context/VVStoreContext';
import { useScrollReveal } from '@/hooks/useGsapReveal';
import { isValidEmail, isValidPhone } from '@/lib/format';
import { cn } from '@/lib/utils';

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  propertyId?: string;
}

export function ContactSection() {
  const { publishedProperties, submitEnquiry, notify } = useVVStore();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [userPropertyChoice, setUserPropertyChoice] = useState<string | null>(
    null
  );
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useScrollReveal(sectionRef, '[data-reveal]');

  const requestedProp = searchParams.get('property');
  const urlMatchedPropertyId = requestedProp
    ? publishedProperties.find(
        (p) => p.id === requestedProp || p.slug === requestedProp
      )?.id ?? null
    : null;
  const propertyId = userPropertyChoice ?? urlMatchedPropertyId ?? 'general';

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.';
    }
    if (!isValidPhone(phone)) {
      nextErrors.phone = 'Please enter a valid contact telephone number.';
    }
    if (email.trim() && !isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!propertyId) {
      nextErrors.propertyId = 'Please choose a property or General enquiry.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Silent honeypot spam check
    if (honeypot.trim() !== '') {
      setSubmittedSuccess(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    try {
      const selectedProp = publishedProperties.find((p) => p.id === propertyId);
      const propertyTitle =
        propertyId === 'general'
          ? 'General enquiry'
          : selectedProp?.title ?? 'Selected Property';

      await submitEnquiry({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        propertyId,
        propertyTitle,
        message: message.trim(),
      });

      setSubmittedSuccess(true);
      setFullName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setErrors({});
      notify(
        'Enquiry recorded',
        'success',
        'Visible immediately in Admin Dashboard -> Enquiries.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="bg-[#491F40] py-20 text-white lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Editorial Contact Details + Google Maps */}
          <div data-reveal className="flex flex-col gap-6 lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#E0C188] uppercase">
                <span>GET IN TOUCH</span>
                <span className="h-px w-10 bg-[#E0C188]/45" aria-hidden="true" />
              </div>
              <AccentHeadline
                as="h2"
                text="Let's Find the Right Property."
                accentWord="Property."
                accentClassName="text-[#E0C188]"
                className="mt-3.5 font-display text-[34px] leading-[1.12] font-semibold text-white sm:text-[42px] lg:text-[46px]"
              />
              <p className="mt-3.5 text-[15.5px] leading-[1.72] text-[#DBCCC6]/90">
                Connect with V.V Properties for residential and commercial
                property sales, land and plot transactions, investment guidance,
                and real estate consultation.
              </p>

              <div className="mt-5 inline-flex items-center gap-1.5 rounded-sm border border-[#E0C188]/30 bg-[#32132B]/70 px-3.5 py-1.5 text-xs font-medium text-[#E0C188]">
                <Star className="h-3.5 w-3.5 fill-[#CE8936] text-[#CE8936]" />
                <span>{SITE_CONFIG.contact.rating.label}</span>
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="rounded-md border border-[#E0C188]/20 bg-[#32132B]/55 p-6">
              <h3 className="font-display text-2xl font-semibold text-white">
                {SITE_CONFIG.brandName}
              </h3>
              <ul className="mt-4 space-y-3.5 text-sm text-[#DBCCC6]/92">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E0C188]" />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E0C188]/85 uppercase">
                      Office Address
                    </p>
                    <p className="mt-0.5 text-[#FAF6F4]/90">
                      {SITE_CONFIG.contact.addressLine1},{' '}
                      {SITE_CONFIG.contact.addressLine2}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E0C188]" />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E0C188]/85 uppercase">
                      Primary Contact ({SITE_CONFIG.contact.primaryContactName})
                    </p>
                    <a
                      href={SITE_CONFIG.contact.phoneHref}
                      className="mt-0.5 inline-block font-medium text-white transition-colors hover:text-[#E0C188]"
                    >
                      {SITE_CONFIG.contact.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#E0C188]" />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E0C188]/85 uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="mt-0.5 inline-block break-all font-medium text-white transition-colors hover:text-[#E0C188]"
                    >
                      {SITE_CONFIG.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#E0C188]" />
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[#E0C188]/85 uppercase">
                      Business Hours
                    </p>
                    <p className="mt-0.5 text-[#FAF6F4]/90">
                      {SITE_CONFIG.contact.workingHours}
                    </p>
                  </div>
                </li>
              </ul>

              {/* Direct Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-2.5">
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-all hover:brightness-105"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={SITE_CONFIG.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#E0C188]/45 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:border-[#E0C188] hover:bg-white/10"
                >
                  <span>WhatsApp</span>
                </a>
                <a
                  href={SITE_CONFIG.contact.mapCoordinates.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-[#E0C188]/45 px-4 py-2.5 text-xs font-semibold tracking-wider text-[#E0C188] uppercase transition-colors hover:border-[#E0C188] hover:bg-white/10"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Elevated Crisp White Enquiry Form Card (Compact, Zero Empty Gaps) */}
          <div
            data-reveal
            className="self-start rounded-md border border-[#DBCCC6]/40 bg-white p-6 text-[#491F40] shadow-[0_26px_60px_rgba(24,7,20,0.34)] sm:p-9 lg:col-span-7"
          >
            <div className="mb-6 border-b border-[#DBCCC6]/80 pb-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9A5F1D] uppercase">
                PROPERTY ENQUIRY
              </p>
              <h3 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                Request Property Details
              </h3>
            </div>

            {submittedSuccess ? (
              <div className="flex flex-col items-start justify-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#2F7D57]/12 text-[#2F7D57]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="mt-5 font-display text-3xl font-semibold text-[#491F40]">
                  Thank You for Your Enquiry
                </h4>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#491F40]/75">
                  Your enquiry has been received by V.V Properties and saved
                  under{' '}
                  <strong className="font-semibold text-[#491F40]">
                    Admin &rarr; Enquiries
                  </strong>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-6 rounded-sm border border-[#491F40] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-colors hover:bg-[#491F40] hover:text-white"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
              >
                {/* Honeypot anti-spam field */}
                <div hidden className="hidden" aria-hidden="true">
                  <label htmlFor="vv-company-url">Leave empty</label>
                  <input
                    id="vv-company-url"
                    name="companyUrl"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[11px] font-semibold tracking-[0.14em] text-[#491F40]/85 uppercase"
                    >
                      Full Name <span className="text-[#D6866B]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName)
                          setErrors((prev) => ({
                            ...prev,
                            fullName: undefined,
                          }));
                      }}
                      placeholder="Your full name"
                      className={cn(
                        'mt-1.5 w-full rounded-sm border bg-[#FAF6F4] px-4 py-3 text-sm text-[#491F40] placeholder:text-[#491F40]/40 focus:bg-white focus:outline-none focus:ring-2',
                        errors.fullName
                          ? 'border-[#D6866B] focus:ring-[#D6866B]/30'
                          : 'border-[#DBCCC6] focus:border-[#CE8936] focus:ring-[#CE8936]/25'
                      )}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs font-medium text-[#B95234]">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-[11px] font-semibold tracking-[0.14em] text-[#491F40]/85 uppercase"
                    >
                      Phone Number <span className="text-[#D6866B]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="+91 99948 89221"
                      className={cn(
                        'mt-1.5 w-full rounded-sm border bg-[#FAF6F4] px-4 py-3 text-sm text-[#491F40] placeholder:text-[#491F40]/40 focus:bg-white focus:outline-none focus:ring-2',
                        errors.phone
                          ? 'border-[#D6866B] focus:ring-[#D6866B]/30'
                          : 'border-[#DBCCC6] focus:border-[#CE8936] focus:ring-[#CE8936]/25'
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs font-medium text-[#B95234]">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] font-semibold tracking-[0.14em] text-[#491F40]/85 uppercase"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="name@example.com"
                      className={cn(
                        'mt-1.5 w-full rounded-sm border bg-[#FAF6F4] px-4 py-3 text-sm text-[#491F40] placeholder:text-[#491F40]/40 focus:bg-white focus:outline-none focus:ring-2',
                        errors.email
                          ? 'border-[#D6866B] focus:ring-[#D6866B]/30'
                          : 'border-[#DBCCC6] focus:border-[#CE8936] focus:ring-[#CE8936]/25'
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs font-medium text-[#B95234]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-property"
                      className="block text-[11px] font-semibold tracking-[0.14em] text-[#491F40]/85 uppercase"
                    >
                      Property Interested In{' '}
                      <span className="text-[#D6866B]">*</span>
                    </label>
                    <select
                      id="contact-property"
                      value={propertyId}
                      onChange={(e) => setUserPropertyChoice(e.target.value)}
                      className="mt-1.5 w-full rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] px-4 py-3 text-sm text-[#491F40] focus:border-[#CE8936] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE8936]/25"
                    >
                      <option value="general">General enquiry</option>
                      {publishedProperties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.title} — {prop.area}
                          {prop.availability === 'sold' ? ' (Sold)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-semibold tracking-[0.14em] text-[#491F40]/85 uppercase"
                  >
                    Message &amp; Preferences
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share preferred viewing dates, property requirements, or investment criteria..."
                    className="mt-1.5 w-full rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] px-4 py-3 text-sm text-[#491F40] placeholder:text-[#491F40]/40 focus:border-[#CE8936] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CE8936]/25"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#491F40]/62">
                    Open {SITE_CONFIG.contact.workingHours}.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-7 py-3.5 text-[13px] font-semibold tracking-wider text-[#491F40] uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Full-Width Panoramic Google Maps Location Bar */}
        <div
          data-reveal
          className="mt-12 overflow-hidden rounded-md border border-[#E0C188]/25 bg-[#32132B] shadow-lg"
        >
          <div className="relative h-64 w-full bg-[#32132B] sm:h-72">
            <iframe
              title="V.V Properties — Gandhinagar, Saibaba Colony, Coimbatore"
              src={SITE_CONFIG.contact.mapCoordinates.embedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E0C188]/20 px-5 py-3.5 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-[#DBCCC6]">
              <MapPin className="h-3.5 w-3.5 text-[#E0C188]" />
              <span>{SITE_CONFIG.contact.fullAddress}</span>
            </span>
            <a
              href={SITE_CONFIG.contact.mapCoordinates.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold tracking-wide text-[#E0C188] uppercase hover:underline"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
