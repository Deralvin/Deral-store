import { NextRequest, NextResponse } from 'next/server';
import pool, { query } from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.gender,
        p.season,
        p.material_composition,
        p.fit_type,
        p.base_price,
        p.is_published,
        p.is_featured,
        p.tags,
        p.created_at,
        b.name AS brand_name,
        c.name AS category_name,
        c.slug AS category_slug,
        COALESCE(
          (
            SELECT img.url 
            FROM product_images img 
            WHERE img.product_id = p.id 
            ORDER BY img.is_primary DESC, img.sort_order ASC 
            LIMIT 1
          ),
          NULL
        ) AS image_url,
        COUNT(DISTINCT v.id) AS variants_count,
        COALESCE(SUM(inv.quantity_on_hand - inv.quantity_reserved), 0)::int AS total_stock
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.primary_category_id = c.id
      LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = TRUE
      LEFT JOIN inventory_levels inv ON inv.variant_id = v.id
      WHERE p.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND (c.slug = $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.slug ILIKE $${params.length} OR EXISTS (
        SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.sku ILIKE $${params.length}
      ))`;
    }

    sql += `
      GROUP BY p.id, b.name, c.name, c.slug
      ORDER BY p.created_at DESC;
    `;

    const result = await query(sql, params);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      name,
      category_id,
      brand_id,
      base_price,
      sku,
      stock = 10,
      gender = 'unisex',
      material_composition,
      fit_type,
      short_description,
      image_url,
      options = ['Size']
    } = body;

    if (!name || !base_price || !sku) {
      return NextResponse.json({ success: false, error: 'Name, SKU, and Base Price are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    await client.query('BEGIN');

    // 1. Resolve Category if name or ID provided
    let catId = category_id;
    if (!catId) {
      const defaultCat = await client.query('SELECT id FROM categories LIMIT 1');
      catId = defaultCat.rows[0]?.id;
    }

    // 2. Insert Product
    const insertProductResult = await client.query(`
      INSERT INTO products (
        name, slug, primary_category_id, brand_id, base_price, gender, 
        material_composition, fit_type, short_description, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
      RETURNING id, name, slug;
    `, [name, slug, catId, brand_id || null, base_price, gender, material_composition || null, fit_type || null, short_description || null]);

    const product = insertProductResult.rows[0];

    // 3. Insert Product Option (e.g. Size: All Size / Standard)
    const optResult = await client.query(`
      INSERT INTO product_options (product_id, name, position)
      VALUES ($1, 'Size', 1)
      RETURNING id;
    `, [product.id]);
    const optId = optResult.rows[0].id;

    const optValResult = await client.query(`
      INSERT INTO product_option_values (option_id, value, position)
      VALUES ($1, 'All Size', 1)
      RETURNING id;
    `, [optId]);
    const optValId = optValResult.rows[0].id;

    // 4. Insert Default Variant (SKU)
    const variantResult = await client.query(`
      INSERT INTO product_variants (
        product_id, sku, title, price, compare_at_price, is_active
      ) VALUES ($1, $2, 'Standard', $3, NULL, TRUE)
      RETURNING id;
    `, [product.id, sku, base_price]);
    const variantId = variantResult.rows[0].id;

    await client.query(`
      INSERT INTO variant_option_values (variant_id, option_value_id)
      VALUES ($1, $2);
    `, [variantId, optValId]);

    // 5. Add Inventory to primary warehouse
    const whResult = await client.query('SELECT id FROM warehouses LIMIT 1');
    const warehouseId = whResult.rows[0]?.id;
    if (warehouseId) {
      await client.query(`
        INSERT INTO inventory_levels (variant_id, warehouse_id, quantity_on_hand, quantity_reserved)
        VALUES ($1, $2, $3, 0);
      `, [variantId, warehouseId, parseInt(stock, 10) || 0]);
    }

    // 6. Optional Product Image
    if (image_url) {
      await client.query(`
        INSERT INTO product_images (product_id, variant_id, url, alt_text, is_primary)
        VALUES ($1, $2, $3, $4, TRUE);
      `, [product.id, variantId, image_url, name]);
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
