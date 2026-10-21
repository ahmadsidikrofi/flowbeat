import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Nama depan, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    const user = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName,
      lastName: lastName || '',
      // Akun yang dibuat via backend API langsung verified tanpa email verification flow
      publicMetadata: { role: 'dokter' },
      skipPasswordChecks: false,
    });

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

    return NextResponse.json({
      success: true,
      userId: user.id,
      name: fullName,
      email: user.emailAddresses[0]?.emailAddress,
    });
  } catch (error) {
    console.error('[API /admin/create-doctor]', error);

    // Clerk error format: { errors: [{ message, longMessage, code }] }
    const clerkErrors = error?.errors || [];
    if (clerkErrors.length > 0) {
      const first = clerkErrors[0];
      const msg = first?.longMessage || first?.message || 'Gagal membuat akun dokter.';
      return NextResponse.json({ success: false, message: msg }, { status: 422 });
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
