import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { toAppProperty, toSupabaseRow } from '@/lib/supabase/properties';

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as any);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API properties GET Error]', error.message, error.details);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map(toAppProperty);
    console.log(`[API properties GET] Returning ${mapped.length} properties.`);
    return NextResponse.json({ success: true, properties: mapped, count: mapped.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API properties GET Fatal Error]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawProp = body.property || body;
    if (!rawProp || !rawProp.id) {
      return NextResponse.json({ success: false, error: 'Property data and valid ID required' }, { status: 400 });
    }

    // Sanitize property object into Supabase table columns (strips unmapped fields like 'bathrooms')
    const row = toSupabaseRow(rawProp);
    const supabase = createAdminClient();

    console.log(`[API properties POST] Upserting property ID: ${row.id}, title: "${row.title}"`);
    const { data, error } = await (supabase.from('properties') as any).upsert(row).select();

    if (error) {
      console.error('[API properties POST Upsert Error]', error.message, error.details);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[API properties POST Success] Successfully saved property ID: ${row.id}`);
    return NextResponse.json({ success: true, property: data?.[0] ?? row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API properties POST Fatal Error]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Property ID required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    console.log(`[API properties DELETE] Deleting property ID: ${id}`);
    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('[API properties DELETE Error]', error.message, error.details);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`[API properties DELETE Success] Deleted ID: ${id}`);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API properties DELETE Fatal Error]', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
