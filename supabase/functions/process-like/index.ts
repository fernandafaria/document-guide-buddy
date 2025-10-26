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

      // Check if match already exists (in either direction)
      const { data: existingMatch } = await supabaseClient
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${user.id})`)
        .maybeSingle();

      // Only create match if it doesn't exist
      if (!existingMatch) {
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
      } else {
        console.log('Match already exists, skipping creation');
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

    // Send notification to the user who received the like
    try {
      const { data: fromProfile } = await supabaseClient
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      const notificationTitle = isMatch ? '🎉 Novo Match!' : '❤️ Nova Curtida!';
      const notificationBody = isMatch 
        ? `Você e ${fromProfile?.name} curtiram um ao outro!`
        : `${fromProfile?.name} curtiu você!`;

      await supabaseClient.functions.invoke('send-notification', {
        body: {
          userId: toUserId,
          title: notificationTitle,
          body: notificationBody,
          data: {
            type: isMatch ? 'match' : 'like',
            fromUserId: user.id,
            fromUserName: fromProfile?.name,
          }
        }
      });

      console.log(`Notification sent to user ${toUserId}`);
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the like if notification fails
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
