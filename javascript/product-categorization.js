let categories = [];
let jsonProducts = [];
let products = JSON.parse(localStorage.getItem("products")) || [];

// Kategorileri JSON dosyasından yükle
function fetchCategories() {
  fetch("categories.json")
    .then((response) => response.json())
    .then((data) => {
      categories = data;
      populateCategoryDropdown();
      populateCategoryFilter(); 
      populatePricingTable(categories);
    })
    .catch((error) => console.error("Error fetching categories:", error));
}

// Productu kategoriye ata ve fiyatı al
function assignCategoryAndPrice(weight) {
  const category = categories.find(
    (cat) =>
      weight >= cat.minWeight && (cat.maxWeight === null || weight <= cat.maxWeight)
  );
  return category
    ? { name: category.name, pricePerKg: category.pricePerKg }
    : { name: "Unknown", pricePerKg: 0 };
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProductsForPackaging();  
  fetchCategories(); 
  populateCategoryFilter(); 

  const productDropdown = document.getElementById("product-name-dropdown");
  const quantityInput = document.getElementById("quantity-select");
  productDropdown.addEventListener("change" , function(){
    currentPurchase =  JSON.parse(localStorage.getItem("purchases")).find((purchase) => purchase.productName === productDropdown.value);
    quantityInput.value = currentPurchase ? currentPurchase.quantity : 0;
  });

  const productWeightInput = document.getElementById("product-weight");
  const stockInput = document.getElementById("product-stock");
  productWeightInput.addEventListener("change" , function(){
    const productWeight = parseFloat(document.getElementById("product-weight").value.trim());
    stockInput.value = (parseFloat(quantityInput.value) * productWeight) / 1000 ;
  });

  // JSONdan ürünleri al ve jsonProductsa ata
  fetch("products.json")
    .then((response) => response.json())
    .then((data) => {
      jsonProducts = data;
      products = mergeProducts(products, jsonProducts); // localStorage ve JSON ürünlerini birleştir
      localStorage.setItem("products", JSON.stringify(products)); // Birleşik veriyi kaydet
      displayProducts(); // Ürünleri tabloya yazdır
    })
    .catch((error) => console.error("Error fetching products:", error));
});

// Product ekleme işlemi
document.getElementById("add-product-form").addEventListener("submit", (event) => {
  event.preventDefault(); // Formun varsayılan gönderim işlemini engelle

  const productName = document.getElementById("product-name-dropdown").value.trim();
  const productWeight = parseFloat(document.getElementById("product-weight").value.trim());
  const productStock = parseFloat(document.getElementById("product-stock").value.trim());
  const categoryName = document.getElementById("category-name").value.trim();

  if (!productName || isNaN(productWeight) || isNaN(productStock) || categoryName === "Unknown") {
    alert("Please fill in all fields correctly!");
    return;
  }

  const newProduct = {
    productName: productName, 
    weight: productWeight,
    category: categoryName,
    totalStock: productStock,
  };

  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products)); 
  displayProducts(); 
  document.getElementById("add-product-form").reset();
  alert("Product added successfully!");
});

// Productları tabloya yazdırma
function displayProducts() {
  const tableBody = document.querySelector("#product-table tbody");
  tableBody.innerHTML = ""; 

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName || "N/A"}</td> <!-- productName olarak kullan -->
      <td>${product.weight || "N/A"} g</td>
      <td>${product.category || "N/A"}</td>
      <td>${product.totalStock || 0} kg</td>
    `;
    tableBody.appendChild(row);
  });
}

// Kategoriyi güncelleme 
document.getElementById("update-category-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCategoryName = document.getElementById("select-category").value.trim();
  const newMinWeight = parseFloat(document.getElementById("update-min-weight").value.trim());
  const newMaxWeight = parseFloat(document.getElementById("update-max-weight").value.trim());
  const newPricePerKg = parseFloat(document.getElementById("update-price").value.trim());

  if (!selectedCategoryName || isNaN(newMinWeight) || isNaN(newMaxWeight) || isNaN(newPricePerKg)) {
    alert("All fields must be filled with valid values!");
    return;
  }
  let categoryToUpdate = categories.find((category) => category.name === selectedCategoryName);
  
  if (categoryToUpdate) {
    categoryToUpdate.minWeight = newMinWeight;
    categoryToUpdate.maxWeight = newMaxWeight;
    categoryToUpdate.pricePerKg = newPricePerKg;

    localStorage.setItem("categories", JSON.stringify(categories));
    populatePricingTable(categories);

    alert("Category updated successfully!");
    document.getElementById("update-category-form").reset();
  } else {
    alert("Category not found!");
  }
});

function populatePricingTable(categories) {
  const pricingTableBody = document.querySelector("#pricing-table tbody");
  pricingTableBody.innerHTML = ''; 

  categories.forEach(category => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.name}</td>
      <td>${category.minWeight}</td>
      <td>${category.maxWeight !== null ? category.maxWeight : 'N/A'}</td>
      <td>${category.pricePerKg.toFixed(2)}</td>
    `;
    pricingTableBody.appendChild(row);
  });
}

// Toplam maliyet hesabı
document.getElementById("calculate-cost-button").addEventListener("click", () => {
  const selectedCategory = document.getElementById("select-category-for-cost").value;
  const quantity = parseFloat(document.getElementById("quantity-for-cost").value.trim());

  if (!selectedCategory || isNaN(quantity) || quantity <= 0) {
    alert("Please select a category and enter a valid quantity!");
    return;
  }
  const category = categories.find((cat) => cat.name === selectedCategory);

  if (category) {
    const totalCost = (category.pricePerKg * quantity).toFixed(2);
    document.getElementById("total-cost-display").textContent = `Total Cost: $${totalCost}`;
  } else {
    alert("Selected category not found!");
  }
});

//weight girildiğinde kategoriyi ve fiyatı otomatik doldur
document.getElementById("product-weight").addEventListener("blur", () => {
  const weight = parseFloat(document.getElementById("product-weight").value.trim());
  if (!isNaN(weight)) {
    const { name, pricePerKg } = assignCategoryAndPrice(weight);
    document.getElementById("category-name").value = name || "Unknown";

    if (name !== "Unknown") {
      alert(`Selected Category: ${name}\nPrice per Kg: $${pricePerKg}`);
    }
  }
});

//Kategorilere göre filtreleme 
function filterProductsByCategory() {
  const selectedCategory = document.getElementById("category-filter").value;
  const tableBody = document.querySelector("#product-table tbody");
  tableBody.innerHTML = ""; 

  //filtrele
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(product => product.category === selectedCategory);

  //Filtrelenmiş ürünleri tabloya ekle
  filteredProducts.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.weight} g</td>
      <td>${product.category}</td>
      <td>${product.totalStock} kg</td>
    `;
    tableBody.appendChild(row);
  });
}

document.getElementById("category-filter").addEventListener("change", filterProductsByCategory);

// Dropdown'ları doldur
function populateCategoryDropdown() {
  const dropdowns = [document.getElementById("select-category"), document.getElementById("select-category-for-cost")];
  dropdowns.forEach((dropdown) => {
    dropdown.innerHTML = '<option value="">Select Category</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      dropdown.appendChild(option);
    });
  });
}

function fetchProductsForPackaging() {
  const localProducts = JSON.parse(localStorage.getItem("purchases")) || [];
  
  fetch("purchases.json")
    .then(response => response.json())
    .then(data => {
      // JSON ve localStorage verilerini birleştir
      const allProducts = mergeProducts(localProducts, data);
      const productDropdown = document.getElementById("product-name-dropdown");
      productDropdown.innerHTML = ''; 

      const defaultOption = document.createElement("option");//boş bir option ekleyelim
      defaultOption.value = '';
      defaultOption.textContent = 'Select Product'; 
      productDropdown.appendChild(defaultOption);

      // Ürünlerin adlarını set ile benzersiz hale getir
      const productNames = new Set();
      allProducts.forEach(purchase => {
        productNames.add(purchase.productName);
      });

      productNames.forEach(productName => {
        const option = document.createElement("option");
        option.value = productName;
        option.textContent = productName;
        productDropdown.appendChild(option);
      });
    })
    .catch(error => console.error("Error fetching purchases.json:", error));
}

function mergeProducts(localProducts, jsonProducts) {
  const merged = [...localProducts]; //LocalStorage ürünlerini öncelikli olarak ekle
  const productNames = new Set(localProducts.map(product => product.productName));

  //JSONdan eksik productları yükle
  jsonProducts.forEach(product => {
    if (!productNames.has(product.productName)) {
      merged.push(product);
      productNames.add(product.productName);
    }
  });
  return merged;
}

//Kategori filtreleme dropdown
function populateCategoryFilter() {
  const categoryFilter = document.getElementById("category-filter");
  categoryFilter.innerHTML = '<option value="All">All Categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}
