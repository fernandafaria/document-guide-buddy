import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, title, body, data } = await req.json() as NotificationPayload;

    console.log(`Sending notification to user ${userId}`);

    // Get user's FCM token and notification preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('fcm_token, notifications_enabled')
      .eq('id', userId)
      .single();

    if (!profile?.notifications_enabled) {
      console.log(`User ${userId} has notifications disabled`);
      return new Response(
        JSON.stringify({ success: false, reason: 'notifications_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For now, just log the notification (FCM integration would go here)
    // In a real implementation, you would use Firebase Admin SDK to send push notifications
    console.log('Notification would be sent:', {
      fcmToken: profile.fcm_token,
      title,
      body,
      data,
    });

    // Create in-app notification record
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        data,
        read: false,
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
