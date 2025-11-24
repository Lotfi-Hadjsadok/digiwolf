import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { detectLocale } from '@/lib/i18n';

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const preferredLocale = detectLocale(acceptLanguage);
  redirect(`/${preferredLocale}`);
}
