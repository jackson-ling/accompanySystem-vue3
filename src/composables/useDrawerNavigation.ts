import { useRouter, type RouteLocationRaw } from 'vue-router';
import type { Ref } from 'vue';

/**
 * 抽屉导航逻辑复用 Hook
 * 用于解决抽屉关闭时直接跳转导致的页面抖动问题
 * 实现：关闭抽屉 -> 等待动画结束 -> 路由跳转
 *
 * @param drawerVisible 控制抽屉显示的 Ref
 * @returns 包含延迟跳转方法的对象
 */
export function useDrawerNavigation(drawerVisible: Ref<boolean>) {
    const router = useRouter();

    /**
     * 延迟跳转
     * @param to 目标路由
     * @param delay 延迟时间(ms)，默认 350ms (略大于一般动画时间 300ms)
     */
    const navigateWithDelay = (to: RouteLocationRaw, delay = 350) => {
        drawerVisible.value = false;
        setTimeout(() => {
            router.push(to);
        }, delay);
    };

    /**
     * 延迟返回
     * @param delay 延迟时间(ms)
     */
    const backWithDelay = (delay = 350) => {
        drawerVisible.value = false;
        setTimeout(() => {
            router.back();
        }, delay);
    };

    return {
        navigateWithDelay,
        backWithDelay
    };
}
