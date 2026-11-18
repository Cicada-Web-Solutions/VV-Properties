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
      console.warn('[API properties GET] Supabase error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (data || []).map(toAppProperty);
    return NextResponse.json({ success: true, properties: mapped, count: mapped.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawProp = body.property;
    if (!rawProp || !rawProp.id) {
      return NextResponse.json({ success: false, error: 'Property data and ID required' }, { status: 400 });
    }

    const row = rawProp.title ? toSupabaseRow(rawProp) : rawProp;
    const supabase = createAdminClient();

    const { data, error } = await (supabase.from('properties') as any).upsert(row).select();

    if (error) {
      console.error('[API properties POST] Supabase upsert error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: data?.[0] ?? row });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
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
    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      console.error('[API properties DELETE] Supabase delete error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
