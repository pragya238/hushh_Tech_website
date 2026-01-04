// cloud-run/email-template-api/emails/SalesNotification.js
// Gmail-safe (no Tailwind/JS). Table-based + inline styles.
// Weekly Update template for Hushh Technologies

const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (val = "") =>
  String(val)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function SalesNotification(input = {}) {
  const d = input || {};

  // Palette (from Tailwind config)
  const C = {
    primary: "#0088cc",
    bgLight: "#f5f7f8",
    bgDark: "#0f1c23",
    cardDark: "#16252e",
    white: "#ffffff",
    black: "#0c171d",
    gray900: "#111827",
    gray800: "#1f2937",
    gray700: "#374151",
    gray600: "#4b5563",
    gray500: "#6b7280",
    gray400: "#9ca3af",
    gray300: "#d1d5db",
    gray200: "#e5e7eb",
    gray100: "#f3f4f6",
    borderLight: "#f3f4f6",
    borderDark: "#1f2a33"
  };

  // Content defaults
  const subject = escapeHtml(d.subject ?? "Hushh Technologies — Weekly Update");
  const previewText = escapeHtml(
    d.previewText ?? "Weekly Update — The Future of Investment Management"
  );

  const viewInBrowserUrl = escapeHtml(d.viewInBrowserUrl ?? "https://www.hushhtech.com/");
  const viewInBrowserText = escapeHtml(d.viewInBrowserText ?? "View in browser");

  const brandName = escapeHtml(d.brandName ?? "Hushh");
  const headerTag = escapeHtml(d.headerTag ?? "Weekly Update");

  // Hushh logo from Supabase storage
  const heroImageUrl = escapeHtml(
    d.heroImageUrl ??
      "https://ibsisfnjxeowvdtvgzff.supabase.co/storage/v1/object/public/assets/hushh-logo.png"
  );

  const badgeText = escapeHtml(d.badgeText ?? "AI-Driven Future");
  const heroTitle = escapeHtml(d.heroTitle ?? "The Future of Investment Management");
  const heroBody = escapeHtml(
    d.heroBody ??
      "Experience the precision of AI-driven portfolios tailored for your growth. Welcome to the new standard of wealth generation."
  );

  const whoTitle = escapeHtml(d.whoTitle ?? "Who we are");
  const whoBody = escapeHtml(
    d.whoBody ??
      "Hushh Technologies is a pioneering investment firm leveraging artificial intelligence to navigate complex markets. We bridge the gap between financial expertise and advanced machine learning, creating strategies that adapt in real-time to global economic shifts."
  );

  const inspTitle = escapeHtml(d.inspTitle ?? "Our Inspiration");
  const inspBody = escapeHtml(
    d.inspBody ??
      "We were inspired by the inefficiency of traditional models. The market moves faster than any human can analyze. Our inspiration stems from the desire to harness the raw speed and pattern-recognition capabilities of AI to democratize institutional-grade returns."
  );

  const valuesTitle = escapeHtml(d.valuesTitle ?? "Core Values");
  const coreValues = (Array.isArray(d.coreValues) && d.coreValues.length
    ? d.coreValues
    : [
        {
          iconLabel: "visibility",
          title: "Transparency",
          desc: "Clear insights into every decision our algorithms make."
        },
        {
          iconLabel: "psychology",
          title: "Innovation",
          desc: "Constant evolution of our models to stay ahead."
        },
        {
          iconLabel: "shield",
          title: "Security",
          desc: "Bank-grade encryption protecting your assets."
        }
      ]
  ).map((v) => ({
    title: escapeHtml(v.title ?? ""),
    desc: escapeHtml(v.desc ?? "")
  }));

  const approachTitle = escapeHtml(d.approachTitle ?? "Our Approach");
  const approachBody = escapeHtml(
    d.approachBody ??
      "We don't just predict; we react. Our proprietary algorithms analyze millions of data points per second—from market sentiment to geopolitical events. By removing emotional bias, we execute trades with mathematical precision, aiming for consistent growth regardless of market volatility."
  );

  const whyTitle = escapeHtml(d.whyTitle ?? "Why Hushh Technologies?");
  const whyBody = escapeHtml(
    d.whyBody ??
      "Because your future deserves the smartest tools available. Join a community of forward-thinking investors who trust data over speculation."
  );
  const whyButtonText = escapeHtml(d.whyButtonText ?? "Start Your Journey");
  const whyButtonUrl = escapeHtml(d.whyButtonUrl ?? "https://calendly.com/hushh");

  const ctaTitle = escapeHtml(d.ctaTitle ?? "Ready to take the next step?");
  const ctaBody = escapeHtml(
    d.ctaBody ??
      "Explore our advanced algorithms or connect directly with our investment team today."
  );
  const ctaLeftText = escapeHtml(d.ctaLeftText ?? "Learn More");
  const ctaLeftUrl = escapeHtml(d.ctaLeftUrl ?? "https://www.hushhtech.com/");
  const ctaRightText = escapeHtml(d.ctaRightText ?? "Connect Now");
  const ctaRightUrl = escapeHtml(d.ctaRightUrl ?? "https://calendly.com/hushh");

  const footerAddress = escapeHtml(
    d.footerAddress ?? "Hushh Technologies, 123 Innovation Drive, Tech City, TC 90210"
  );
  const footerReason = escapeHtml(
    d.footerReason ?? "You are receiving this email because you signed up for our newsletter."
  );
  const unsubscribeText = escapeHtml(d.unsubscribeText ?? "Unsubscribe");
  const unsubscribeUrl = escapeHtml(d.unsubscribeUrl ?? "#");
  const privacyText = escapeHtml(d.privacyText ?? "Privacy Policy");
  const privacyUrl = escapeHtml(d.privacyUrl ?? "https://www.hushhtech.com/");

  const social = (Array.isArray(d.social) && d.social.length
    ? d.social
    : [
        { label: "Website", url: "https://www.hushhtech.com/" },
        { label: "Email", url: "mailto:hello@hushh.ai" },
        { label: "Calendly", url: "https://calendly.com/hushh" }
      ]
  ).map((s) => ({ label: escapeHtml(s.label ?? ""), url: escapeHtml(s.url ?? "#") }));

  const socialIconsRow = social
    .slice(0, 3)
    .map(
      (s) => `
        <td align="center" style="padding:0 8px;">
          <a href="${s.url}" target="_blank" style="display:inline-block;text-decoration:none;color:${C.gray400};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:14px;">
            ●
          </a>
        </td>
      `
    )
    .join("");

  // Core values as 3 columns (email-safe)
  const valuesCols = coreValues
    .slice(0, 3)
    .map(
      (v) => `
        <td valign="top" align="center" style="padding:0 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding-bottom:10px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="48" height="48" style="width:48px;height:48px;border-radius:999px;background-color:rgba(0,136,204,0.10);">
                  <tr>
                    <td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:18px;color:${C.primary};font-weight:900;">
                      •
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:16px;color:${C.gray900};font-weight:800;padding-bottom:6px;">
                ${v.title}
              </td>
            </tr>
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:${C.gray500};">
                ${v.desc}
              </td>
            </tr>
          </table>
        </td>
      `
    )
    .join("");

  // Email HTML
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${C.bgLight};">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      ${previewText}
    </div>

    <!-- View in browser -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bgLight};">
      <tr>
        <td align="center" style="padding:14px 12px 10px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">
            <tr>
              <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray500};">
                <a href="${viewInBrowserUrl}" target="_blank" style="color:${C.gray500};text-decoration:underline;">${viewInBrowserText}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Card -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bgLight};">
      <tr>
        <td align="center" style="padding:0 12px 40px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background-color:${C.white};border-radius:12px;overflow:hidden;border:1px solid ${C.borderLight};box-shadow:0 14px 30px rgba(0,0,0,0.10);">
            
            <!-- Top bar -->
            <tr>
              <td style="padding:24px 24px 18px 24px;border-bottom:1px solid ${C.borderLight};background-color:${C.white};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="left" style="padding:0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td valign="middle" style="padding-right:10px;">
                            <img src="https://ibsisfnjxeowvdtvgzff.supabase.co/storage/v1/object/public/assets/hushh-logo.png" alt="Hushh" width="32" height="32" style="display:block;border:0;outline:none;text-decoration:none;width:32px;height:32px;border-radius:8px;" />
                          </td>
                          <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:22px;color:${C.gray900};font-weight:900;letter-spacing:-0.4px;">
                            ${brandName}<span style="color:${C.primary};">.</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray400};font-weight:600;">
                      ${headerTag}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero image -->
            <tr>
              <td style="padding:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="background-color:${C.primary};padding:40px 20px;">
                      <img src="${heroImageUrl}" alt="Hushh Technologies" width="120" style="display:block;border:0;outline:none;text-decoration:none;width:120px;height:auto;border-radius:20px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 32px 10px 32px;">
                <!-- Badge -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 14px auto;">
                  <tr>
                    <td style="background-color:rgba(0,136,204,0.10);color:${C.primary};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:8px 12px;border-radius:999px;">
                      ${badgeText}
                    </td>
                  </tr>
                </table>

                <!-- Title -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:36px;line-height:42px;color:${C.gray900};font-weight:900;letter-spacing:-0.8px;text-align:center;margin:0 0 12px 0;">
                  ${heroTitle}
                </div>

                <!-- Subtitle -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:28px;color:${C.gray600};text-align:center;margin:0 0 18px 0;">
                  ${heroBody}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr><td style="height:1px;background-color:${C.borderLight};line-height:1px;font-size:0;">&nbsp;</td></tr>
                </table>

                <div style="height:18px;line-height:18px;">&nbsp;</div>

                <!-- Who we are -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;letter-spacing:-0.2px;margin:0 0 8px 0;">
                  ${whoTitle}
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:${C.gray600};margin:0 0 18px 0;">
                  ${whoBody}
                </div>

                <!-- Inspiration block -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.gray100};border-radius:10px;border:1px solid ${C.borderLight};">
                  <tr>
                    <td style="padding:16px 16px 14px 16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="left" style="padding:0 0 6px 0;">
                            <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;color:${C.gray900};font-weight:800;">
                              ${inspTitle}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:${C.gray600};">
                            ${inspBody}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <div style="height:20px;line-height:20px;">&nbsp;</div>

                <!-- Core Values -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;letter-spacing:-0.2px;text-align:center;margin:0 0 14px 0;">
                  ${valuesTitle}
                </div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    ${valuesCols}
                  </tr>
                </table>

                <div style="height:20px;line-height:20px;">&nbsp;</div>

                <!-- Our Approach -->
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:800;letter-spacing:-0.2px;margin:0 0 8px 0;">
                  ${approachTitle}
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:${C.gray600};margin:0 0 16px 0;">
                  ${approachBody}
                </div>

                <!-- Why block (blue) -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.primary};border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:22px 18px;text-align:center;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:24px;color:#ffffff;font-weight:900;margin:0 0 10px 0;">
                        ${whyTitle}
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:rgba(255,255,255,0.90);margin:0 0 14px 0;max-width:360px;margin-left:auto;margin-right:auto;">
                        ${whyBody}
                      </div>
                      <a href="${whyButtonUrl}" target="_blank" style="display:inline-block;background-color:#ffffff;color:${C.primary};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:13px;font-weight:900;padding:12px 18px;border-radius:8px;">
                        ${whyButtonText}
                      </a>
                    </td>
                  </tr>
                </table>

                <div style="height:22px;line-height:22px;">&nbsp;</div>

                <!-- Bottom CTA -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid ${C.borderLight};">
                  <tr>
                    <td style="padding:18px 0 0 0;text-align:center;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;color:${C.gray900};font-weight:900;margin:0 0 8px 0;">
                        ${ctaTitle}
                      </div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:${C.gray500};margin:0 0 14px 0;max-width:420px;margin-left:auto;margin-right:auto;">
                        ${ctaBody}
                      </div>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr>
                          <td style="padding:0 6px 8px 6px;">
                            <a href="${ctaLeftUrl}" target="_blank" style="display:inline-block;height:48px;line-height:48px;padding:0 18px;border-radius:10px;border:2px solid rgba(0,136,204,0.20);color:${C.primary};text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;background-color:transparent;">
                              ${ctaLeftText}
                            </a>
                          </td>
                          <td style="padding:0 6px 8px 6px;">
                            <a href="${ctaRightUrl}" target="_blank" style="display:inline-block;height:48px;line-height:48px;padding:0 18px;border-radius:10px;background-color:${C.primary};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;box-shadow:0 10px 24px rgba(0,136,204,0.20);">
                              ${ctaRightText}
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer strip -->
            <tr>
              <td style="padding:20px 22px;background-color:${C.gray100};border-top:1px solid ${C.borderLight};text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 14px auto;">
                  <tr>
                    ${socialIconsRow}
                  </tr>
                </table>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray500};margin:0 0 8px 0;">
                  ${footerAddress}
                </div>
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray400};margin:0 0 10px 0;">
                  ${footerReason}
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:${C.gray500};font-weight:700;">
                  <a href="${unsubscribeUrl}" target="_blank" style="color:${C.gray500};text-decoration:underline;">${unsubscribeText}</a>
                  <span style="color:${C.gray300};padding:0 8px;">•</span>
                  <a href="${privacyUrl}" target="_blank" style="color:${C.gray500};text-decoration:underline;">${privacyText}</a>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${stripHtml(brandName)}. — ${stripHtml(headerTag)}`,
    "",
    stripHtml(heroTitle),
    stripHtml(heroBody),
    "",
    `${stripHtml(whoTitle)}\n${stripHtml(whoBody)}`,
    "",
    `${stripHtml(inspTitle)}\n${stripHtml(inspBody)}`,
    "",
    `${stripHtml(valuesTitle)}\n- ${coreValues.map((v) => `${stripHtml(v.title)}: ${stripHtml(v.desc)}`).join("\n- ")}`,
    "",
    `${stripHtml(approachTitle)}\n${stripHtml(approachBody)}`,
    "",
    `${stripHtml(whyTitle)}\n${stripHtml(whyBody)}\n${stripHtml(whyButtonText)}: ${stripHtml(whyButtonUrl)}`,
    "",
    `${stripHtml(ctaTitle)}\n${stripHtml(ctaBody)}\n${stripHtml(ctaLeftText)}: ${stripHtml(ctaLeftUrl)}\n${stripHtml(ctaRightText)}: ${stripHtml(ctaRightUrl)}`,
    "",
    stripHtml(footerAddress),
    stripHtml(footerReason),
    `${stripHtml(unsubscribeText)}: ${stripHtml(unsubscribeUrl)} | ${stripHtml(privacyText)}: ${stripHtml(privacyUrl)}`
  ].join("\n");

  return { subject, html, text };
}
