import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const locationIdSchema = z.string().min(1).max(100);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Support both JSON body and query params
    let locationId: string | null = null;
    try {
      const body = await req.json();
      if (body && body.locationId) {
        locationId = String(body.locationId);
      }
    } catch (_) {
      // ignore if no JSON body
    }

    if (!locationId) {
      const url = new URL(req.url);
      locationId = url.searchParams.get('locationId');
    }

    if (!locationId) {
      return new Response(
        JSON.stringify({ error: 'Missing locationId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate locationId format
    const validationResult = locationIdSchema.safeParse(locationId);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid locationId format',
          details: validationResult.error.errors.map(e => e.message)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Getting users at location`);

    // Get all profiles with current check-in at this location
    const { data: profiles, error } = await supabaseClient
      .from('profiles')
      .select('id, name, age, profession, photos, gender, current_check_in')
      .not('current_check_in', 'is', null);

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    // Filter profiles by location_id in their current_check_in
    const usersAtLocation = profiles
      ?.filter((profile) => {
        return profile.current_check_in?.location_id === locationId && profile.id !== user.id;
      }) || [];

    console.log(`Found ${usersAtLocation.length} users at location`);

    return new Response(
      JSON.stringify({ users: usersAtLocation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-users-at-location:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
