// Session debugging and management utilities
import { sessionManager } from '../lib/supabase';
import { sessionUtils } from './sessionUtils';

export const sessionDebugUtils = {
    // Log current session status
    logSessionStatus: () => {
        console.group('📊 Session Status Debug');

        try {
            const currentUserId = sessionStorage.getItem('current-user-id');
            const sessionInfo = sessionUtils.getSessionInfo();
            const adminToken = sessionStorage.getItem('admin_session_token');

            console.log('Current User ID:', currentUserId);
            console.log('Session Valid:', sessionInfo.isValid);
            console.log('Session Expires At:', sessionInfo.expiresAt ? new Date(sessionInfo.expiresAt * 1000).toISOString() : 'N/A');
            console.log('Time Remaining:', sessionInfo.timeRemaining ? `${sessionInfo.timeRemaining}s` : 'N/A');
            console.log('Admin Token Present:', !!adminToken);
            console.log('Current Path:', window.location.pathname);
            console.log('Is Public Page:', sessionUtils.isPublicPage());
            console.log('Is Admin Area:', sessionUtils.isInAdminArea());
            console.log('Is Login Page:', sessionUtils.isOnLoginPage());

            // List all session-related items in sessionStorage
            const sessionKeys = Object.keys(sessionStorage).filter(key =>
                key.startsWith('supabase-session-') || key === 'current-user-id' || key === 'admin_session_token'
            );
            console.log('Session Storage Keys:', sessionKeys);

        } catch (error) {
            console.error('Error in session status debug:', error);
        }

        console.groupEnd();
    },

    // Clear all session data and log the action
    clearAllSessionsDebug: () => {
        console.log('🧹 Clearing all session data...');
        sessionUtils.clearAllSessions();
        console.log('✅ All session data cleared');
        sessionDebugUtils.logSessionStatus();
    },

    // Test session restoration
    testSessionRestore: async () => {
        console.group('🔄 Testing Session Restoration');

        try {
            const beforeRestore = sessionUtils.getSessionInfo();
            console.log('Before restore - Session valid:', beforeRestore.isValid);

            const restoredSession = await sessionManager.restoreSession();
            console.log('Restore result:', !!restoredSession);

            const afterRestore = sessionUtils.getSessionInfo();
            console.log('After restore - Session valid:', afterRestore.isValid);

        } catch (error) {
            console.error('Error testing session restore:', error);
        }

        console.groupEnd();
    },

    // Validate session storage integrity
    validateSessionStorage: () => {
        console.group('🔍 Validating Session Storage Integrity');

        try {
            const currentUserId = sessionStorage.getItem('current-user-id');

            if (currentUserId) {
                const sessionKey = `supabase-session-${currentUserId}`;
                const sessionData = sessionStorage.getItem(sessionKey);

                if (sessionData) {
                    try {
                        const parsed = JSON.parse(sessionData);
                        console.log('✅ Session data is valid JSON');
                        console.log('Session user ID matches:', parsed.user?.id === currentUserId);

                        const now = Math.floor(Date.now() / 1000);
                        const isExpired = parsed.expires_at && parsed.expires_at <= now;
                        console.log('Session expired:', isExpired);

                        if (isExpired) {
                            console.warn('⚠️ Session is expired but still in storage');
                        }

                    } catch (parseError) {
                        console.error('❌ Invalid JSON in session storage:', parseError);
                    }
                } else {
                    console.warn('⚠️ Current user ID exists but no session data found');
                }
            } else {
                console.log('ℹ️ No current user ID in storage');
            }

            // Check for orphaned sessions
            const allKeys = Object.keys(sessionStorage);
            const sessionKeys = allKeys.filter(key => key.startsWith('supabase-session-'));
            const orphanedSessions = sessionKeys.filter(key => {
                const userId = key.replace('supabase-session-', '');
                return userId !== currentUserId;
            });

            if (orphanedSessions.length > 0) {
                console.warn('⚠️ Found orphaned sessions:', orphanedSessions);
            } else {
                console.log('✅ No orphaned sessions found');
            }

        } catch (error) {
            console.error('Error validating session storage:', error);
        }

        console.groupEnd();
    },

    // Setup debug commands on window object (for development)
    setupDebugCommands: () => {
        if (typeof window !== 'undefined' && import.meta.env.DEV) {
            (window as any).sessionDebug = {
                status: sessionDebugUtils.logSessionStatus,
                clear: sessionDebugUtils.clearAllSessionsDebug,
                restore: sessionDebugUtils.testSessionRestore,
                validate: sessionDebugUtils.validateSessionStorage,
                info: sessionUtils.getSessionInfo,
                refresh: sessionUtils.refreshSession
            };

            console.log('🛠️ Session debug commands available on window.sessionDebug');
            console.log('Available commands: status, clear, restore, validate, info, refresh');
        }
    }
};

// Setup debug commands in development
if (import.meta.env.DEV) {
    sessionDebugUtils.setupDebugCommands();
}

export default sessionDebugUtils;