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
    const { stock } = body;

    const newStock = parseInt(stock, 10);
    if (isNaN(newStock) || newStock < 0) {
      return NextResponse.json({ success: false, error: 'Invalid stock value' }, { status: 400 });
    }

    // Update first variant's inventory for this product
    const variantRes = await query(`
      SELECT id FROM product_variants WHERE product_id = $1 LIMIT 1;
    `, [id]);

    if (variantRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product variant not found' }, { status: 404 });
    }

    const variantId = variantRes.rows[0].id;
    await query(`
      UPDATE inventory_levels 
      SET quantity_on_hand = $1, updated_at = CURRENT_TIMESTAMP
      WHERE variant_id = $2;
    `, [newStock, variantId]);

    return NextResponse.json({ success: true, message: 'Stock updated successfully' });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
