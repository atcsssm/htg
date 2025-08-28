import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { sessionUtils } from '../../utils/sessionUtils';
import { supabase } from '../../lib/supabase';

const SessionWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const sessionInfo = sessionUtils.getSessionInfo();

      if (sessionInfo.isValid && sessionInfo.timeRemaining) {
        setTimeRemaining(sessionInfo.timeRemaining);
        setShowWarning(sessionUtils.isSessionExpiringSoon());
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh session:', error);
        // If refresh fails, clear the session
        const currentUserId = sessionStorage.getItem('current-user-id');
        sessionUtils.clearAllSessions();
      } else if (data.session) {
        // Save the refreshed session
        import('../../lib/supabase').then(({ sessionManager }) => {
          sessionManager.saveSession(data.session);
        });
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      sessionUtils.clearAllSessions();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!showWarning) return null;

  return (
      <div className="fixed top-20 right-4 z-50 max-w-sm">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-yellow-800">
                Session Expiring Soon
              </h4>
              <div className="mt-1 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  {sessionUtils.formatTimeRemaining(timeRemaining)} remaining
                </p>
              </div>
              <div className="mt-3">
                <button
                    onClick={handleRefreshSession}
                    disabled={isRefreshing}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRefreshing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Refreshing...</span>
                      </>
                  ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        <span>Extend Session</span>
                      </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SessionWarning;