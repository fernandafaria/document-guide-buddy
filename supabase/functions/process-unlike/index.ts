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

    const { toUserId } = await req.json();

    if (!toUserId) {
      return new Response(
        JSON.stringify({ error: 'toUserId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing unlike from ${user.id} to ${toUserId}`);

    // Get the like to check if it was a match
    const { data: myLike } = await supabaseClient
      .from('likes')
      .select('id, is_match')
      .eq('from_user_id', user.id)
      .eq('to_user_id', toUserId)
      .maybeSingle();

    if (!myLike) {
      return new Response(
        JSON.stringify({ error: 'Like not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Delete my like
    const { error: deleteLikeError } = await supabaseClient
      .from('likes')
      .delete()
      .eq('id', myLike.id);

    if (deleteLikeError) {
      console.error('Error deleting like:', deleteLikeError);
      throw deleteLikeError;
    }

    console.log('Like deleted successfully');

    // If it was a match, delete the match and update the other like
    if (myLike.is_match) {
      console.log('Was a match, cleaning up...');

      // Delete the match record
      const { error: deleteMatchError } = await supabaseClient
        .from('matches')
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${user.id})`);

      if (deleteMatchError) {
        console.error('Error deleting match:', deleteMatchError);
      } else {
        console.log('Match deleted successfully');
      }

      // Update the other user's like to not be a match anymore
      const { error: updateOtherLikeError } = await supabaseClient
        .from('likes')
        .update({ is_match: false })
        .eq('from_user_id', toUserId)
        .eq('to_user_id', user.id);

      if (updateOtherLikeError) {
        console.error('Error updating other like:', updateOtherLikeError);
      } else {
        console.log('Other user like updated to is_match=false');
      }

      // Send notification to the other user
      try {
        const { data: myProfile } = await supabaseClient
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        await supabaseClient.functions.invoke('send-notification', {
          body: {
            userId: toUserId,
            title: '💔 Match desfeito',
            body: `${myProfile?.name} descurtiu você`,
            data: {
              type: 'unlike',
              fromUserId: user.id,
            }
          }
        });

        console.log(`Notification sent to user ${toUserId}`);
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-unlike:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
