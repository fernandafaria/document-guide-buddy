import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🕐 Starting check-in expiration process...');

    // Calculate 30 minutes ago
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    console.log(`Looking for check-ins older than ${thirtyMinutesAgo}`);

    // Find all profiles with expired check-ins (older than 30 minutes)
    const { data: expiredProfiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, current_check_in')
      .not('current_check_in', 'is', null);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${expiredProfiles?.length || 0} profiles with active check-ins`);

    let expiredCount = 0;
    const locationUpdates = new Map<string, number>();

    // Process each profile
    for (const profile of expiredProfiles || []) {
      if (!profile.current_check_in) continue;

      const checkIn = profile.current_check_in as any;
      const checkedInAt = checkIn.checked_in_at;

      if (!checkedInAt) {
        console.log(`Profile ${profile.id} has check-in without timestamp, expiring...`);
      } else if (new Date(checkedInAt) < new Date(thirtyMinutesAgo)) {
        console.log(`Profile ${profile.id} check-in expired (${checkedInAt})`);
      } else {
        // Still valid
        continue;
      }

      expiredCount++;

      // Track location for count update
      const locationId = checkIn.location_id;
      if (locationId) {
        locationUpdates.set(locationId, (locationUpdates.get(locationId) || 0) + 1);
      }

      // Clear the check-in
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ current_check_in: null })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`Error clearing check-in for profile ${profile.id}:`, updateError);
      }
    }

    // Update location counts
    for (const [locationId, decrementBy] of locationUpdates) {
      console.log(`Decrementing location ${locationId} by ${decrementBy}`);

      const { data: location } = await supabaseClient
        .from('locations')
        .select('*')
        .eq('location_id', locationId)
        .maybeSingle();

      if (location) {
        const newCount = Math.max(0, location.active_users_count - decrementBy);
        
        const { error: updateError } = await supabaseClient
          .from('locations')
          .update({ active_users_count: newCount })
          .eq('id', location.id);

        if (updateError) {
          console.error(`Error updating location ${locationId}:`, updateError);
        } else {
          console.log(`Updated location ${locationId} count to ${newCount}`);
        }
      }
    }

    console.log(`✅ Expired ${expiredCount} check-ins`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expired_count: expiredCount,
        locations_updated: locationUpdates.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in expire-checkins:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
