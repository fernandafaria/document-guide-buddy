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

    // Support both JSON body and query params
    let latitude: number | null = null;
    let longitude: number | null = null;
    let radius: number = 10;
    let limit: number = 200; // Limit POIs for better performance

    try {
      const body = await req.json();
      if (body) {
        latitude = typeof body.latitude === 'number' ? body.latitude : parseFloat(String(body.latitude));
        longitude = typeof body.longitude === 'number' ? body.longitude : parseFloat(String(body.longitude));
        radius = body.radius ? (typeof body.radius === 'number' ? body.radius : parseFloat(String(body.radius))) : 10;
        limit = body.limit ? (typeof body.limit === 'number' ? body.limit : parseFloat(String(body.limit))) : 200;
      }
    } catch (_) {
      // ignore if no JSON body
    }

    if (latitude === null || Number.isNaN(latitude) || longitude === null || Number.isNaN(longitude)) {
      const url = new URL(req.url);
      latitude = parseFloat(url.searchParams.get('latitude') || '0');
      longitude = parseFloat(url.searchParams.get('longitude') || '0');
      radius = parseFloat(url.searchParams.get('radius') || String(radius));
    }

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Missing latitude or longitude' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Finding locations near ${latitude}, ${longitude} within ${radius}km`);

    // Get locations from database with active check-ins (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    const { data: dbLocations, error: dbError } = await supabaseClient
      .from('locations')
      .select('*')
      .gt('active_users_count', 0)
      .gte('last_activity', thirtyMinutesAgo);

    if (dbError) {
      console.error('Error fetching database locations:', dbError);
    }

    // Fetch POIs from OpenStreetMap Overpass API with reduced radius for performance
    const overpassRadius = Math.min(radius * 1000, 3000); // Convert km to meters, max 3km for performance
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"~"bar|pub|restaurant|cafe|nightclub"](around:${overpassRadius},${latitude},${longitude});
        node["leisure"~"park|sports_centre"](around:${overpassRadius},${latitude},${longitude});
        way["amenity"~"bar|pub|restaurant|cafe|nightclub"](around:${overpassRadius},${latitude},${longitude});
        way["leisure"~"park|sports_centre"](around:${overpassRadius},${latitude},${longitude});
      );
      out center ${limit};
    `;

    let pois: any[] = [];
    try {
      const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'text/plain' },
      });

      if (overpassResponse.ok) {
        const overpassData = await overpassResponse.json();
        pois = overpassData.elements
          .map((element: any) => {
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;
            if (!lat || !lon) return null;

            const distance = calculateDistance(latitude, longitude, lat, lon);
            const tags = element.tags || {};
            
            return {
              id: `poi_${element.id}`,
              name: tags.name || tags.amenity || tags.leisure || 'Local sem nome',
              address: tags['addr:street'] 
                ? `${tags['addr:street']}${tags['addr:housenumber'] ? ', ' + tags['addr:housenumber'] : ''}`
                : null,
              latitude: lat,
              longitude: lon,
              active_users_count: 0,
              distance,
              type: tags.amenity || tags.leisure || 'other',
              cuisine: tags.cuisine,
              opening_hours: tags.opening_hours,
            };
          })
          .filter((poi: any) => poi !== null && poi.distance <= radius);

        console.log(`Found ${pois.length} POIs from OpenStreetMap`);
      }
    } catch (error) {
      console.error('Error fetching POIs from Overpass:', error);
    }

    // Combine database locations and POIs
    const dbNearbyLocations = (dbLocations || [])
      .filter((location) => {
        const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
        return distance <= radius;
      })
      .map((location) => ({
        ...location,
        distance: calculateDistance(latitude, longitude, location.latitude, location.longitude),
        type: 'user_location',
      }));

    const allLocations = [...dbNearbyLocations, ...pois].sort((a, b) => a.distance - b.distance);

    console.log(`Found ${dbNearbyLocations.length} user locations and ${pois.length} POIs (total: ${allLocations.length})`);

    return new Response(
      JSON.stringify({ locations: allLocations }),
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
