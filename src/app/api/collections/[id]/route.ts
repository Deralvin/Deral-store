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
    const { name, description, banner_url, is_featured, is_active } = body;

    await query(`
      UPDATE collections
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        banner_url = COALESCE($3, banner_url),
        is_featured = COALESCE($4, is_featured),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6;
    `, [name, description, banner_url, is_featured, is_active, id]);

    return NextResponse.json({ success: true, message: 'Collection updated successfully' });
  } catch (error: any) {
    console.error('Error updating collection:', error);
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
    await query(`DELETE FROM collections WHERE id = $1;`, [id]);
    return NextResponse.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
