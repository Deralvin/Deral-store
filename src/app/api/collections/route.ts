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
        col.id,
        col.name,
        col.slug,
        col.description,
        col.banner_url,
        col.start_date,
        col.end_date,
        col.is_featured,
        col.is_active,
        col.created_at,
        COUNT(pc.product_id)::int AS products_count
      FROM collections col
      LEFT JOIN product_collections pc ON pc.collection_id = col.id
      GROUP BY col.id
      ORDER BY col.created_at DESC;
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
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
    const { name, description, banner_url, is_featured = false } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama koleksi wajib diisi' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const result = await query(`
      INSERT INTO collections (name, slug, description, banner_url, is_featured, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, name, slug;
    `, [name, slug, description || null, banner_url || null, is_featured]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
