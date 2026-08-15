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
    const { payment_status = 'paid' } = body;

    const validStatuses = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(payment_status)) {
      return NextResponse.json({ success: false, error: 'Status pembayaran tidak valid' }, { status: 400 });
    }

    // Update order payment status
    const result = await query(`
      UPDATE orders
      SET 
        payment_status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, order_number, total_amount, customer_id;
    `, [payment_status, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const order = result.rows[0];

    // If marked as paid and has customer_id, ensure customer total_spent is accurate
    if (payment_status === 'paid' && order.customer_id) {
      await query(`
        UPDATE customers
        SET 
          total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = $1 AND payment_status = 'paid'),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
      `, [order.customer_id]);
    }

    return NextResponse.json({
      success: true,
      message: `Status pembayaran pesanan ${order.order_number} berhasil diubah menjadi ${payment_status.toUpperCase()}`,
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
