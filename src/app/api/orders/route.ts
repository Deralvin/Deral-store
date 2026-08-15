import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.fulfillment_status,
        o.currency,
        o.subtotal_amount,
        o.discount_amount,
        o.shipping_fee,
        o.tax_amount,
        o.total_amount,
        o.discount_code,
        o.shipping_address,
        o.created_at,
        c.first_name || ' ' || COALESCE(c.last_name, '') AS customer_name,
        c.email AS customer_email,
        (
          SELECT string_agg(oi.quantity || 'x ' || oi.product_name || ' (' || oi.variant_title || ')', ', ')
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) AS items_summary,
        (
          SELECT COALESCE(SUM(oi.quantity), 0)
          FROM order_items oi
          WHERE oi.order_id = o.id
        )::int AS items_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND o.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (o.order_number ILIKE $${params.length} OR c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR c.email ILIKE $${params.length})`;
    }

    sql += ` ORDER BY o.created_at DESC;`;

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
