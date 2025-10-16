import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('idesignlab_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('idesignlab_token')
      localStorage.removeItem('idesignlab_user')
    }
    return Promise.reject(error)
  }
)

export default http
