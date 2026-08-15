import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const client = await pool.connect();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = 'Dibatalkan oleh Admin' } = body;

    await client.query('BEGIN');

    // 1. Fetch order and check current status
    const orderResult = await client.query(`
      SELECT id, order_number, status, payment_status, customer_id, total_amount
      FROM orders
      WHERE id = $1;
    `, [id]);

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const order = orderResult.rows[0];
    if (order.status === 'cancelled') {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Pesanan sudah dalam status dibatalkan' }, { status: 400 });
    }

    // 2. Fetch order items to restock
    const itemsResult = await client.query(`
      SELECT variant_id, quantity
      FROM order_items
      WHERE order_id = $1;
    `, [id]);

    const whResult = await client.query('SELECT id FROM warehouses LIMIT 1');
    const primaryWarehouseId = whResult.rows[0]?.id;

    // Restock each variant back into inventory_levels
    if (primaryWarehouseId) {
      for (const item of itemsResult.rows) {
        if (item.variant_id) {
          await client.query(`
            UPDATE inventory_levels
            SET 
              quantity_on_hand = quantity_on_hand + $1,
              updated_at = CURRENT_TIMESTAMP
            WHERE variant_id = $2 AND warehouse_id = $3;
          `, [parseInt(item.quantity, 10), item.variant_id, primaryWarehouseId]);
        }
      }
    }

    // 3. Update order status to 'cancelled'
    await client.query(`
      UPDATE orders
      SET 
        status = 'cancelled',
        internal_notes = CONCAT(COALESCE(internal_notes, ''), ' [Cancelled: ', $1::text, ']'),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `, [reason, id]);

    // 4. If order was paid, update customer total_spent
    if (order.customer_id && order.payment_status === 'paid') {
      await client.query(`
        UPDATE customers
        SET 
          total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE customer_id = $1 AND status != 'cancelled' AND payment_status = 'paid'),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
      `, [order.customer_id]);
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: `Pesanan ${order.order_number} berhasil dibatalkan dan stok produk telah dikembalikan ke gudang!`,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error cancelling order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
