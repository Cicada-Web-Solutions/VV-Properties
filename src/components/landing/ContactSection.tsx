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
      className="bg-[#CDE6F5]/20 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#0D0221]/65 uppercase">
            <span>CONTACT V.V PROPERTIES</span>
            <span className="h-px w-10 bg-[#0D0221]/20" aria-hidden="true" />
          </div>
          <AccentHeadline
            as="h2"
            text="Begin a Conversation with V.V Properties."
            accentWord="Conversation"
            className="mt-3 font-display text-3xl leading-[1.12] font-medium text-[#0D0221] sm:text-4xl lg:text-[44px]"
          />
          <p className="mt-3 text-base text-[#0D0221]/72">
            Connect with our team for residential and commercial property sales,
            land and plot transactions, investment guidance, and consultation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Contact Enquiry Form */}
          <div
            data-reveal
            className="rounded-2xl border border-[#0D0221]/10 bg-white p-6 shadow-sm sm:p-8 lg:col-span-7"
          >
            {submittedSuccess ? (
              <div className="flex flex-col items-start justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#49A078]/15 text-[#49A078]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-medium text-[#0D0221]">
                  Thank You for Your Enquiry
                </h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#0D0221]/75">
                  Your enquiry has been received by V.V Properties and saved
                  under{' '}
                  <strong className="font-semibold text-[#0D0221]">
                    Admin &rarr; Enquiries
                  </strong>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-6 rounded-lg border border-[#4062BB] px-5 py-2.5 text-sm font-medium text-[#4062BB] transition-colors hover:bg-[#4062BB] hover:text-white"
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
                      className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
                    >
                      Full Name <span className="text-[#F06543]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName)
                          setErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                      placeholder="Your full name"
                      className={cn(
                        'mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0D0221] placeholder:text-[#0D0221]/40 focus:outline-none focus:ring-2',
                        errors.fullName
                          ? 'border-[#F06543] focus:ring-[#F06543]/30'
                          : 'border-[#0D0221]/15 focus:border-[#4062BB] focus:ring-[#4062BB]/25'
                      )}
                    />
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs text-[#F06543]">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
                    >
                      Phone Number <span className="text-[#F06543]">*</span>
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
                        'mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0D0221] placeholder:text-[#0D0221]/40 focus:outline-none focus:ring-2',
                        errors.phone
                          ? 'border-[#F06543] focus:ring-[#F06543]/30'
                          : 'border-[#0D0221]/15 focus:border-[#4062BB] focus:ring-[#4062BB]/25'
                      )}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-[#F06543]">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
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
                        'mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#0D0221] placeholder:text-[#0D0221]/40 focus:outline-none focus:ring-2',
                        errors.email
                          ? 'border-[#F06543] focus:ring-[#F06543]/30'
                          : 'border-[#0D0221]/15 focus:border-[#4062BB] focus:ring-[#4062BB]/25'
                      )}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-[#F06543]">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-property"
                      className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
                    >
                      Property Interested In{' '}
                      <span className="text-[#F06543]">*</span>
                    </label>
                    <select
                      id="contact-property"
                      value={propertyId}
                      onChange={(e) => setUserPropertyChoice(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#0D0221]/15 bg-white px-4 py-3 text-sm text-[#0D0221] focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
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
                    className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase"
                  >
                    Message &amp; Preferences
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share preferred viewing dates, property requirements, or investment criteria..."
                    className="mt-2 w-full rounded-lg border border-[#0D0221]/15 bg-white px-4 py-3 text-sm text-[#0D0221] placeholder:text-[#0D0221]/40 focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#0D0221]/55">
                    We respond promptly during business hours (Mon – Sun, 9:00 AM
                    – 9:00 PM).
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#4062BB] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#0D0221] disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Google Maps Location Card + Business Contact Details */}
          <div data-reveal className="flex flex-col gap-6 lg:col-span-5">
            {/* Google Maps Embed Card */}
            <div className="overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-white shadow-sm">
              <div className="relative h-56 w-full bg-[#CDE6F5]/40">
                <iframe
                  title="V.V Properties — Gandhinagar, Saibaba Colony, Coimbatore"
                  src={SITE_CONFIG.contact.mapCoordinates.embedUrl}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#0D0221]/10 px-5 py-3 text-xs">
                <span className="font-medium text-[#0D0221]/75">
                  {SITE_CONFIG.contact.mapCoordinates.label}
                </span>
                <a
                  href={SITE_CONFIG.contact.mapCoordinates.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-[#4062BB] hover:underline"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Contact Info Box */}
            <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-medium text-[#0D0221]">
                  Direct Contact
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CDE6F5]/45 px-3 py-1 text-xs font-medium text-[#0D0221]">
                  <Star className="h-3.5 w-3.5 fill-[#4062BB] text-[#4062BB]" />
                  <span>{SITE_CONFIG.contact.rating.label}</span>
                </span>
              </div>
              <ul className="mt-5 space-y-3.5 text-sm">
                <li className="flex items-start gap-3 text-[#0D0221]/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#4062BB]" />
                  <div>
                    <p className="font-medium text-[#0D0221]">Office Address</p>
                    <p className="mt-0.5 text-[#0D0221]/70">
                      {SITE_CONFIG.contact.addressLine1},
                      <br />
                      {SITE_CONFIG.contact.addressLine2}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#4062BB]" />
                  <div>
                    <p className="font-medium text-[#0D0221]">
                      Primary Contact ({SITE_CONFIG.contact.primaryContactName})
                    </p>
                    <a
                      href={SITE_CONFIG.contact.phoneHref}
                      className="mt-0.5 inline-block text-[#4062BB] hover:underline"
                    >
                      {SITE_CONFIG.contact.phoneDisplay}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#4062BB]" />
                  <div>
                    <p className="font-medium text-[#0D0221]">Email</p>
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="mt-0.5 inline-block break-all text-[#4062BB] hover:underline"
                    >
                      {SITE_CONFIG.contact.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-[#0D0221]/80">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#4062BB]" />
                  <div>
                    <p className="font-medium text-[#0D0221]">Business Hours</p>
                    <p className="mt-0.5 text-[#0D0221]/70">
                      {SITE_CONFIG.contact.workingHours}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
