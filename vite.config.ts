import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Custom plugin to handle uni-app conditional compilation comments
const uniConditionalCompile = (): Plugin => {
  return {
    name: 'uni-conditional-compile',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('uview-plus') && /\.(vue|js|ts|scss|css)$/.test(id)) {
        // 1. Remove wxs scripts globally first
        code = code.replace(/<script[\s\S]*?lang=["']wxs["'][\s\S]*?>[\s\S]*?<\/script>/g, '')

        // 2. Line-by-line conditional compilation processing
        const lines = code.split(/\r?\n/)
        const newLines: string[] = []
        const stack: boolean[] = [] // true = keep, false = drop

        // Regex for conditional comments (anchored to start of line to avoid false positives in strings)
        // Matches: // #ifdef XXX, <!-- #ifdef XXX -->, // #ifndef XXX, <!-- #ifndef XXX -->
        const startRegex = /^\s*(?:<!--|\/\/)\s*#(ifdef|ifndef)\s+([A-Za-z0-9_-]+)/
        const endRegex = /^\s*(?:<!--|\/\/)\s*#endif/

        const ENV: Record<string, boolean> = {
          VUE3: true,
          VUE2: false,
          H5: true,
          'APP-NVUE': false,
          MP: false,
          'MP-WEIXIN': false,
          'MP-ALIPAY': false,
          'MP-BAIDU': false,
          'MP-TOUTIAO': false,
          'MP-QQ': false,
          'MP-LARK': false,
          'MP-JD': false,
          'MP-360': false,
          'QUICKAPP-WEBVIEW': false,
          'QUICKAPP-WIDGET': false,
        }

        const shouldKeep = () => stack.every((s) => s)

        for (const line of lines) {
          const startMatch = line.match(startRegex)
          const endMatch = line.match(endRegex)

          if (startMatch) {
            const type = startMatch[1] // ifdef or ifndef
            const key = startMatch[2] // VUE3, H5, etc.

            let isDefined = false
            // Handle MP wildcards if key starts with MP but not in ENV explicitly
            if (key.startsWith('MP') && !ENV.hasOwnProperty(key)) {
              isDefined = false
            } else if (ENV.hasOwnProperty(key)) {
              isDefined = ENV[key]
            } else {
              // If unknown key, assume false? or true?
              // Usually safe to assume false if it's a platform specific flag
              isDefined = false
            }

            let keepBlock = type === 'ifdef' ? isDefined : !isDefined

            stack.push(keepBlock)
            newLines.push('') // Replace comment line with empty line
            continue
          }

          if (endMatch) {
            if (stack.length > 0) {
              stack.pop()
            }
            newLines.push('') // Replace comment line with empty line
            continue
          }

          if (shouldKeep()) {
            newLines.push(line)
          } else {
            newLines.push('') // Replace excluded code with empty line
          }
        }

        return newLines.join('\n')
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // 指定部署子路径
  base: mode === 'development' ? '/' : '/demo/',
  plugins: [uniConditionalCompile(), vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "uview-plus/theme.scss";`,
      },
    },
  },
}))
