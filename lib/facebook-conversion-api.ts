/**
 * Facebook Conversion API utility
 * Sends server-side events to Facebook for better tracking accuracy
 */

import crypto from 'crypto';

interface FacebookConversionEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  user_data?: {
    em?: string[]; // Email (hashed)
    ph?: string[]; // Phone (hashed)
    fn?: string[]; // First name (hashed)
    ln?: string[]; // Last name (hashed)
    external_id?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    [key: string]: any;
  };
}

interface FacebookConversionAPIResponse {
  events_received?: number;
  messages?: Array<{
    id?: string;
    error?: {
      message: string;
      type: string;
      code: number;
    };
  }>;
  fbtrace_id?: string;
}

/**
 * Hash a value using SHA-256 (required by Facebook Conversion API)
 */
async function hashValue(value: string): Promise<string> {
  // Server-side only: use Node.js crypto
  // This function is only called from server-side code
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
}

/**
 * Send a conversion event to Facebook Conversion API
 */
export async function sendFacebookConversionEvent(
  pixelId: string,
  accessToken: string,
  event: FacebookConversionEvent,
  testEventCode?: string
): Promise<FacebookConversionAPIResponse | null> {
  if (!pixelId || !accessToken) {
    console.warn('Facebook Pixel ID or Access Token not configured');
    return null;
  }

  try {
    // Hash user data if provided
    const hashedUserData: FacebookConversionEvent['user_data'] = {};
    
    if (event.user_data) {
      if (event.user_data.em) {
        hashedUserData.em = await Promise.all(
          event.user_data.em.map((email) => hashValue(email))
        );
      }
      if (event.user_data.ph) {
        hashedUserData.ph = await Promise.all(
          event.user_data.ph.map((phone) => hashValue(phone))
        );
      }
      if (event.user_data.fn) {
        hashedUserData.fn = await Promise.all(
          event.user_data.fn.map((name) => hashValue(name))
        );
      }
      if (event.user_data.ln) {
        hashedUserData.ln = await Promise.all(
          event.user_data.ln.map((name) => hashValue(name))
        );
      }
      if (event.user_data.external_id) {
        hashedUserData.external_id = event.user_data.external_id;
      }
      if (event.user_data.client_ip_address) {
        hashedUserData.client_ip_address = event.user_data.client_ip_address;
      }
      if (event.user_data.client_user_agent) {
        hashedUserData.client_user_agent = event.user_data.client_user_agent;
      }
    }

    const payload = {
      data: [
        {
          ...event,
          user_data: Object.keys(hashedUserData).length > 0 ? hashedUserData : undefined,
        },
      ],
      ...(testEventCode && { test_event_code: testEventCode }),
    };

    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook Conversion API error:', errorText);
      return null;
    }

    const data: FacebookConversionAPIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending Facebook Conversion API event:', error);
    return null;
  }
}

/**
 * Send a Lead event to Facebook Conversion API
 */
export async function sendFacebookLeadEvent(
  pixelId: string,
  accessToken: string,
  leadData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    eventId?: string;
    eventSourceUrl?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    value?: number;
    currency?: string;
    contentName?: string;
    contentCategory?: string;
  },
  testEventCode?: string
): Promise<FacebookConversionAPIResponse | null> {
  const userData: FacebookConversionEvent['user_data'] = {};

  if (leadData.email) {
    userData.em = [leadData.email];
  }
  if (leadData.phone) {
    userData.ph = [leadData.phone];
  }
  if (leadData.firstName) {
    userData.fn = [leadData.firstName];
  }
  if (leadData.lastName) {
    userData.ln = [leadData.lastName];
  }
  if (leadData.clientIpAddress) {
    userData.client_ip_address = leadData.clientIpAddress;
  }
  if (leadData.clientUserAgent) {
    userData.client_user_agent = leadData.clientUserAgent;
  }

  const customData: FacebookConversionEvent['custom_data'] = {};
  if (leadData.value !== undefined) {
    customData.value = leadData.value;
  }
  if (leadData.currency) {
    customData.currency = leadData.currency;
  }
  if (leadData.contentName) {
    customData.content_name = leadData.contentName;
  }
  if (leadData.contentCategory) {
    customData.content_category = leadData.contentCategory;
  }

  const event: FacebookConversionEvent = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: leadData.eventId,
    event_source_url: leadData.eventSourceUrl,
    action_source: 'website',
    user_data: Object.keys(userData).length > 0 ? userData : undefined,
    custom_data: Object.keys(customData).length > 0 ? customData : undefined,
  };

  return sendFacebookConversionEvent(pixelId, accessToken, event, testEventCode);
}

