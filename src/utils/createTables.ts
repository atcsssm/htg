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

export const createDatabaseTables = async () => {
  try {
    console.log('🔧 Adding sample data to existing tables...');
    console.log('🔍 Testing table access with timeout...');
    
    try {
      // Test if we can access subscription_plans table with a 5-second timeout
      const testPromise = supabase
        .from('subscription_plans')
        .select('id')
        .limit(1);
      
      const { data: existingPlans, error: plansError } = await withTimeout(testPromise, 5000);
      
      if (plansError) {
        console.log('❌ Table access failed:', plansError.message);
        
        if (plansError.message.includes('RLS') || 
            plansError.message.includes('policy') || 
            plansError.message.includes('permission')) {
          return {
            success: false,
            error: 'RLS policies are blocking table access',
            suggestion: 'Go to Supabase Dashboard > Database > Tables and disable RLS on subscription_plans table, or create a policy for anonymous access.'
          };
        }
        
        return {
          success: false,
          error: `Table access failed: ${plansError.message}`,
          suggestion: 'Check your database configuration in Supabase Dashboard'
        };
      }
      
      console.log('✅ Table access successful');
      
      // Check if subscription plans exist
      if (!existingPlans || existingPlans.length === 0) {
        console.log('📋 Creating sample subscription plans...');
        
        const insertPromise = supabase
          .from('subscription_plans')
          .insert([
            {
              name: 'Basic Plan',
              description: 'Perfect for beginners',
              price: 99.00,
              duration_days: 30,
              features: ['MLM Tree Access', 'Basic Dashboard', 'Email Support'],
              is_active: true
            },
            {
              name: 'Premium Plan',
              description: 'For serious entrepreneurs',
              price: 199.00,
              duration_days: 30,
              features: ['MLM Tree Access', 'Advanced Dashboard', 'Priority Support', 'Analytics'],
              is_active: true
            }
          ]);
        
        const { error: insertError } = await withTimeout(insertPromise, 10000);
        
        if (insertError) {
          console.log('❌ Insert failed:', insertError.message);
          return {
            success: false,
            error: `Failed to create subscription plans: ${insertError.message}`,
            suggestion: 'Check if RLS policies allow INSERT operations for anonymous users.'
          };
        }
        
        console.log('✅ Sample subscription plans created!');
      } else {
        console.log('📋 Subscription plans already exist');
      }
      
      console.log('✅ Database setup completed successfully!');
      return { 
        success: true, 
        message: 'Sample data added successfully. Tables are accessible.' 
      };
      
    } catch (timeoutError) {
      console.log('⏰ Database operations timed out');
      return {
        success: false,
        error: 'Database operations are timing out (likely RLS blocking access)',
        suggestion: 'Disable RLS on tables in Supabase Dashboard or create proper policies for anonymous access'
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred',
      suggestion: 'Check your Supabase connection and RLS policies'
    };
  }
};