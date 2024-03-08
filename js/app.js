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

const fetchCourse = async () => {
  const res = await fetch("https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists");
  try {
    const data = await res.json();
    const products = [];

    for (let product in data) {
      courses.push(data[product]);
    }
    return products;
  } catch (err) {
    const data = await db.products.toArray();
    return data;
  }
};
window.addEventListener("load", async () => {
  const courses = await fetchCourse();
  createUi(courses);
});

const createUi = (items) => {
  const coursesParent = document.querySelector("#products-parent");
  items.forEach((item) => {
    coursesParent.insertAdjacentHTML(
      "beforeend",
      `
      <div class="card" style="width: 18rem">
      <img src="${item.imageSrc.includes("/img") ? `./assets/${item.imageSrc}` : item.imageSrc}" class="card-img-top" alt="Course Cover" />
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
      </div>
    </div>
    `
    );
  });
};
