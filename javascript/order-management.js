let customers = []; 
let categories = []; 
let orders = []; 
let products = []; 

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts(); // Ürünleri ve kategorileri yükle
  loadOrdersFromLocalStorage(); // Siparişleri yükle
});

// Ürünleri JSON dosyasından ve localStorage'dan yükle
function fetchProducts() {
  fetch("categories.json")
    .then((response) => response.json())
    .then((jsonCategories) => {
      categories = jsonCategories;
    })
    .catch((error) => console.error("Error fetching categories.json:", error));

  // Önce localStorage kontrol edilir
  const localStoredProducts = JSON.parse(localStorage.getItem("products"));
  if (localStoredProducts && localStoredProducts.length > 0) {
    // localStorage'da ürünler varsa, onları kullan
    console.log("Using products from localStorage.");
    products = localStoredProducts;
    populateDropdowns(); 
  } else {
    // localStorage boşsa, JSON'dan ürünleri yükle
    console.log("Fetching products from JSON file.");
    fetch("products.json")
      .then((response) => response.json())
      .then((data) => {
        products = data; 
        localStorage.setItem("products", JSON.stringify(products)); // localStorage'a kaydet
        populateDropdowns();
      })
      .catch((error) => console.error("Error fetching products:", error));
  }
}

// kategoriyi doğru şekilde almak için 
function loadOrdersFromLocalStorage() {
  const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];

  // Eğer localStorage'da veriler varsa, sadece localStorage'dan gelen ordersları kullan
  if (savedOrders.length > 0) {
    orders = savedOrders; // LocalStorage'daki ordersları kullan
  } else {
    // Eğer localStorage'da hiç order yoksa, orders.json'dan veri al
    fetch("orders.json")
      .then((response) => response.json())
      .then((jsonOrders) => {
        orders = jsonOrders;
        localStorage.setItem("orders", JSON.stringify(orders)); // Yeni siparişleri localStorage'a kayıt et
        populateOrdersTable(); 
      })
      .catch((error) => console.error("Error fetching orders.json:", error));
  }
  
  populateOrdersTable(); // Tabloyu güncelle
}

// Sipariş için ID oluşturma
function generateOrderID() {
  return "ORD" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Populate dropdowns
function populateDropdowns() {
  const customerDropdown = document.getElementById("select-customer");
  const productDropdown = document.getElementById("select-product");

  customerDropdown.innerHTML = '<option value="">Select Customer</option>';
  customerDropdown.innerHTML += '<option value="new">New Customer</option>';

  productDropdown.innerHTML = '<option value="">Select Product</option>';   // Ürün dropdown'u temizle

  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.name;
    option.textContent = customer.name;
    customerDropdown.appendChild(option);
  });

  // Productları dropdowna ekle
  products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.productName; 
    option.textContent = `${product.productName} - ${product.category} (${product.weight}g)`; 
    productDropdown.appendChild(option);
  });
}

// Arama ve filtreleme
function filterOrders() {
  const searchInput = document.getElementById("search-order-input").value.trim().toLowerCase();
  const statusFilter = document.getElementById("filter-by-status").value;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchInput) ||
      order.orderID.toLowerCase().includes(searchInput);
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  populateOrdersTable(filteredOrders); 
}

// order'dan direkt category alıyoruz
function getOrderCategory(order) {
  return order.category || "Unknown";
}

// Tabloyu görüntüleme ve siparişleri listeleme
function populateOrdersTable() {
  const tableBody = document.querySelector("#all-orders-table tbody");
  tableBody.innerHTML = ""; 

  orders.forEach((order, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${order.orderID}</td>
      <td>${order.customerName}</td>
      <td>${order.productName}</td>
      <td>${order.category}</td>
      <td>${order.quantity}</td>
      <td>${order.totalPrice} $</td>
      <td>
        <select class="order-status-dropdown" data-index="${index}">
          <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="Processed" ${order.status === "Processed" ? "selected" : ""}>Processed</option>
          <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
          <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>

        </select>
      </td>
      <td>${order.orderDate}</td> <!-- Tarih bilgisi ekleniyor -->
      <td><button class="delete-btn" data-index="${index}">Sil</button></td>
    `;

    tableBody.appendChild(row);
  });

  // Sipariş durumunu güncellemek için event listener
  document.querySelectorAll(".order-status-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("change", (event) => {
      const index = event.target.dataset.index;
      const newStatus = event.target.value;
      orders[index].status = newStatus;
      localStorage.setItem("orders", JSON.stringify(orders));
      alert(`Sipariş durumu "${newStatus}" olarak güncellendi.`);
    });
  });

  // Silme butonlarına event listener 
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.target.dataset.index;
      orders.splice(index, 1);  // orders dizisinden silme
      localStorage.setItem("orders", JSON.stringify(orders));  // Güncel veriyi localStorage'a kaydet
      populateOrdersTable(); 
      alert("Sipariş başarıyla silindi.");
    });
  });
}

// Event Listeners arama ve filtreleme için
document.getElementById("search-order-input").addEventListener("input", filterOrders);
document.getElementById("filter-by-status").addEventListener("change", filterOrders);

// Verileri LocalStorage'a kaydet
function saveOrdersToLocalStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// Müşteri ve kategori verilerini yükle
function loadCustomerData() {
  fetch("customers.json")
    .then((response) => response.json())
    .then((data) => {
      customers = data;
      populateDropdowns();
    })
    .catch((error) => console.error("Error fetching customers.json:", error));
}

// Sipariş oluştururken stok durumunu kontrolü
document.getElementById("create-order-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Form gönderimini engelle

  const selectCustomer = document.getElementById("select-customer");
  const selectedCustomer = selectCustomer.value;

  let customerName;

  // Yeni müşteri ya da mevcut müşteri kontrolü
  if (selectedCustomer === "new") {
    const newCustomerName = document.getElementById("new-customer-name")?.value.trim();
    const contact = document.getElementById("customer-contact")?.value.trim();
    const address = document.getElementById("customer-address")?.value.trim();

    if (!newCustomerName || !contact || !address) {
      alert("Please fill in all new customer details!");
      return;
    }
    customerName = newCustomerName;
    customers.push({ name: newCustomerName, contact, address });
    localStorage.setItem("customers", JSON.stringify(customers));
  } else {
    customerName = selectedCustomer; // Mevcut müşteri ismi
  }

  // Seçilen ürünü ve miktarı al
  const selectedProductName = document.getElementById("select-product").value;
  const quantity = parseInt(document.getElementById("order-quantity")?.value, 10);
  const totalPrice = document.getElementById("total-price")?.value;

  if (!selectedProductName || !quantity || quantity <= 0) {
    alert("Please fill in all product details correctly!");
    return;
  }

  // Seçilen ürünü bul
  const selectedProduct = products.find(p => p.productName === selectedProductName);
  const productCategory = selectedProduct ? selectedProduct.category : "Unknown";

  // Stok yeterli mi kontrolü
  if (selectedProduct && (selectedProduct.totalStock * 1000) < (quantity * selectedProduct.weight)) {
    alert(`Not enough stock for ${selectedProduct.productName} ! Current stock is: ${selectedProduct.totalStock} kilograms`);
    return;
  }

  // Sipariş tarihi
  const orderDate = document.getElementById("order-date").value;
  if (!orderDate) {
    alert("Please select a valid order date.");
    return;
  }

  // Yeni siparişi oluştur
  const newOrder = {
    orderID: generateOrderID(),
    customerName,
    productName: selectedProductName,
    category: productCategory,
    quantity,
    totalPrice,
    orderDate,
    status: "Pending"
  };

  // Seçilen ürünün stok bilgisini güncelle
  selectedProduct.totalStock = ((selectedProduct.totalStock * 1000) - (quantity * selectedProduct.weight)) / 1000;
  var inventory = JSON.parse(localStorage.getItem("inventory"));
  const inventoryCategory = inventory.find(c => c.category === productCategory);
  inventoryCategory.stock = ((inventoryCategory.stock * 1000) - (quantity * selectedProduct.weight)) / 1000;

  // Yeni siparişi orders dizisine ekle ve localStorage'a kaydet
  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  // Ürünler ve envanteri güncelle
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("inventory", JSON.stringify(inventory));

  // Sipariş tablosunu güncelle ve formu sıfırla
  populateOrdersTable();
  document.getElementById("create-order-form").reset();
});


// Toplam fiyatı hesaplama + Vergi mevzusu ekleme
function calculateTotalPrice(productName, quantity) {
  const product = products.find(
    (p) => p.productName === productName || p.name === productName
  );

  if (!product) return 0;

  const category = categories.find((cat) => cat.name === product.category);
  const totalPrice = category
    ? category.pricePerKg * (product.weight / 1000) * quantity
    : 0;

  return parseFloat(totalPrice.toFixed(2));
}

function mergeProducts(localProducts, jsonProducts) {
  const merged = [...jsonProducts];
  const productNames = new Set();

  // Ürünleri productName'e göre birleştir
  jsonProducts.forEach((product) => {
    productNames.add(product.productName); 
  });

  localProducts.forEach((localProduct) => {
    localProduct.productName = localProduct.productName || localProduct.name;

    if (!productNames.has(localProduct.productName)) {
      merged.push(localProduct);
      productNames.add(localProduct.productName);
    }
  });

  return merged;
}

// Toplam Gelir Hesaplama
function calculateTotalRevenue(orders) {
  return orders.reduce((totalRevenue, order) => {
    return totalRevenue + parseFloat(order.totalPrice); // Siparişin toplam fiyatını ekliyoruz
  }, 0);
}

// Ürün seçimi ve miktar değişimi
document.getElementById("select-product").addEventListener("change", function () {
  const selectedProductName = this.value;
  
  if (selectedProductName) {
    // Ürünü bulur ve kategoriyi alır
    const selectedProduct = products.find(p => p.productName === selectedProductName);
    // Kategori bilgisini input'a yazar
    const productCategoryInput = document.getElementById("product-category");
    productCategoryInput.value = selectedProduct ? selectedProduct.category : "Unknown";
  }
});

document.getElementById("order-quantity").addEventListener("input", function(){
  updateTotalPrice();
});

// Toplam fiyatı güncelle
function updateTotalPrice() {
  const selectedProduct = document.getElementById("select-product").value;
  const quantity = parseInt(document.getElementById("order-quantity").value, 10);

  if (selectedProduct && quantity > 0) {
    const totalPrice = calculateTotalPrice(selectedProduct, quantity);
    document.getElementById("total-price").value = `${totalPrice.toFixed(2)}`; 
  } else {
    document.getElementById("total-price").value = "0.00 $"; 
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCustomerData();

  const selectCustomer = document.getElementById("select-customer");
  const newCustomerDetails = document.getElementById("new-customer-details");
  const newCustomerInputs = newCustomerDetails.querySelectorAll("input"); // Yeni müşteri detaylarındaki inputlar

  if (selectCustomer) {
    selectCustomer.addEventListener("change", function () {
      const selectedValue = this.value; // Seçilen değeri al

      // Eğer "New Customer" seçildiyse detayları göster ve required ekle
      if (selectedValue === "new") {
        newCustomerDetails.style.display = "block";
        newCustomerInputs.forEach((input) => input.setAttribute("required", "required"));
      } else {
        // Aksi halde detayları gizle ve required kaldır
        newCustomerDetails.style.display = "none";
        newCustomerInputs.forEach((input) => input.removeAttribute("required"));
      }
    });
  } else {
    console.error("Select customer element not found!");
  }
});

//--------------------------------
//------------------------
//--------------------------------

// Toplam gelir hesaplama
function calculateTotalRevenueTwo(orders) {
  return orders.reduce((totalRevenue, order) => {
    return totalRevenue + parseFloat(order.totalPrice);
  }, 0);
}

// Kategoriye göre gelir hesaplama
function calculateRevenuePerCategory(orders) {
  const revenueByCategory = {};

  orders.forEach(order => {
    // Kategoriye göre gelirleri toplama
    const category = order.category; 
    const totalPrice = parseFloat(order.totalPrice);
    
    if (revenueByCategory[category]) {
      revenueByCategory[category] += totalPrice;
    } else {
      revenueByCategory[category] = totalPrice;
    }
  });

  return revenueByCategory;
}

//Satış raporu olyşturma
function getSalesReport(orders) {
  const categoryRevenue = calculateRevenuePerCategory(orders);
  const unitsSold = calculateUnitsSold(orders);

  const report = Object.keys(categoryRevenue).map((category) => {
    return {
      category,
      revenue: categoryRevenue[category],
      unitsSold: unitsSold[category],
    };
  });

  return report;
}

// Satış raporu chartı
function createSalesChart(salesData) {
  const ctx = document.getElementById('salesChart').getContext('2d');

  const chartData = {
    labels: Object.keys(salesData.revenueByCategory), // Kategoriler
    datasets: [{
      label: 'Revenue Per Category', 
      data: Object.values(salesData.revenueByCategory), // Her kategorinin geliri
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  new Chart(ctx, {
    type: 'bar', // Çubuk grafik
    data: chartData,
    options: chartOptions
  });
}

// CSV olarak dışa aktarma
function exportToCSV(data) {
  const header = Object.keys(data[0]).join(",") + "\n"; // Başlık satırı
  const rows = data.map(row => Object.values(row).join(",")).join("\n"); // Satırlar

  const csvContent = header + rows;

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sales_report.csv"; // İndirilecek dosyanın ismi
  a.click();
  URL.revokeObjectURL(url); // Belleği temizle
}

// Rapor indirme butonu tıklama event listenerı
document.getElementById("download-report").addEventListener("click", () => {
  const salesReport = getSalesReport(orders);
  exportToCSV(salesReport); 
});

// Tüm kategoriler için genel gelir hesaplama
function calculateOverallRevenue(orders) {
  return orders.reduce((totalRevenue, order) => {
    return totalRevenue + parseFloat(order.totalPrice);
  }, 0);
}

// Satılan Birim Sayısı Hesaplama
function calculateUnitsSold(orders) {
  const unitsSold = {};

  orders.forEach(order => {
    const category = order.category;  // 'category' 
    const quantity = order.quantity;  // 'quantity'

    if (!unitsSold[category]) {
      unitsSold[category] = 0;
    }
    unitsSold[category] += quantity;  // Satılan birimleri topla
  });

  return unitsSold;
}

// Birim fiyat hesaplama
function calculateUnitPrice(productName) {
  const product = products.find(p => p.productName === productName);
  return product ? product.unitPrice : 0; 
}

// Ürünlere göre gelir hesaplama
function calculateRevenuePerProduct(orders) {
  const revenueByProduct = {};

  orders.forEach(order => {
    const productName = order.productName; // product name alır
    const totalPrice = parseFloat(order.totalPrice); 
    
    if (revenueByProduct[productName]) {
      revenueByProduct[productName] += totalPrice;
    } else {
      revenueByProduct[productName] = totalPrice;
    }
  });

  return revenueByProduct;
}

// Satış verilerini çubuk grafiğe dönüştürme
function createSalesBarChart(orders) {
  // Kategori bazında gelir hesabı 
  const revenueByCategory = calculateRevenuePerCategory(orders);

  // Çubuk grafik 
  const barChartData = {
    labels: Object.keys(revenueByCategory), // Kategoriler
    datasets: [{
      label: 'Revenue Per Category', // Grafik Başlığı
      data: Object.values(revenueByCategory), // Her kategorinin geliri
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)', 
      borderWidth: 1 
    }]
  };

  // Çubuk grafiğiçizme
  const barCtx = document.getElementById('salesBarChart').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: barChartData,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Sayfa yüklendiğinde çubuk grafiği göster
document.addEventListener("DOMContentLoaded", () => {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  createSalesBarChart(orders);
});

// Sayfa yüklendiğinde gelir hesaplar ve gösteir
document.addEventListener("DOMContentLoaded", () => {
  // orders verileri localStorage'dan
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  // Toplam gelir hesaplama 
  const totalRevenue = calculateTotalRevenueTwo(orders);
  document.getElementById("total-revenue").textContent = `${totalRevenue.toFixed(2)}`;

  // Kategorilere göre gelir hesabı
  const revenueByCategory = calculateRevenuePerCategory(orders);
  const revenueCategoryReport = document.getElementById("revenue-category-report");

  // Kategoriye göre gelirleri HTML'e yazdır
  revenueCategoryReport.innerHTML = '';  // Önceki içerikleri sil
  Object.keys(revenueByCategory).forEach(category => {
    const revenueDiv = document.createElement("div");
    revenueDiv.textContent = `${category}: ${revenueByCategory[category].toFixed(2)}`;
    revenueCategoryReport.appendChild(revenueDiv);
  });

  // Productlara göre gelir hesabı
  const revenueByProduct = calculateRevenuePerProduct(orders);
  const revenueProductReport = document.getElementById("revenue-product-report");

  // Ürünlere göre gelirleri HTML'e yazdır
  revenueProductReport.innerHTML = '';  // Önceki içerikleri sil 
  Object.keys(revenueByProduct).forEach(product => {
    const revenueDiv = document.createElement("div");
    revenueDiv.textContent = `${product}: ${revenueByProduct[product].toFixed(2)}`;
    revenueProductReport.appendChild(revenueDiv);
  });

  const unitsSold = calculateUnitsSold(orders);
  const unitsSoldReport = document.getElementById("units-sold-report");

  // Satılan unitsleri kategoriye göre göster
  Object.keys(unitsSold).forEach(category => {
    const unitsDiv = document.createElement("div");
    unitsDiv.textContent = `${category}: ${unitsSold[category]} units sold`;
    unitsSoldReport.appendChild(unitsDiv);
  });
});