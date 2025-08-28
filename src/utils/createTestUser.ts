import { supabase } from '../lib/supabase';

export const createTestUser = async () => {
  try {
    console.log('Creating test user...');
    
    let userId: string;
    
    // Try to sign in first to avoid "User already registered" error
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });

    if (signInError && (signInError.message.includes('Invalid login credentials') || signInError.message.includes('Email not confirmed'))) {
      console.log('User does not exist, creating new user...');
      
      // User doesn't exist, create them
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      });

      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      if (!authData.user) {
        console.error('No user data returned');
        return;
      }

      userId = authData.user.id;
      console.log('Auth user created:', userId);
    } else if (signInError) {
      console.error('Sign in error:', signInError);
      return;
    } else {
      if (!signInData.user) {
        console.error('No user data returned from sign in');
        return;
      }

      userId = signInData.user.id;
      console.log('Signed in existing user:', userId);
    }

    // Upsert into users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'test@example.com',
        user_type: 'customer',
        is_verified: true,
        email_verified: true,
        mobile_verified: true,
        is_active: true
      }, {
        onConflict: 'id'
      });

    if (userError) {
      console.error('User upsert error:', userError);
      return;
    }

    console.log('User record created/updated');

    // Upsert into user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        mobile: '+1234567890',
        gender: 'male',
        parent_account: null
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return;
    }

    console.log('Profile record created/updated');
    console.log('✅ Test user created/updated successfully!');
    console.log('📧 Email: test@example.com');
    console.log('👤 Username: testuser');
    console.log('🔑 Password: password123');
    
    return {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123'
    };
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};