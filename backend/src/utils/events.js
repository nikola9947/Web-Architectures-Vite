const clients = new Set()

export const addClient = (res) => {
  clients.add(res)

  res.write(`event: connected\n`)
  res.write(`data: {"message":"SSE connected"}\n\n`)

  return () => {
    clients.delete(res)
  }
}

export const sendEventToClients = (eventName, data = {}) => {
  const payload = JSON.stringify(data)

  clients.forEach((client) => {
    client.write(`event: ${eventName}\n`)
    client.write(`data: ${payload}\n\n`)
  })
}