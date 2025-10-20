import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500).optional(),
  userLatitude: z.number().min(-90).max(90).optional(),
  userLongitude: z.number().min(-180).max(180).optional(),
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
    const parsed = checkInSchema.safeParse(body);
    
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { latitude, longitude, name, address, userLatitude, userLongitude } = parsed.data;

    // Validate distance (max 100 meters)
    if (userLatitude !== undefined && userLongitude !== undefined) {
      const R = 6371e3; // Earth radius in meters
      const φ1 = userLatitude * Math.PI / 180;
      const φ2 = latitude * Math.PI / 180;
      const Δφ = (latitude - userLatitude) * Math.PI / 180;
      const Δλ = (longitude - userLongitude) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      console.log(`Distance from user to location: ${distance.toFixed(2)} meters`);

      if (distance > 100) {
        const distanceMessage = distance < 1000 
          ? `${Math.round(distance)} metros`
          : `${(distance / 1000).toFixed(2)} km`;
        
        return new Response(
          JSON.stringify({ 
            error: 'Você está muito longe do local',
            distance: Math.round(distance),
            message: `Você está a ${distanceMessage} do local. Aproxime-se até 100 metros para fazer check-in.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    console.log(`User checking in at ${name}`);

    // Check if user has a previous check-in and decrement that location's count
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('current_check_in')
      .eq('id', user.id)
      .maybeSingle();

    if (currentProfile?.current_check_in) {
      const previousCheckIn = currentProfile.current_check_in as any;
      const previousLocationId = previousCheckIn.location_id;
      
      console.log(`User has previous check-in at location ${previousLocationId}, decrementing count`);
      
      // Get the previous location to decrement count
      const { data: previousLocation } = await supabaseClient
        .from('locations')
        .select('*')
        .eq('location_id', previousLocationId)
        .maybeSingle();

      if (previousLocation) {
        const newCount = Math.max(0, previousLocation.active_users_count - 1);
        await supabaseClient
          .from('locations')
          .update({ 
            active_users_count: newCount,
            last_activity: new Date().toISOString()
          })
          .eq('id', previousLocation.id);
        
        console.log(`Decremented count for previous location ${previousLocationId} to ${newCount}`);
      }
    }

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

    // Update user's current check-in; if profile doesn't exist, create it with safe defaults
    const { data: updatedProfile, error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({
        current_check_in: {
          location_id: location.location_id,
          location_name: name,
          checked_in_at: new Date().toISOString(),
          latitude: location.latitude,
          longitude: location.longitude,
        },
      })
      .eq('id', user.id)
      .select('id')
      .maybeSingle();

    if (updateProfileError) {
      console.error('Error updating profile:', updateProfileError);
      throw updateProfileError;
    }

    if (!updatedProfile) {
      console.log('Profile not found; creating a new one for user', user.id);

      // Map gender from metadata to allowed Portuguese values
      const rawGender = ((user.user_metadata as any)?.gender ?? '').toString().toLowerCase();
      let genderValue = 'Outro';
      if (rawGender.includes('masc') || rawGender === 'male' || rawGender === 'm') {
        genderValue = 'Masculino';
      } else if (rawGender.includes('fem') || rawGender === 'female' || rawGender === 'f') {
        genderValue = 'Feminino';
      } else if (
        rawGender.includes('não') || rawGender.includes('nao') ||
        rawGender.includes('non') || rawGender.includes('non-binary') ||
        rawGender.includes('nonbinary') || rawGender.includes('nb')
      ) {
        genderValue = 'Não-binário';
      }

      const ageValue = (user.user_metadata as any)?.age;
      const safeAge = typeof ageValue === 'number' && ageValue >= 18 && ageValue <= 99 ? ageValue : 18;

      const intentionsValue = (user.user_metadata as any)?.intentions;
      const safeIntentions = Array.isArray(intentionsValue) && intentionsValue.length > 0 ? intentionsValue : ['friendship'];

      const { error: insertProfileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email ?? null,
          phone_number: (user as any).phone ?? null,
          name: (user.user_metadata as any)?.name ?? 'Novo Usuário',
          gender: genderValue,
          age: safeAge,
          intentions: safeIntentions,
          current_check_in: {
            location_id: location.location_id,
            location_name: name,
            checked_in_at: new Date().toISOString(),
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

      if (insertProfileError) {
        console.error('Error creating missing profile:', insertProfileError);
        throw insertProfileError;
      }
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
