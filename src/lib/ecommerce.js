export const getProducts = async () => {
  return [
    { id: "1", name: "Premium AI Node", price: 99, image: "/node1.png" },
    { id: "2", name: "Enterprise Neural Link", price: 199, image: "/node2.png" }
  ];
};

export const getProductById = async (id) => {
  const products = await getProducts();
  return products.find(p => p.id === id) || products[0];
};
