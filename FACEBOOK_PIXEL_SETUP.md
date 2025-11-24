# Facebook Pixel & Conversion API Setup

This project integrates Facebook Pixel (client-side) and Facebook Conversion API (server-side) to track lead events when users submit the contact form.

## Features

- **Facebook Pixel**: Client-side tracking that fires when a form is submitted
- **Conversion API**: Server-side tracking for better accuracy and privacy compliance
- **Lead Event**: Automatically tracks "Lead" events when users complete the contact form

## Setup Instructions

### 1. Get Your Facebook Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel (or create a new one)
3. Copy your Pixel ID (it's a 15-16 digit number)

### 2. Get Your Facebook Access Token (for Conversion API)

1. In Facebook Events Manager, go to **Settings** → **Conversions API**
2. Click **Generate Access Token** or use an existing token
3. Copy the access token (keep it secure!)

### 3. Configure Environment Variables

Add the following to your `.env` file:

```env
# Facebook Pixel ID (public - safe to expose in client-side code)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here

# Facebook Conversion API Access Token (private - server-side only)
FACEBOOK_ACCESS_TOKEN=your_access_token_here
```

**Important:**
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` is prefixed with `NEXT_PUBLIC_` so it's available in client-side code
- `FACEBOOK_ACCESS_TOKEN` is NOT prefixed, so it's only available on the server
- Never commit your access token to version control

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your site and submit the contact form

3. Verify events in Facebook Events Manager:
   - Go to **Test Events** tab
   - You should see "Lead" events appearing in real-time

### 5. Optional: Test Event Code (for Testing)

If you want to use Facebook's test event code feature:

1. In Facebook Events Manager, go to **Test Events**
2. Copy your test event code
3. Add it to your `.env` file:
   ```env
   FACEBOOK_TEST_EVENT_CODE=your_test_event_code_here
   ```

Then update `app/actions/leads.ts` to pass the test event code to `sendFacebookLeadEvent()`.

## How It Works

### Client-Side (Facebook Pixel)

1. The `FacebookPixel` component is added to the root layout
2. When a user submits the contact form, `trackFacebookLead()` is called
3. This fires a "Lead" event to Facebook Pixel

### Server-Side (Conversion API)

1. When `createLead()` server action is called, it creates the lead in the database
2. After successful creation, it sends a "Lead" event to Facebook Conversion API
3. User data (email, phone, name) is hashed using SHA-256 before sending
4. The event includes:
   - User data (hashed email, phone, name)
   - Event metadata (timestamp, event ID, IP address, user agent)
   - Custom data (category, content name)

## Event Deduplication

Facebook automatically deduplicates events between Pixel and Conversion API using:
- Event ID (we use the lead ID)
- User data (hashed email/phone)
- Event time

This ensures each lead is only counted once, even if both events fire.

## Privacy & Compliance

- User data is hashed (SHA-256) before sending to Facebook
- Only necessary data is sent (email, phone, name, IP, user agent)
- The Conversion API helps maintain tracking accuracy even with ad blockers
- Complies with GDPR and privacy regulations when properly configured

## Troubleshooting

### Events not appearing in Facebook

1. **Check environment variables**: Make sure both `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` and `FACEBOOK_ACCESS_TOKEN` are set
2. **Check browser console**: Look for any JavaScript errors
3. **Check server logs**: Look for any errors in the server console
4. **Use Test Events**: Enable test events in Facebook Events Manager to see events in real-time
5. **Verify Pixel ID**: Make sure the Pixel ID is correct (15-16 digits)

### Conversion API errors

1. **Check access token**: Verify the token is valid and has the correct permissions
2. **Check server logs**: Look for error messages in the console
3. **Verify API version**: The code uses Facebook Graph API v21.0

## Files Modified

- `components/facebook-pixel.tsx` - Facebook Pixel component and tracking functions
- `lib/facebook-conversion-api.ts` - Conversion API utility functions
- `components/contact-form.tsx` - Added Pixel Lead event tracking
- `app/actions/leads.ts` - Added Conversion API Lead event tracking
- `app/layout.tsx` - Added Facebook Pixel component

## Additional Resources

- [Facebook Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Facebook Conversion API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Facebook Events Manager](https://business.facebook.com/events_manager2)

