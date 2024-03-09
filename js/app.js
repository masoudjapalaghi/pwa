if ("serviceWorker" in navigator) {
  console.log("support serviceWorker");
  navigator.serviceWorker
    .register("/sw.js")
    .then((register) => {
      console.log("registered service worker", register);
    })
    .catch((err) => {
      console.log("un registered", err);
    });
} else {
  console.log("Not support serviceWorker");
}

// dom manipulation
const fetchProducts = async () => {
  try {
    const res = await fetch("https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists");
    const data = await res.json();
    const products = [];

    for (let product in data) {
      products.push(data[product]);
    }
    return products;
  } catch (err) {
    return await db.products.toArray();
  }
};
window.addEventListener("load", async () => {
  const products = await fetchProducts();
  createUi(products);
});

const createUi = (items) => {
  const productsParent = document.querySelector("#products-parent");
  items.forEach((item) => {
    productsParent.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card" style="width: 18rem">
      <img src="${item.imageSrc.includes("/img") ? `./assets${item.imageSrc}` : item.imageSrc}" class="card-img-top" alt="Course Cover" />
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
      </div>
    </div>
    `
    );
  });
};

// add Product
const productForm = document.querySelector(".productForm");

const addNewProduct = (e) => {
  e.preventDefault();
  const nameProduct = e.target.productName.value;

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      // added to db
      const newProduct = {
        title: nameProduct,
      };
      db.syncProducts
        .put(newProduct)
        .then(() => console.log("product add to db suscefully "))
        .catch((err) => console.log("product add to db : ", err));

      return sw.sync
        .register("add-new-product")
        .then(() => console.log("Task added successfully :))"))
        .catch((err) => console.log("Error =>", err));
    });
  } else {
    // Fetch
  }
};

productForm.addEventListener("submit", addNewProduct);
