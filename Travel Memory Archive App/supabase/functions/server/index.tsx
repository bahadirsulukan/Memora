import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

console.log('🚀 ROUTES SERVER STARTING - NO AUTH MODE...');

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

console.log('✅ Supabase ready');

// ============================================
// STORAGE
// ============================================
const PHOTOS_BUCKET = 'make-64034c42-photos';

async function ensureStorageBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PHOTOS_BUCKET);
    
    if (!bucketExists) {
      console.log('📦 Creating bucket...');
      await supabase.storage.createBucket(PHOTOS_BUCKET, {
        public: false,
        fileSizeLimit: 10485760,
      });
      console.log('✅ Bucket created');
    }
  } catch (error) {
    console.error('❌ Bucket error:', error);
  }
}

ensureStorageBucket();

// ============================================
// MIDDLEWARE
// ============================================
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

// ============================================
// NO AUTH - EVERYONE USES SAME USER ID!
// ============================================
const DEFAULT_USER_ID = 'demo-user';

console.log('⚠️ NO AUTH MODE - Everyone is:', DEFAULT_USER_ID);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/make-server-64034c42/health", (c) => {
  console.log('💓 Health check');
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mode: "NO_AUTH"
  });
});

// Auth: Signup
app.post("/make-server-64034c42/auth/signup", async (c) => {
  try {
    console.log('📝 POST /auth/signup');

    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('Creating user:', email);

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true, // Auto-confirm since we don't have email server
    });

    if (error) {
      console.error('❌ Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created:', data.user.id);

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    return c.json({
      error: 'Signup failed',
      details: error.message
    }, 500);
  }
});

// Get all visits
app.get("/make-server-64034c42/visits", async (c) => {
  try {
    console.log('📖 GET /visits');
    
    const allVisits = await kv.getByPrefix(`visit:${DEFAULT_USER_ID}:`);
    console.log(`✅ Found ${allVisits.length} visits`);
    
    return c.json({ visits: allVisits });
  } catch (error) {
    console.error('❌ GET /visits error:', error);
    return c.json({ 
      error: 'Failed to fetch visits',
      details: error.message 
    }, 500);
  }
});

// Create visit
app.post("/make-server-64034c42/visits", async (c) => {
  try {
    console.log('➕ POST /visits');
    
    const body = await c.req.json();
    console.log('📦 Body:', JSON.stringify(body, null, 2));
    
    const visitId = `visit-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const visit = {
      id: visitId,
      userId: DEFAULT_USER_ID,
      title: body.title || '',
      countryCode: body.countryCode || '',
      countryName: body.countryName || '',
      cityName: body.cityName || '',
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      rating: body.rating || 0,
      color: body.color || '#3B82F6',
      startDate: body.startDate || null,
      notes: body.notes || '',
      tags: body.tags || [],
      photos: body.photos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('💾 Saving visit:', visitId);
    await kv.set(`visit:${DEFAULT_USER_ID}:${visitId}`, visit);
    
    console.log('✅ Visit created:', visitId);
    
    return c.json({ visit }, 201);
  } catch (error) {
    console.error('❌ POST /visits error:', error);
    return c.json({ 
      error: 'Failed to create visit',
      details: error.message 
    }, 500);
  }
});

// Update visit
app.put("/make-server-64034c42/visits/:id", async (c) => {
  try {
    const visitId = c.req.param('id');
    console.log('✏️ PUT /visits/' + visitId);
    
    const body = await c.req.json();
    
    const key = `visit:${DEFAULT_USER_ID}:${visitId}`;
    const existing = await kv.get(key);
    
    if (!existing) {
      return c.json({ error: 'Visit not found' }, 404);
    }
    
    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(key, updated);
    
    console.log('✅ Visit updated:', visitId);
    
    return c.json({ visit: updated });
  } catch (error) {
    console.error('❌ PUT /visits error:', error);
    return c.json({ 
      error: 'Failed to update visit',
      details: error.message 
    }, 500);
  }
});

// Delete visit
app.delete("/make-server-64034c42/visits/:id", async (c) => {
  try {
    const visitId = c.req.param('id');
    console.log('🗑️ DELETE /visits/' + visitId);
    
    await kv.del(`visit:${DEFAULT_USER_ID}:${visitId}`);
    
    console.log('✅ Visit deleted:', visitId);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /visits error:', error);
    return c.json({ 
      error: 'Failed to delete visit',
      details: error.message 
    }, 500);
  }
});

// Upload photo
app.post("/make-server-64034c42/upload-photo", async (c) => {
  try {
    console.log('📸 POST /upload-photo');
    
    const body = await c.req.json();
    
    if (!body.file || !body.fileName) {
      return c.json({ error: 'Missing file or fileName' }, 400);
    }
    
    // Remove data URL prefix
    let base64Data = body.file;
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
    }
    
    // Decode base64
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = body.fileName.split('.').pop() || 'jpg';
    const storagePath = `${DEFAULT_USER_ID}/${timestamp}-${randomStr}.${extension}`;
    
    console.log('📤 Uploading to:', storagePath);
    
    // Upload
    const { error: uploadError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: body.contentType || 'image/jpeg',
        upsert: false,
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return c.json({ 
        error: 'Upload failed', 
        details: uploadError.message 
      }, 500);
    }
    
    // Get signed URL (1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(storagePath, 31536000);
    
    if (urlError) {
      console.error('❌ Signed URL error:', urlError);
      return c.json({ error: 'Failed to create signed URL' }, 500);
    }
    
    console.log('✅ Photo uploaded');
    
    return c.json({ 
      url: signedUrlData.signedUrl,
      path: storagePath,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return c.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, 500);
  }
});

// Get stats
app.get("/make-server-64034c42/stats", async (c) => {
  try {
    console.log('📊 GET /stats');
    
    const visits = await kv.getByPrefix(`visit:${DEFAULT_USER_ID}:`);
    
    const countries = new Set(visits.map((v: any) => v.countryCode));
    const cities = new Set(visits.map((v: any) => v.cityName).filter(Boolean));
    
    const stats = {
      totalCountries: countries.size,
      totalCities: cities.size,
      totalVisits: visits.length,
    };
    
    console.log('✅ Stats:', stats);
    
    return c.json(stats);
  } catch (error) {
    console.error('❌ GET /stats error:', error);
    return c.json({ 
      error: 'Failed to fetch stats',
      details: error.message 
    }, 500);
  }
});

console.log('✅ SERVER READY - NO AUTH MODE');

Deno.serve(app.fetch);
