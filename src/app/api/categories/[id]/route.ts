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
    const { name, parent_id, description, sort_order, is_active } = body;

    await query(`
      UPDATE categories
      SET 
        name = COALESCE($1, name),
        parent_id = $2,
        description = COALESCE($3, description),
        sort_order = COALESCE($4, sort_order),
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6;
    `, [name, parent_id === undefined ? null : parent_id, description, sort_order, is_active, id]);

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    console.error('Error updating category:', error);
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
    
    // Check if category has products
    const prodCount = await query(`SELECT COUNT(id) FROM products WHERE primary_category_id = $1 AND deleted_at IS NULL`, [id]);
    if (parseInt(prodCount.rows[0].count, 10) > 0) {
      return NextResponse.json({ success: false, error: 'Tidak dapat menghapus kategori yang masih memiliki produk aktif' }, { status: 400 });
    }

    await query(`DELETE FROM categories WHERE id = $1;`, [id]);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
