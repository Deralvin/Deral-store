import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signJWT, comparePassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT id, email, full_name, password_hash, role, is_active FROM admin_users WHERE email = $1 AND is_active = TRUE',
      [username]
    );

    const user = result.rows[0];
    if (!user || !comparePassword(password, user.password_hash)) {
      return NextResponse.json(
        { error: 'Kredensial tidak valid' },
        { status: 401 }
      );
    }

    const token = signJWT({ username: user.email, role: user.role });

    await query('UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);

    const response = NextResponse.json({
      success: true,
      user: { username: user.email, role: user.role },
      token,
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
