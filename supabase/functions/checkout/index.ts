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

    console.log(`User ${user.id} checking out`);

    // Get user's current check-in
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('current_check_in')
      .eq('id', user.id)
      .single();

    if (profile?.current_check_in) {
      const locationId = profile.current_check_in.location_id;

      // Decrement active users count
      const { data: location } = await supabaseClient
        .from('locations')
        .select('active_users_count')
        .eq('id', locationId)
        .single();

      if (location && location.active_users_count > 0) {
        await supabaseClient
          .from('locations')
          .update({
            active_users_count: location.active_users_count - 1,
            last_activity: new Date().toISOString(),
          })
          .eq('id', locationId);
        
        console.log(`Decremented location ${locationId} count`);
      }
    }

    // Clear user's current check-in
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ current_check_in: null })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      throw profileError;
    }

    console.log(`User ${user.id} checked out successfully`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in checkout:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
