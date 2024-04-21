var db = new Dexie("productList");
const dbVersion = 5;

db.version(dbVersion).stores({
  products: "id",
  syncProducts: "clientId",
});
