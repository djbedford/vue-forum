import { reactive } from "vue";

const notifications = reactive([]);

const addNotification = ({ message, type = "info", timeout = null }) => {
  const id = Math.random() + Date.now();

  notifications.push({
    id,
    message,
    type
  });

  if (timeout) {
    setTimeout(() => removeNotification(id), timeout);
  }
};

const removeNotification = id => {
  const index = notifications.findIndex(notification => notification.id === id);

  notifications.splice(index, 1);
};

export default function useNotifications() {
  return {
    notifications,
    addNotification,
    removeNotification
  };
}
