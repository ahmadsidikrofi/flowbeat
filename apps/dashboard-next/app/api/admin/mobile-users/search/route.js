import { NextResponse } from 'next/server';

const MOBILE_API_BASE = process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || 'https://rpms.gilangramadhani.tech';
const SERVICE_KEY = process.env.NEXT_PUBLIC_SERVICE_KEY || '';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, message: 'phone is required' }, { status: 400 });
    }

    const res = await fetch(`${MOBILE_API_BASE}/api/profiles/search?phone=${encodeURIComponent(phone)}`, {
      headers: {
        'Accept': 'application/json',
        ...(SERVICE_KEY && { 'X-Service-Key': SERVICE_KEY }),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: err.detail || 'User tidak ditemukan' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('[API /admin/mobile-users/search]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
