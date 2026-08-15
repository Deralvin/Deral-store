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
        b.id,
        b.name,
        b.slug,
        b.logo_url,
        b.cover_image_url,
        b.description,
        b.website_url,
        b.is_active,
        b.created_at,
        COUNT(p.id)::int AS products_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id AND p.deleted_at IS NULL
      GROUP BY b.id
      ORDER BY b.name ASC;
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
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
    const { name, description, website_url, logo_url } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama brand / desainer wajib diisi' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const result = await query(`
      INSERT INTO brands (name, slug, description, website_url, logo_url, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id, name, slug;
    `, [name, slug, description || null, website_url || null, logo_url || null]);

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
