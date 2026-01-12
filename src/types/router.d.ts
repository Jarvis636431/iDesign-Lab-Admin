import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    /**
     * 标记是否为公开路由（无需登录访问）
     */
    public?: boolean;
  }
}
