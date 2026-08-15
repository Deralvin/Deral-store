import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyJWT } from '@/lib/auth';

function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya super admin yang dapat mengakses.' }, { status: 403 });
    }

    const result = await query(`
      SELECT id, email, full_name, role, is_active, last_login_at, created_at
      FROM admin_users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak. Hanya super admin yang dapat menambah admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { email, full_name, password, role = 'admin' } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan kata sandi wajib diisi' }, { status: 400 });
    }

    const password_hash = hashPassword(password);

    const result = await query(`
      INSERT INTO admin_users (email, full_name, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, email, full_name, role, is_active, created_at
    `, [email, full_name || null, password_hash, role]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
