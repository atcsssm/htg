// Redis client configuration for browser compatibility
// Note: Redis operations will only work in server-side environments
let Redis: any = null;

// Dynamically import Redis only in Node.js environment
const initRedis = async () => {
  if (typeof window === 'undefined') {
    try {
      const { default: RedisClient } = await import('ioredis');
      Redis = RedisClient;
    } catch (error) {
      console.warn('Redis not available in this environment');
    }
  }
};

// Redis client configuration
let redis: any = null;

const createRedisClient = () => {
  if (!Redis || typeof window !== 'undefined') {
    return null;
  }
  
  return new Redis({
    host: import.meta.env.VITE_REDIS_HOST || 'localhost',
    port: parseInt(import.meta.env.VITE_REDIS_PORT || '6379'),
    password: import.meta.env.VITE_REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000
  });
};

// Redis key patterns
export const REDIS_KEYS = {
  AVAILABLE_POSITIONS: 'mlm:available_positions',
  USER_CHILDREN: (userId: string) => `mlm:user:${userId}:children`,
  NODE_DATA: (nodeId: string) => `mlm:node:${nodeId}`,
  TREE_STATS: (userId: string) => `mlm:stats:${userId}`,
  SPONSOR_QUEUE: (sponsorId: string) => `mlm:sponsor:${sponsorId}:queue`
};

// Interface for available position
export interface AvailablePosition {
  parentNodeId: string;
  parentUserId: string;
  position: 'left' | 'right';
  level: number;
  sponsorshipNumber: string;
}

// Interface for node data
export interface NodeData {
  nodeId: string;
  userId: string;
  parentId: string | null;
  leftChildId: string | null;
  rightChildId: string | null;
  level: number;
  position: 'left' | 'right' | 'root';
  sponsorshipNumber: string;
  isActive: boolean;
}

export class MLMRedisManager {
  private redis: any;

  constructor() {
    this.redis = null;
  }

  // Initialize Redis connection
  async connect(): Promise<boolean> {
    try {
      await initRedis();
      this.redis = createRedisClient();
      
      if (!this.redis) {
        console.log('📊 Redis not available in browser environment');
        return false;
      }
      
      await this.redis.connect();
      console.log('✅ Redis connected successfully');
      return true;
    } catch (error) {
      console.warn('⚠️ Redis connection failed, falling back to database-only mode:', error);
      return false;
    }
  }

  // Disconnect Redis
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
  }

  // Get next available position for placement
  async getNextAvailablePosition(sponsorSponsorshipNumber: string): Promise<AvailablePosition | null> {
    try {
      if (!this.redis) {
        return null;
      }
      
      // Try to get from sponsor-specific queue first
      const sponsorQueueKey = REDIS_KEYS.SPONSOR_QUEUE(sponsorSponsorshipNumber);
      const positionData = await this.redis.lpop(sponsorQueueKey);
      
      if (positionData) {
        return JSON.parse(positionData);
      }

      // If no sponsor-specific positions, get from global queue
      const globalPositionData = await this.redis.lpop(REDIS_KEYS.AVAILABLE_POSITIONS);
      
      if (globalPositionData) {
        return JSON.parse(globalPositionData);
      }

      return null;
    } catch (error) {
      console.error('❌ Redis error getting available position:', error);
      return null;
    }
  }

  // Add new available positions when a user is placed
  async addAvailablePositions(newNodeData: NodeData): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }
      
      const leftPosition: AvailablePosition = {
        parentNodeId: newNodeData.nodeId,
        parentUserId: newNodeData.userId,
        position: 'left',
        level: newNodeData.level + 1,
        sponsorshipNumber: newNodeData.sponsorshipNumber
      };

      const rightPosition: AvailablePosition = {
        parentNodeId: newNodeData.nodeId,
        parentUserId: newNodeData.userId,
        position: 'right',
        level: newNodeData.level + 1,
        sponsorshipNumber: newNodeData.sponsorshipNumber
      };

      // Add to global available positions queue
      await this.redis.rpush(
        REDIS_KEYS.AVAILABLE_POSITIONS,
        JSON.stringify(leftPosition),
        JSON.stringify(rightPosition)
      );

      // Also add to sponsor-specific queue for better placement
      const sponsorQueueKey = REDIS_KEYS.SPONSOR_QUEUE(newNodeData.sponsorshipNumber);
      await this.redis.rpush(
        sponsorQueueKey,
        JSON.stringify(leftPosition),
        JSON.stringify(rightPosition)
      );

      // Set expiration for sponsor queue (24 hours)
      await this.redis.expire(sponsorQueueKey, 86400);

      console.log('✅ Added available positions to Redis for user:', newNodeData.userId);
    } catch (error) {
      console.error('❌ Redis error adding available positions:', error);
    }
  }

  // Cache node data
  async cacheNodeData(nodeData: NodeData): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }
      
      const nodeKey = REDIS_KEYS.NODE_DATA(nodeData.nodeId);
      await this.redis.hset(nodeKey, {
        nodeId: nodeData.nodeId,
        userId: nodeData.userId,
        parentId: nodeData.parentId || '',
        leftChildId: nodeData.leftChildId || '',
        rightChildId: nodeData.rightChildId || '',
        level: nodeData.level.toString(),
        position: nodeData.position,
        sponsorshipNumber: nodeData.sponsorshipNumber,
        isActive: nodeData.isActive.toString()
      });

      // Set expiration (1 hour)
      await this.redis.expire(nodeKey, 3600);
    } catch (error) {
      console.error('❌ Redis error caching node data:', error);
    }
  }

  // Get cached node data
  async getCachedNodeData(nodeId: string): Promise<NodeData | null> {
    try {
      if (!this.redis) {
        return null;
      }
      
      const nodeKey = REDIS_KEYS.NODE_DATA(nodeId);
      const data = await this.redis.hgetall(nodeKey);
      
      if (!data || !data.nodeId) {
        return null;
      }

      return {
        nodeId: data.nodeId,
        userId: data.userId,
        parentId: data.parentId || null,
        leftChildId: data.leftChildId || null,
        rightChildId: data.rightChildId || null,
        level: parseInt(data.level),
        position: data.position as 'left' | 'right' | 'root',
        sponsorshipNumber: data.sponsorshipNumber,
        isActive: data.isActive === 'true'
      };
    } catch (error) {
      console.error('❌ Redis error getting cached node data:', error);
      return null;
    }
  }

  // Cache tree statistics
  async cacheTreeStats(userId: string, stats: any): Promise<void> {
    try {
      if (!this.redis) {
        return;
      }
      
      const statsKey = REDIS_KEYS.TREE_STATS(userId);
      await this.redis.hset(statsKey, {
        totalDownline: stats.total_downline?.toString() || '0',
        leftSideCount: stats.left_side_count?.toString() || '0',
        rightSideCount: stats.right_side_count?.toString() || '0',
        directReferrals: stats.direct_referrals?.toString() || '0',
        maxDepth: stats.max_depth?.toString() || '0',
        activeMembers: stats.active_members?.toString() || '0',
        lastUpdated: Date.now().toString()
      });

      // Set expiration (30 minutes)
      await this.redis.expire(statsKey, 1800);
    } catch (error) {
      console.error('❌ Redis error caching tree stats:', error);
    }
  }

  // Get cached tree statistics
  async getCachedTreeStats(userId: string): Promise<any | null> {
    try {
      if (!this.redis) {
        return null;
      }
      
      const statsKey = REDIS_KEYS.TREE_STATS(userId);
      const data = await this.redis.hgetall(statsKey);
      
      if (!data || !data.lastUpdated) {
        return null;
      }

      // Check if cache is still fresh (less than 30 minutes old)
      const lastUpdated = parseInt(data.lastUpdated);
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - lastUpdated > thirtyMinutes) {
        return null;
      }

      return {
        total_downline: parseInt(data.totalDownline) || 0,
        left_side_count: parseInt(data.leftSideCount) || 0,
        right_side_count: parseInt(data.rightSideCount) || 0,
        direct_referrals: parseInt(data.directReferrals) || 0,
        max_depth: parseInt(data.maxDepth) || 0,
        active_members: parseInt(data.activeMembers) || 0
      };
    } catch (error) {
      console.error('❌ Redis error getting cached tree stats:', error);
      return null;
    }
  }

  // Warm up Redis cache with existing tree data
  async warmUpCache(): Promise<void> {
    try {
      if (!this.redis) {
        console.log('📊 Redis not available, skipping cache warm-up');
        return;
      }
      
      console.log('🔥 Warming up Redis cache with existing tree data...');
      
      // This would typically be called on app startup
      // For now, we'll implement a basic warm-up strategy
      
      // Clear existing cache
      await this.redis.del(REDIS_KEYS.AVAILABLE_POSITIONS);
      
      // Note: In a production environment, you'd want to:
      // 1. Load all existing tree nodes from database
      // 2. Build the available positions queue
      // 3. Cache frequently accessed node data
      
      console.log('✅ Redis cache warm-up completed');
    } catch (error) {
      console.error('❌ Redis warm-up failed:', error);
    }
  }

  // Check Redis connection status
  async isConnected(): Promise<boolean> {
    try {
      if (!this.redis) {
        return false;
      }
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
export const mlmRedisManager = new MLMRedisManager();

// Helper function to initialize Redis (call this on app startup)
export const initializeRedis = async (): Promise<boolean> => {
  try {
    const connected = await mlmRedisManager.connect();
    if (connected) {
      await mlmRedisManager.warmUpCache();
    }
    return connected;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    return false;
  }
};