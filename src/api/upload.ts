import request from '@/utils/request'
import type { UploadResult } from '@/types/api'

export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<any, UploadResult>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
