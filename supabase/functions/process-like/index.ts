import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const likeRequestSchema = z.object({
  toUserId: z.string().uuid({ message: 'Invalid user ID format' }),
  locationId: z.string().min(1).max(100),
  action: z.enum(['like', 'pass']),
});

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

    const body = await req.json();
    const parsed = likeRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { toUserId, locationId, action } = parsed.data;

    // Only process if action is 'like', ignore 'pass'
    if (action !== 'like') {
      return new Response(
        JSON.stringify({ success: true, isMatch: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User action processed at location`);

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
        console.log(`Match created successfully`);
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
