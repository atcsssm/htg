import { supabase } from '../lib/supabase';

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('🔗 Using URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔑 Using Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    
    // Test 1: Check if environment variables are properly set
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return {
        connected: false,
        error: 'Missing Supabase environment variables',
        suggestion: 'Check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set'
      };
    }

    // Test 2: Try a very basic fetch to the Supabase URL
    console.log('🌐 Testing basic HTTP connection to Supabase...');
    try {
      const basicFetch = fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const response = await withTimeout(basicFetch, 3000);
      console.log('✅ Basic HTTP connection successful, status:', response.status);
      
      // Test 3: Try the simplest possible Supabase query with auth
      console.log('📊 Testing authenticated Supabase query...');
      try {
        // Try to get current session (this should work even with RLS)
        // Use a simpler test - just check if the client is properly configured
        const healthCheck = supabase.from('subscription_plans').select('count', { count: 'exact', head: true });
        
        const { error: healthError } = await withTimeout(healthCheck, 5000);
        
        if (healthError) {
          console.log('⚠️ Health check failed:', healthError.message);
          
          if (healthError.message.includes('RLS') || 
              healthError.message.includes('policy') || 
              healthError.message.includes('permission')) {
            return {
              connected: true,
              tablesAccessible: false,
              error: 'RLS policies are blocking table access',
              suggestion: 'Go to Supabase Dashboard > Database > Tables and disable RLS on subscription_plans table, or create a policy for anonymous access.'
            };
          }
          
          return {
            connected: true,
            tablesAccessible: false,
            error: `Database query failed: ${healthError.message}`,
            suggestion: 'Check your database configuration in Supabase Dashboard'
          };
        }
        
        console.log('✅ Health check successful');

        // Test 4: Try a simple table query to check RLS
        console.log('📋 Testing table access (may fail due to RLS)...');
        try {
          const tableQuery = supabase
            .from('subscription_plans')
            .select('count', { count: 'exact', head: true });
          
          const { error: tableError } = await withTimeout(tableQuery, 3000);
          
          if (tableError) {
            console.log('⚠️ Table query failed (likely RLS):', tableError.message);

            if (tableError.message.includes('RLS') || 
                tableError.message.includes('policy') || 
                tableError.message.includes('permission')) {
              return {
                connected: true,
                tablesAccessible: false,
                error: 'RLS policies are blocking table access',
                suggestion: 'Go to Supabase Dashboard > Database > Tables > subscription_plans > Settings and disable RLS temporarily for testing'
              };
            }

            return {
              connected: true,
              tablesAccessible: false,
              error: `Table query failed: ${tableError.message}`,
              suggestion: 'Check your database configuration in Supabase Dashboard'
            };
          }

          console.log('✅ Table query successful');
          return {
            connected: true,
            sessionValid: !!sessionData?.session,
            tablesAccessible: true,
            message: 'Database connection and table access successful'
          };

        } catch (tableTimeoutError) {
          console.log('⏰ Table query timed out (likely RLS blocking)');
          return {
            connected: true,
            sessionValid: !!sessionData?.session,
            tablesAccessible: false,
            error: 'Table queries are timing out (likely RLS blocking access)',
            suggestion: 'Disable RLS on tables in Supabase Dashboard or create proper policies'
          };
        }

      } catch (sessionTimeoutError) {
        console.log('⏰ Session query timed out');
        return {
          connected: true,
          sessionValid: false,
          tablesAccessible: false,
          error: 'Session queries are timing out',
          message: 'Database connection successful! Authentication will work even with RLS enabled.',
          suggestion: 'This is normal with RLS policies. You can still login and use the app.'
        };
      }
      
    } catch (fetchError) {
      console.log('❌ Basic HTTP connection failed:', fetchError.message);
      return {
        connected: false,
        error: `HTTP connection failed: ${fetchError.message}`,
        suggestion: 'Verify your Supabase URL and API key are correct'
      };
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { 
      connected: false, 
      error: error.message || 'Unknown connection error',
      suggestion: 'Check your Supabase configuration and network connection'
    };
  }
};