const clients = new Map();

export const addClient = (userId, res) => {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }

  clients.get(userId).add(res);

  res.write("event: connected\n");
  res.write('data: {"message":"SSE connected"}\n\n');

  return () => {
    const userClients = clients.get(userId);

    if (!userClients) return;

    userClients.delete(res);

    if (userClients.size === 0) {
      clients.delete(userId);
    }
  };
};

export const sendEventToUser = (userId, eventName, data = {}) => {
  const userClients = clients.get(userId);

  if (!userClients) return;

  const payload = JSON.stringify(data);

  userClients.forEach((client) => {
    client.write(`event: ${eventName}\n`);
    client.write(`data: ${payload}\n\n`);
  });
};

export const sendEventToClients = (eventName, data = {}) => {
  if (!data.userId) return;

  sendEventToUser(data.userId, eventName, data);
};