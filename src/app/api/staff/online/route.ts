export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      email: string;
      isOnline: boolean;
    };

    if (!body.email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('staff_status')
      .update({ is_online: body.isOnline, last_seen: new Date().toISOString() })
      .eq('email', body.email)
      .select()
      .single();

    if (error) {
      // If staff doesn't exist, create them (auto-onboarding for MVP)
      if (error.code === 'PGRST116') {
         const { data: newData, error: insertError } = await supabase
          .from('staff_status')
          .insert({ email: body.email, is_online: body.isOnline })
          .select()
          .single();
          
         if (insertError) throw insertError;
         return NextResponse.json(newData);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating staff status:', error);
    return NextResponse.json(
      { message: "Unable to update status." },
      { status: 500 },
    );
  }
}
