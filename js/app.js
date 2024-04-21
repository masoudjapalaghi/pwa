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
    return await res.json();
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
// add Product without db
// const productForm = document.querySelector(".productForm");

// const addNewProduct = async (e) => {
//   e.preventDefault();
//   const nameProduct = e.target.productName.value;
//   const newProduct = {
//     title: nameProduct,
//   };
//   await fetch("https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(newProduct),
//   });
// };
// productForm.addEventListener("submit", addNewProduct);

// add Product
const productForm = document.querySelector(".productForm");

const addNewProduct = async (e) => {
  e.preventDefault();
  const nameProduct = e.target.productName.value;

  const newProduct = {
    title: nameProduct,
    clientId: Math.floor(Math.random() * 100000000) + 1,
  };
  if ( !navigator.onLine && "serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((sw) => {
      // added to db
      db.syncProducts
        .put(newProduct)
        .then(() => console.info("product add to db successfully "))
        .catch((err) => console.error("product add to db : ", err));

      return sw.sync
        .register("add-new-product")
        .then(() => console.log("Task added successfully for background sync :))"))
        .catch((err) => console.error("Error =>", err));
    });
  } else {
    await fetch("https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });
  }
};

productForm.addEventListener("submit", addNewProduct);
