import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyJWT } from '@/lib/auth';

function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
    }

    const result = await query(`
      SELECT id, email, full_name, role, is_active, last_login_at, created_at
      FROM admin_users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { full_name, role, is_active, password } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }
    if (password) {
      updates.push(`password_hash = $${paramCount}`);
      values.push(hashPassword(password));
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data yang diubah' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(`
      UPDATE admin_users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, role, is_active, last_login_at, created_at
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Akses ditolak' }, { status: 403 });
    }

    const result = await query(`
      DELETE FROM admin_users
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
