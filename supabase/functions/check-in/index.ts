import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckInRequest {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
}

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

    const { latitude, longitude, name, address }: CheckInRequest = await req.json();
    
    if (!latitude || !longitude || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`User ${user.id} checking in at ${name} (${latitude}, ${longitude})`);

    // Generate location_id from coordinates
    const location_id = `${latitude.toFixed(6)}_${longitude.toFixed(6)}`;

    // Check if location exists
    const { data: existingLocation } = await supabaseClient
      .from('locations')
      .select('*')
      .eq('location_id', location_id)
      .maybeSingle();

    let location;

    if (existingLocation) {
      // Increment active users count
      const { data: updatedLocation, error: updateError } = await supabaseClient
        .from('locations')
        .update({
          active_users_count: existingLocation.active_users_count + 1,
          last_activity: new Date().toISOString(),
        })
        .eq('id', existingLocation.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating location:', updateError);
        throw updateError;
      }
      
      location = updatedLocation;
      console.log(`Updated location ${location_id}, now has ${location.active_users_count} users`);
    } else {
      // Create new location
      const { data: newLocation, error: insertError } = await supabaseClient
        .from('locations')
        .insert({
          location_id,
          name,
          address,
          latitude,
          longitude,
          active_users_count: 1,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating location:', insertError);
        throw insertError;
      }
      
      location = newLocation;
      console.log(`Created new location ${location_id}`);
    }

    // Update user's current check-in
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        current_check_in: {
          location_id: location.id,
          location_name: name,
          checked_in_at: new Date().toISOString(),
        },
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    console.log(`User ${user.id} checked in successfully`);

    return new Response(
      JSON.stringify({ location }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-in:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
