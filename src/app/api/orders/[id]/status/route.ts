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
    const { status } = body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
    }

    await query(`
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `, [status, id]);

    return NextResponse.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
