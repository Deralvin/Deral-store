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
    const { is_active, usage_limit, description, value } = body;

    await query(`
      UPDATE discounts
      SET 
        is_active = COALESCE($1, is_active),
        usage_limit = COALESCE($2, usage_limit),
        description = COALESCE($3, description),
        value = COALESCE($4, value),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5;
    `, [is_active, usage_limit, description, value, id]);

    return NextResponse.json({ success: true, message: 'Discount updated successfully' });
  } catch (error: any) {
    console.error('Error updating discount:', error);
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
    await query(`DELETE FROM discounts WHERE id = $1;`, [id]);
    return NextResponse.json({ success: true, message: 'Discount deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
