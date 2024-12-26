let suppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
let purchases = JSON.parse(localStorage.getItem("purchases")) || [];

//Supplierları LocalStorage'a kaydet
function saveSuppliers() {
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

//Purchaseslerı localstoragea kaydet
function savePurchases() {
  localStorage.setItem("purchases", JSON.stringify(purchases));
}

//Supplier'ları tabloda görüntüleme
function displaySuppliers() {
  const tableBody = document.querySelector("#supplier-table tbody");
  tableBody.innerHTML = "";

  suppliers.forEach((supplier) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${supplier.id}</td>
      <td>${supplier.name}</td>
      <td>${supplier.location}</td>
      <td>${supplier.contact}</td>
    `;
    tableBody.appendChild(row);
  });
}
//Puchaseslerı tabloda görüntüleme
function displayPurchases() {
    const tableBody = document.querySelector("#purchase-table tbody");
    tableBody.innerHTML = "";
  
    purchases.forEach((purchase) => {
      const quantity = purchase.quantity || 0;
      const price = purchase.price || 0; 
      const totalCost = purchase.totalCost || (quantity * price); // Eksikse hesapla
  
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${purchase.id}</td>
        <td>${purchase.supplierName}</td>
        <td>${purchase.productName}</td>
        <td>${quantity}</td>
        <td>${price.toFixed(2)}</td>
        <td>${totalCost.toFixed(2)}</td>
        <td>${purchase.date}</td>
      `;
      tableBody.appendChild(row);
    });
  }

//Supplier ekle
document.getElementById("add-supplier-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const supplierId = document.getElementById("supplier-id").value.trim();
  const supplierName = document.getElementById("supplier-name").value.trim();
  const supplierLocation = document.getElementById("supplier-location").value.trim();
  const supplierContact = document.getElementById("supplier-contact").value.trim();

  if (!/^\d+$/.test(supplierId)) {
    alert("Supplier ID must contain only numbers!");
    return;
  }  

  if (suppliers.some((supplier) => supplier.id === supplierId)) {
    alert("Supplier ID already exists!");
    return;
  }

  if (supplierId && supplierName && supplierLocation && supplierContact) {
    suppliers.push({ id: supplierId, name: supplierName, location: supplierLocation, contact: supplierContact });
    saveSuppliers();
    displaySuppliers();
    document.getElementById("add-supplier-form").reset();
    alert("Supplier added successfully!");
  } else {
    alert("All fields are required!");
  }
});

//Purchase için ID oluşturma
function generatePurchaseId() {
    return `P${purchases.length + 1}`;
  }

//Purchase ekle
document.getElementById("add-purchase-form").addEventListener("submit", (event) => {
    event.preventDefault();
  
    const purchaseId = generatePurchaseId(); 
    const supplierId = document.getElementById("purchase-supplier").value;
    const productName = document.getElementById("purchase-product").value.trim();
    const quantity = parseFloat(document.getElementById("purchase-quantity").value.trim());
    const price = parseFloat(document.getElementById("purchase-price").value.trim());
    const date = document.getElementById("purchase-date").value;
  
    if (!supplierId || !productName || isNaN(quantity) || isNaN(price) || !date) {
      alert("All fields are required, and values must be valid!");
      return;
    }
  
    const supplier = suppliers.find((s) => s.id === supplierId);
  
    if (supplier) {
      const totalCost = quantity * price; 
      purchases.push({
        id: purchaseId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        productName,
        quantity,
        price,
        totalCost,
        date,
      });
      savePurchases();
      displayPurchases();
      document.getElementById("add-purchase-form").reset();
      alert("Purchase added successfully!");
    } else {
      alert("Supplier not found!");
    }
});

//Purchase ara
function searchPurchases() {
  const searchTerm = document.getElementById("purchase-search-bar").value.toLowerCase();
  const tableBody = document.querySelector("#purchase-table tbody");

  tableBody.innerHTML = "";

  purchases
    .filter(
      (purchase) =>
        purchase.supplierName.toLowerCase().includes(searchTerm) ||
        purchase.date.includes(searchTerm)
    )
    .forEach((purchase) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${purchase.supplierName}</td>
        <td>${purchase.productName}</td>
        <td>${purchase.quantity}</td>
        <td>${purchase.price}</td>
        <td>${(purchase.quantity * purchase.price).toFixed(2)}</td>
        <td>${purchase.date}</td>
      `;
      tableBody.appendChild(row);
    });
}
//supplier güncelle
document.getElementById("update-supplier-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const supplierId = document.getElementById("update-supplier-id").value.trim();
  const supplierName = document.getElementById("update-supplier-name").value.trim();
  const supplierLocation = document.getElementById("update-supplier-location").value.trim();
  const supplierContact = document.getElementById("update-supplier-contact").value.trim();

  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!/^\d+$/.test(supplierId)) {
    alert("Supplier ID must contain only numbers!");
    return;
  }  

  if (supplier) {
    if (supplierName) supplier.name = supplierName;
    if (supplierLocation) supplier.location = supplierLocation;
    if (supplierContact) supplier.contact = supplierContact;

    saveSuppliers();
    displaySuppliers();
    alert("Supplier updated successfully!");
    document.getElementById("update-supplier-form").reset();
  } else {
    alert("Supplier not found!");
  }
});

//supplier sil
document.getElementById("delete-supplier-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const supplierId = document.getElementById("delete-supplier-id").value.trim();
  const index = suppliers.findIndex((supplier) => supplier.id === supplierId);

  if (!/^\d+$/.test(supplierId)) {
    alert("Supplier ID must contain only numbers!");
    return;
  }  

  if (index > -1) {
    suppliers.splice(index, 1);
    saveSuppliers();
    displaySuppliers();
    alert("Supplier deleted successfully!");
    document.getElementById("delete-supplier-form").reset();
  } else {
    alert("Supplier not found!");
  }
});

//supplier ara
function searchSuppliers() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const tableBody = document.querySelector("#supplier-table tbody");

  tableBody.innerHTML = "";

  suppliers
    .filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.location.toLowerCase().includes(searchTerm) ||
        supplier.id.includes(searchTerm)
    )
    .forEach((supplier) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${supplier.id}</td>
        <td>${supplier.name}</td>
        <td>${supplier.location}</td>
        <td>${supplier.contact}</td>
      `;
      tableBody.appendChild(row);
    });
}

//Supplierları json dosyasından getir ve hem tedarikçi dizisini hem de açılır menüyü doldur
function fetchSuppliers() {
    fetch("suppliers.json")
      .then((response) => response.json())
      .then((data) => {
        suppliers = data; //JSON'dan gelen suppliersları kaydet
        saveSuppliers(); 
        displaySuppliers(); 
        populateSupplierDropdown(); 
      })
      .catch((error) => console.error("Error fetching suppliers:", error));
  }
  
  function populateSupplierDropdown() {
    const supplierDropdown = document.getElementById("purchase-supplier");
    supplierDropdown.innerHTML = `<option value="">Select Supplier</option>`;
  
    // Tedarikçileri dropdown'a ekle
    suppliers.forEach((supplier) => {
      const option = document.createElement("option");
      option.value = supplier.id; // Tedarikçi ID'sini value olarak ekle
      option.textContent = supplier.name; // Tedarikçi adını göster
      supplierDropdown.appendChild(option);
    });
  }

//JSON dosyasından satın alınanları getir
function fetchPurchases() {
    fetch("purchases.json")
      .then((response) => response.json())
      .then((data) => {
        purchases = data; // JSON'dan gelen satın alma işlemlerini purchases dizisine kaydet
        savePurchases(); // LocalStorage'a kaydet
        displayPurchases(); // Tabloyu güncelle
      })
      .catch((error) => console.error("Error fetching purchases:", error));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const savedSuppliers = JSON.parse(localStorage.getItem("suppliers"));
  
    if (savedSuppliers) {
      suppliers = savedSuppliers; // LocalStorage'daki supplierları kullan
      displaySuppliers();
      populateSupplierDropdown(); // Dropdown'ı güncelle
    } else {
      fetchSuppliers(); // JSON'dan yükle ve dropdown'ı güncelle
    }
  
    const savedPurchases = JSON.parse(localStorage.getItem("purchases"));
    if (savedPurchases) {
      purchases = savedPurchases; // LocalStorage'daki satın alma işlemlerini kullan
      displayPurchases();
    } else {
      fetchPurchases(); // JSON'dan yükle ve kaydet
    }
  })
  
document.addEventListener("DOMContentLoaded", () => {
  displaySuppliers();
  displayPurchases();
});