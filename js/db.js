var db = new Dexie("productList");
const dbVersion = 1;

db.version(dbVersion).stores({
  products: "id",
  syncProducts: "title",
});
