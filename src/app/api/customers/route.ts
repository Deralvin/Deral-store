import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = await query(`
      SELECT 
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.phone,
        c.loyalty_tier,
        c.total_spent,
        c.orders_count,
        c.created_at,
        (
          SELECT a.city || ', ' || a.province 
          FROM customer_addresses a 
          WHERE a.customer_id = c.id 
          ORDER BY a.is_default_shipping DESC 
          LIMIT 1
        ) AS location
      FROM customers c
      ORDER BY c.total_spent DESC;
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
