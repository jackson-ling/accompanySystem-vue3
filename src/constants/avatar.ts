/**
 * 默认头像配置
 */

// 默认陪诊师头像
export const DEFAULT_COMPANION_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 默认用户头像
export const DEFAULT_USER_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

/**
 * 获取陪诊师头像，如果为空则返回默认头像
 * @param avatar 头像URL
 * @returns 头像URL
 */
export function getCompanionAvatar(avatar?: string): string {
  return avatar || DEFAULT_COMPANION_AVATAR
}

/**
 * 获取用户头像，如果为空则返回默认头像
 * @param avatar 头像URL
 * @returns 头像URL
 */
export function getUserAvatar(avatar?: string): string {
  return avatar || DEFAULT_USER_AVATAR
}
