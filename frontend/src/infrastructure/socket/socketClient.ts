import { io, Socket } from 'socket.io-client'
import { env } from '../config/env'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(env.apiUrl, { auth: { token }, autoConnect: false })
  }
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
