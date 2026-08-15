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
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.sort_order,
        c.is_active,
        c.created_at,
        p.name AS parent_name,
        COUNT(prod.id)::int AS products_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products prod ON prod.primary_category_id = c.id AND prod.deleted_at IS NULL
      GROUP BY c.id, p.name
      ORDER BY c.sort_order ASC, c.name ASC;
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
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
    const { name, parent_id, description, sort_order = 0 } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const result = await query(`
      INSERT INTO categories (name, slug, parent_id, description, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, name, slug;
    `, [name, slug, parent_id || null, description || null, parseInt(sort_order, 10) || 0]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
