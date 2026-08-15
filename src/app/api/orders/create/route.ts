import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const client = await pool.connect();
  try {
    const body = await req.json();
    const {
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items, // array of { variant_id, product_name, variant_title, sku, unit_price, quantity, thumbnail_url }
      discount_code,
      discount_amount = 0,
      shipping_fee = 0,
      payment_status = 'paid',
      status = 'confirmed',
      customer_notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Minimal harus memilih 1 item produk' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Calculate financial totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += parseFloat(item.unit_price) * parseInt(item.quantity, 10);
    }

    const discountVal = parseFloat(discount_amount) || 0;
    const shippingVal = parseFloat(shipping_fee) || 0;
    const totalAmount = Math.max(0, subtotal - discountVal + shippingVal);

    // 2. Generate unique order number (e.g. AF-2026-8942)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AF-${new Date().getFullYear()}-${randomSuffix}`;

    // 3. Resolve or create customer if needed
    let resolvedCustomerId = customer_id || null;
    if (!resolvedCustomerId && customer_email && customer_name) {
      // Check if customer email exists
      const existingCust = await client.query('SELECT id FROM customers WHERE email = $1', [customer_email]);
      if (existingCust.rows.length > 0) {
        resolvedCustomerId = existingCust.rows[0].id;
      } else {
        const newCust = await client.query(`
          INSERT INTO customers (email, first_name, phone, loyalty_tier)
          VALUES ($1, $2, $3, 'Regular')
          RETURNING id;
        `, [customer_email, customer_name, customer_phone || null]);
        resolvedCustomerId = newCust.rows[0].id;
      }
    }

    // 4. Format shipping address snapshot
    const addressSnapshot = shipping_address || {
      recipient: customer_name || 'Walk-in Customer',
      phone: customer_phone || '-',
      address: 'Pemesanan Manual di Butik / Store',
    };

    // 5. Insert into `orders`
    const insertOrderResult = await client.query(`
      INSERT INTO orders (
        order_number, customer_id, status, payment_status, fulfillment_status,
        currency, subtotal_amount, discount_amount, shipping_fee, tax_amount, total_amount,
        discount_code, shipping_address, customer_notes
      ) VALUES (
        $1, $2, $3, $4, 'unfulfilled',
        'IDR', $5, $6, $7, 0, $8,
        $9, $10, $11
      )
      RETURNING id, order_number, total_amount;
    `, [
      orderNumber,
      resolvedCustomerId,
      status,
      payment_status,
      subtotal,
      discountVal,
      shippingVal,
      totalAmount,
      discount_code || null,
      JSON.stringify(addressSnapshot),
      customer_notes || null,
    ]);

    const orderId = insertOrderResult.rows[0].id;

    // 6. Insert line items & deduct stock in `inventory_levels`
    const whResult = await client.query('SELECT id FROM warehouses LIMIT 1');
    const primaryWarehouseId = whResult.rows[0]?.id;

    for (const item of items) {
      const itemTotal = parseFloat(item.unit_price) * parseInt(item.quantity, 10);
      
      await client.query(`
        INSERT INTO order_items (
          order_id, variant_id, product_name, variant_title, sku,
          unit_price, quantity, total_amount, thumbnail_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `, [
        orderId,
        item.variant_id || null,
        item.product_name,
        item.variant_title || 'Standard',
        item.sku || 'SKU-GEN',
        item.unit_price,
        item.quantity,
        itemTotal,
        item.thumbnail_url || null,
      ]);

      // Deduct stock if variant_id exists
      if (item.variant_id && primaryWarehouseId) {
        await client.query(`
          UPDATE inventory_levels
          SET 
            quantity_on_hand = GREATEST(0, quantity_on_hand - $1),
            updated_at = CURRENT_TIMESTAMP
          WHERE variant_id = $2 AND warehouse_id = $3;
        `, [parseInt(item.quantity, 10), item.variant_id, primaryWarehouseId]);
      }
    }

    // 7. If customer exists, update their total_spent and orders_count
    if (resolvedCustomerId) {
      await client.query(`
        UPDATE customers
        SET 
          orders_count = orders_count + 1,
          total_spent = total_spent + $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2;
      `, [payment_status === 'paid' ? totalAmount : 0, resolvedCustomerId]);
    }

    await client.query('COMMIT');
    return NextResponse.json({
      success: true,
      data: insertOrderResult.rows[0],
      message: `Pesanan ${orderNumber} berhasil dibuat!`,
    }, { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
