
//product-categorization.js ile aynı HTML'e yani product-categorization.html'e bağlılar

let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

// localStorage üzerinden productsa eriş
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function fetchAndStoreProducts() {
  fetch("products.json") 
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("products", JSON.stringify(data)); // localStorage'a kaydet
      console.log("Products stored in localStorage:", data);
    })
    .catch((error) => console.error("Error fetching products.json:", error));
}

function populateInventoryDropdown() {
  const categoryDropdown = document.getElementById("select-category-for-inventory");

  if (categoryDropdown) {
    categoryDropdown.innerHTML = '<option value="">Select Category</option>';

    if (!inventory || inventory.length === 0) {
      console.error("No categories available to populate dropdown.");
      return;
    }
    // inventoryden kategorileri al
    const categories = inventory.map(item => item.category);

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryDropdown.appendChild(option);
    });
  } else {
    console.error("Error: 'select-category-for-inventory' dropdown not found.");
  }
}

function calculateCurrentStock(category) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  console.log("Products loaded for stock calculation:", products); 
  // Kategoriye göre filtrele, toplam stoğu hesapla
  const totalStockForCategory = products
    .filter((product) => product.category === category)
    .reduce((sum, product) => sum + (product.totalStock || 0), 0);

  console.log(`Category: ${category}, Total Stock: ${totalStockForCategory}`);
  return totalStockForCategory;
}

// Kategori seçildiğinde mevcut stoğu, minimum stok eşiğini ve diğer bilgileri görüntüleme
document.getElementById("select-category-for-inventory").addEventListener("change", () => {
  const selectedCategory = document.getElementById("select-category-for-inventory").value;

  if (selectedCategory) {
    const totalStock = calculateCurrentStock(selectedCategory);
    document.getElementById("current-stock").value = `${totalStock || 0} g`;

    const inventoryItem = inventory.find((item) => item.category === selectedCategory);
    if (inventoryItem) {
      document.getElementById("min-stock-threshold").value = inventoryItem.minimumStockThreshold || 0;
      document.getElementById("restock-date").value = inventoryItem.restockDate || "";
      document.getElementById("storage-location").value = inventoryItem.storageLocation || "";
    }
  } else {
    document.getElementById("current-stock").value = "0";
    document.getElementById("min-stock-threshold").value = "";
    document.getElementById("restock-date").value = "";
    document.getElementById("storage-location").value = "";
  }
});

// Stoğu ve eşik değerini güncelle
document.getElementById("update-inventory-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCategory = document.getElementById("select-category-for-inventory").value;
  const minStockThreshold = parseFloat(document.getElementById("new-stock").value) || 0; 
  const restockDate = document.getElementById("restock-date").value; 
  const storageLocation = document.getElementById("storage-location").value;

  if (!selectedCategory) {
    alert("Please select a category!");
    return;
  }

  let inventoryItem = inventory.find((item) => item.category === selectedCategory);

  if (inventoryItem) {
    // Minimum stok eşik değerini, restock date ve storage location'ı güncelle
    inventoryItem.minimumStockThreshold = minStockThreshold;
    inventoryItem.restockDate = restockDate;
    inventoryItem.storageLocation = storageLocation;

    // LocalStorage'a kaydet
    localStorage.setItem("inventory", JSON.stringify(inventory));

    console.log("Updated inventory:", inventory);

    alert("Inventory updated successfully!");
    document.getElementById("update-inventory-form").reset();
    updateInventoryAlerts();
  } else {
    alert("Selected category not found in inventory!");
  }
});

function updateInventoryAlerts() {
  const tableBody = document.querySelector("#inventory-table tbody");
  tableBody.innerHTML = "";

  inventory.forEach((item) => {
    const currentStock = calculateCurrentStock(item.category); // Güncel stoğu hesapla
    const status = currentStock < item.minimumStockThreshold ? "Low Stock" : "Sufficient";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.category}</td>
      <td>${currentStock.toFixed(2)} kg</td>
      <td>${item.minimumStockThreshold} kg</td>
      <td>${item.restockDate}</td> <!-- Restock Date -->
      <td>${item.storageLocation}</td> <!-- Storage Location -->
      <td class="${status === "Low Stock" ? "low-stock" : "sufficient-stock"}">${status}</td>
    `;
    tableBody.appendChild(row);
  });
}

// Inventoryi JSON'dan al, localStorage'a kaydet
function fetchInventoryData() {
  fetch("inventory.json")
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        console.log("Envanter verisi alındı:", data);
        localStorage.setItem("inventory", JSON.stringify(data)); // localStorage'a kaydet
        inventory = data;
        displayInventory(); 
        populateInventoryDropdown(); 
      } else {
        console.error("inventory.json dosyasından veri alınamadı.");
      }
    })
    .catch(error => console.error("Inventory alınırken hata oldu", error));
}

// Inventoryi tablodan görüntüleme
function displayInventory() {
  updateInventoryAlerts(); // Inventory tablosunu güncelle
}

document.addEventListener("DOMContentLoaded", () => {
  // Eğer localStorage'da products yoksa, JSON'dan al ve kaydet
  if (!localStorage.getItem("products")) {
    console.log("Products not found in localStorage. Fetching from JSON...");
    fetchAndStoreProducts();
  }

  inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  if (!inventory || inventory.length === 0) {
    fetchInventoryData();
  } else {
    displayInventory();
    populateInventoryDropdown();
  }
});