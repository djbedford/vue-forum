export const findById = (resources, id) => {
  if (!resources) {
    return null;
  }

  return resources.find(resource => resource.id === id);
};

export const upsert = (resources, resource) => {
  const index = resources.findIndex(r => r.id === resource.id);

  if (resource.id && index !== -1) {
    resources[index] = resource;
  } else {
    resources.push(resource);
  }
};

export const docToResource = doc => {
  if (typeof doc?.data !== "function") {
    return doc;
  }

  return {
    id: doc.id,
    ...doc.data()
  };
};
