import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LikeRequest {
  toUserId: string;
  locationId: string;
  action: 'like' | 'pass';
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

    const { toUserId, locationId, action }: LikeRequest = await req.json();

    if (!toUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing toUserId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Only process if action is 'like', ignore 'pass'
    if (action !== 'like') {
      return new Response(
        JSON.stringify({ success: true, isMatch: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} liked ${toUserId} at location ${locationId}`);

    // Check if the other user already liked this user
    const { data: existingLike } = await supabaseClient
      .from('likes')
      .select('*')
      .eq('from_user_id', toUserId)
      .eq('to_user_id', user.id)
      .single();

    let isMatch = false;

    if (existingLike) {
      // It's a match! Update both likes
      isMatch = true;

      await supabaseClient
        .from('likes')
        .update({ is_match: true })
        .eq('id', existingLike.id);

      // Create the match record
      const { error: matchError } = await supabaseClient
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: toUserId,
          location_id: locationId,
        });

      if (matchError) {
        console.error('Error creating match:', matchError);
      } else {
        console.log(`Match created between ${user.id} and ${toUserId}`);
      }
    }

    // Create the like record
    const { error: likeError } = await supabaseClient
      .from('likes')
      .insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        location_id: locationId,
        is_match: isMatch,
      });

    if (likeError) {
      console.error('Error creating like:', likeError);
      throw likeError;
    }

    return new Response(
      JSON.stringify({ success: true, isMatch }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-like:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
