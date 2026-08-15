import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(request: Request) {
  try {
    const authUser = getAuthUser(request as NextRequest);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = await query(`
      SELECT 
        id,
        code,
        description,
        discount_type,
        value,
        min_order_amount,
        max_discount_amount,
        usage_limit,
        usage_count,
        valid_from,
        valid_until,
        is_active,
        created_at
      FROM discounts
      ORDER BY created_at DESC;
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const {
      code,
      description,
      discount_type = 'percentage',
      value,
      min_order_amount = 0,
      max_discount_amount,
      usage_limit,
      valid_until,
    } = body;

    if (!code || value === undefined || value === null) {
      return NextResponse.json({ success: false, error: 'Kode voucher dan Nilai diskon wajib diisi' }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    const result = await query(`
      INSERT INTO discounts (
        code, description, discount_type, value, min_order_amount, 
        max_discount_amount, usage_limit, valid_from, valid_until, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, TRUE)
      RETURNING id, code;
    `, [
      cleanCode,
      description || null,
      discount_type,
      parseFloat(value),
      parseFloat(min_order_amount) || 0,
      max_discount_amount ? parseFloat(max_discount_amount) : null,
      usage_limit ? parseInt(usage_limit, 10) : null,
      valid_until || null,
    ]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
