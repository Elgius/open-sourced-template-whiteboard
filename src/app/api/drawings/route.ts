import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: drawings, error } = await supabase
      .from("drawings")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch drawings" },
        { status: 500 }
      );
    }

    return NextResponse.json(drawings || []);
  } catch (error) {
    console.error("Error fetching drawings:", error);
    return NextResponse.json(
      { error: "Failed to fetch drawings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, data } = await request.json();

    const newDrawing = {
      name,
      data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: drawing, error } = await supabase
      .from("drawings")
      .insert([newDrawing])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create drawing" },
        { status: 500 }
      );
    }

    return NextResponse.json(drawing);
  } catch (error) {
    console.error("Error creating drawing:", error);
    return NextResponse.json(
      { error: "Failed to create drawing" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, data } = await request.json();

    const { data: drawing, error } = await supabase
      .from("drawings")
      .update({
        name,
        data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Drawing not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update drawing" },
        { status: 500 }
      );
    }

    return NextResponse.json(drawing);
  } catch (error) {
    console.error("Error updating drawing:", error);
    return NextResponse.json(
      { error: "Failed to update drawing" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Drawing ID required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("drawings").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete drawing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting drawing:", error);
    return NextResponse.json(
      { error: "Failed to delete drawing" },
      { status: 500 }
    );
  }
}
