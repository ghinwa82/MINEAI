/**
 * Outbound transactional mail.
 *
 * Two transports, both over plain `fetch`, so no SMTP socket is needed in a
 * serverless function:
 *
 * - Resend REST API when `RESEND_API_KEY` is present.
 * - A generic JSON webhook when `AUTH_SMTP_URL` is present (an existing relay or
 *   automation endpoint that accepts `{ to, subject, text, html }`).
 *
 * When neither is configured the caller reports `delivered: false` and the auth
 * routes fall back to showing the one-time code on screen. The module never
 * pretends an email left the building.
 */

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailResult {
  delivered: boolean;
  channel: 'resend' | 'webhook' | 'none';
  error?: string;
}

function fromAddress(): string {
  const configured = process.env.AUTH_MAIL_FROM?.trim();
  if (configured) return configured;
  return 'MineAI <onboarding@resend.dev>';
}

export function mailChannel(): MailResult['channel'] {
  if (process.env.RESEND_API_KEY?.trim()) return 'resend';
  if (process.env.AUTH_SMTP_URL?.trim()) return 'webhook';
  return 'none';
}

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const channel = mailChannel();
  if (channel === 'none') return { delivered: false, channel, error: 'No mail transport configured' };

  try {
    if (channel === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress(),
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {}),
        }),
        cache: 'no-store',
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        return { delivered: false, channel, error: `Resend ${response.status}: ${detail.slice(0, 160)}` };
      }
      return { delivered: true, channel };
    }

    const response = await fetch(process.env.AUTH_SMTP_URL!.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AUTH_SMTP_TOKEN?.trim()
          ? { Authorization: `Bearer ${process.env.AUTH_SMTP_TOKEN.trim()}` }
          : {}),
      },
      body: JSON.stringify(message),
      cache: 'no-store',
    });
    if (!response.ok) {
      return { delivered: false, channel, error: `Relay ${response.status}` };
    }
    return { delivered: true, channel };
  } catch {
    return { delivered: false, channel, error: 'Mail transport is unreachable' };
  }
}

function shell(title: string, body: string, code?: string): string {
  return [
    '<div style="margin:0;padding:32px 16px;background:#07090e;font-family:Inter,Segoe UI,Arial,sans-serif">',
    '<div style="max-width:520px;margin:0 auto;background:#0e131f;border:1px solid rgba(212,175,55,0.28);border-radius:18px;padding:32px">',
    '<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#d4af37">MineAI</p>',
    `<h1 style="margin:0 0 16px;font-size:22px;color:#f8fafc">${title}</h1>`,
    `<p style="margin:0;font-size:14px;line-height:1.7;color:#cbd5e1">${body}</p>`,
    code
      ? `<p style="margin:24px 0 0;padding:16px;text-align:center;font-size:30px;letter-spacing:0.32em;font-weight:700;color:#f3d06b;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:12px">${code}</p>`
      : '',
    '<p style="margin:24px 0 0;font-size:11px;line-height:1.6;color:#64748b">This message is automated. If you did not request it, ignore it — no account change was made.</p>',
    '</div></div>',
  ].join('');
}

export async function sendVerificationCode(email: string, code: string): Promise<MailResult> {
  return sendMail({
    to: email,
    subject: `Your MineAI sign-in code: ${code}`,
    text: `Your MineAI verification code is ${code}. It expires in 30 minutes.`,
    html: shell(
      'Verify your email',
      'Enter this code to finish creating your MineAI account. It expires in 30 minutes.',
      code,
    ),
  });
}

export async function sendResetToken(email: string, token: string, link: string): Promise<MailResult> {
  return sendMail({
    to: email,
    subject: 'Reset your MineAI password',
    text: `Reset your MineAI password: ${link}\n\nOr paste this token: ${token}\n\nThe link expires in 30 minutes.`,
    html: shell(
      'Reset your password',
      `Open this link within 30 minutes: <a href="${link}" style="color:#06b6d4">${link}</a><br/>Or paste this token: <strong style="color:#f3d06b">${token}</strong>`,
    ),
  });
}
