import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { name, description, website_url, logo_url, is_active } = body;

    await query(`
      UPDATE brands
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        website_url = COALESCE($3, website_url),
        logo_url = COALESCE($4, logo_url),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6;
    `, [name, description, website_url, logo_url, is_active, id]);

    return NextResponse.json({ success: true, message: 'Brand updated successfully' });
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await query(`DELETE FROM brands WHERE id = $1;`, [id]);
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
