import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

    const url = new URL(req.url);
    const latitude = parseFloat(url.searchParams.get('latitude') || '0');
    const longitude = parseFloat(url.searchParams.get('longitude') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10'); // default 10km

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Missing latitude or longitude' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Finding locations near ${latitude}, ${longitude} within ${radius}km`);

    // Get all locations (in production, you'd want to add a bounding box filter first)
    const { data: locations, error } = await supabaseClient
      .from('locations')
      .select('*')
      .gt('active_users_count', 0); // Only show locations with active users

    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }

    // Filter by distance
    const nearbyLocations = locations
      ?.filter((location) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );
        return distance <= radius;
      })
      .map((location) => ({
        ...location,
        distance: calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance) || [];

    console.log(`Found ${nearbyLocations.length} nearby locations`);

    return new Response(
      JSON.stringify({ locations: nearbyLocations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-nearby-locations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
