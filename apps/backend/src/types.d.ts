declare module 'cache-manager-redis-store' {
  import { CacheStoreFactory } from '@nestjs/cache-manager';
  const redisStore: CacheStoreFactory;
  export = redisStore;
}
