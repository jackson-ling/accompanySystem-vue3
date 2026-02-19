// uni-app shim for standard Vue 3 Web project
// Needed because uview-plus relies on the global 'uni' object

if (typeof window !== 'undefined') {
  const uniShim: any = {
    getSystemInfoSync: function () {
      return {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        safeArea: { top: 0, bottom: 0 },
        platform: 'devtools',
        pixelRatio: window.devicePixelRatio || 1,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        statusBarHeight: 0,
      }
    },
    upx2px: function (upx: number) {
      // 750upx = 100% width
      return (upx / 750) * window.innerWidth
    },
    rpx2px: function (rpx: number) {
      return (rpx / 750) * window.innerWidth
    },
    getLocale: function () {
      return 'zh-Hans'
    },
    setLocale: function (locale: string) {
      console.log('setLocale:', locale)
    },
    onLocaleChange: function (_callback: any) {
      // no-op for now
    },
    $u: {}, // uview-plus will attach to this
    createSelectorQuery: function () {
      const query = {
        in: function (_component: any) {
          return query
        },
        select: function (selector: string) {
          return {
            boundingClientRect: function (callback: any) {
              const el = document.querySelector(selector)
              if (el) {
                const rect = el.getBoundingClientRect()
                callback(rect)
              } else {
                callback(null)
              }
              return query
            },
            context: function (callback: any) {
              callback &&
                callback({
                  // mock context
                })
              return query
            },
            fields: function (props: any, callback: any) {
              const el = document.querySelector(selector)
              if (el) {
                const rect = el.getBoundingClientRect()
                const result: any = {}
                if (props.rect) Object.assign(result, rect)
                if (props.size) {
                  result.width = rect.width
                  result.height = rect.height
                }
                callback(result)
              } else {
                callback(null)
              }
              return query
            },
          }
        },
        selectAll: function (selector: string) {
          return {
            boundingClientRect: function (callback: any) {
              const els = document.querySelectorAll(selector)
              const rects = Array.from(els).map(function (el) {
                return el.getBoundingClientRect()
              })
              callback(rects)
              return query
            },
          }
        },
        exec: function (callback: any) {
          callback && callback()
        },
      }
      return query
    },
    onWindowResize: function (callback: any) {
      window.addEventListener('resize', callback)
    },
    requireNativePlugin: function () {
      return null
    },
    // Mock storage methods
    setStorage: function ({ key, data, success }: any) {
      localStorage.setItem(key, JSON.stringify(data))
      success && success()
    },
    getStorage: function ({ key, success }: any) {
      const data = localStorage.getItem(key)
      success && success({ data: data ? JSON.parse(data) : null })
    },
    getStorageSync: function (key: string) {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    },
    removeStorage: function ({ key, success }: any) {
      localStorage.removeItem(key)
      success && success()
    },
    removeStorageSync: function (key: string) {
      localStorage.removeItem(key)
    },
    // Mock toast
    showToast: function ({ title }: any) {
      console.log('Toast:', title)
    },
    hideToast: function () {},
    // Mock loading
    showLoading: function () {},
    hideLoading: function () {},
    // Mock modal
    showModal: function ({ title, content, success }: any) {
      const res = confirm(`${title}\n${content}`)
      success && success({ confirm: res, cancel: !res })
    },
  }

  // Attach to window
  ;(window as any).uni = uniShim
}

export {}
