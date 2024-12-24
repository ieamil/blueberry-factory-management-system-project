// Sayfa yüklendiğinde toplam gelir- gider, vergi ve kategori bilgilerini göstertir
window.addEventListener('DOMContentLoaded', (event) => {
    calculateTotalRevenue();
    calculateTotalExpenses();
    const totalRevenue = parseFloat(document.getElementById('total-revenue').innerText.replace('$', '').trim());
    const { taxAmount, taxRate } = calculateTax(totalRevenue);

    document.getElementById('tax-amount').innerText = `${taxAmount} $`;
    document.getElementById('tax-rate').innerText = `${taxRate}%`;

    const categorySummary = document.querySelector("#category-sales");
    const categoryStock = document.querySelector("#category-stock");

    if (categorySummary && categoryStock) {
        categorySummary.style.display = 'none';  // Başlangıçta gizle
        categoryStock.style.display = 'none';  // Başlangıçta gizle
    }
});

// Toplam gelir hesaplama
function calculateTotalRevenue() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
    document.getElementById("total-revenue").innerText = `${totalRevenue.toFixed(2)} $`;
    return totalRevenue;
}

// Toplam gider hesaplama
function calculateTotalExpenses() {
    const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    const totalExpenses = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.totalCost || 0), 0);
    document.getElementById("total-expenses").innerText = `${totalExpenses.toFixed(2)} $`;
    return totalExpenses;
}

function calculateNetIncome(totalRevenue, totalExpenses, taxAmount) {
    return totalRevenue - totalExpenses - taxAmount;
}

//Toplam gelir üzerinden vergi hesabı
function calculateTax(totalRevenue) {
    let taxRate = 0;

    if (totalRevenue >= 1000 && totalRevenue <= 5000) {
        taxRate = 0.05;
    } else if (totalRevenue > 5000 && totalRevenue <= 10000) {
        taxRate = 0.1;
    } else if (totalRevenue > 10000) {
        taxRate = 0.15;
    }

    // Vergi miktarını, gelir ile vergi oranını çarparak hesapla
    const taxAmount = totalRevenue * taxRate;
    return {
        taxAmount: taxAmount.toFixed(2),
        taxRate: (taxRate * 100).toFixed(0),
    };
}

// Tarih aralığına göre filtreleyerek kategorilere göre satışı hesapla
function calculateCategorySales(startDate, endDate) {
    const filteredOrders = filterOrdersByDate(startDate, endDate);
    const categorySales = {};

    filteredOrders.forEach((order) => {
        const productCategory = order.category;
        if (!categorySales[productCategory]) {
            categorySales[productCategory] = 0;
        }
        categorySales[productCategory] += order.quantity;
    });

    // Satılan ürünleri Category Summary içinde göster
    const categorySalesContainer = document.getElementById('category-sales');
    categorySalesContainer.innerHTML = '<h4>Products Sold by Category:</h4>';
    for (const category in categorySales) {
        categorySalesContainer.innerHTML += `<p>${category}: ${categorySales[category]} units sold</p>`;
    }

    return categorySales;
}

// Tarih aralığına gre filtrele, satışları stoktan düş ve kategorilere göre stokları hesapla
function calculateCategoryStock(startDate, endDate) {
    const products = JSON.parse(localStorage.getItem("inventory")) || [];
    const categorySales = calculateCategorySales(startDate, endDate); 
    const categoryStock = {};

    products.forEach((product) => {
        const productCategory = product.category;
        const totalStock = product.stock;

        // Satışları toplam stoktan düş
        const totalSalesForCategory = categorySales[productCategory] || 0;
        const remainingStock = totalStock - totalSalesForCategory;
        // Kalan stokları kategoriye ekle
        categoryStock[productCategory] = remainingStock;
    });

    const categoryStockContainer = document.getElementById('category-stock');
    categoryStockContainer.innerHTML = '<h4>Remaining Stock by Category:</h4>';
    for (const category in categoryStock) {
        categoryStockContainer.innerHTML += `<p>${category}: ${categoryStock[category]} units remaining</p>`;
    }
}

// Tarih aralığındaki siparişleri filtreleme
function filterOrdersByDate(startDate, endDate) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    return orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
}

// Tarih aralığındaki giderleri filtreleme
function filterExpensesByDate(startDate, endDate) {
    const purchases = JSON.parse(localStorage.getItem("purchases")) || [];
    return purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate); 
        return purchaseDate >= new Date(startDate) && purchaseDate <= new Date(endDate);
    });
}

// Tarih aralığındaki toplam gelir ve gideri hesaplama
function calculateTotalRevenueAndExpenses(startDate, endDate) {
    const filteredOrders = filterOrdersByDate(startDate, endDate);
    const filteredExpenses = filterExpensesByDate(startDate, endDate);

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, purchase) => sum + parseFloat(purchase.totalCost || 0), 0);

    return { totalRevenue, totalExpenses };
}

function calculateFinancials() {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
    }

    const { totalRevenue, totalExpenses } = calculateTotalRevenueAndExpenses(startDate, endDate);

    // Sonuçları ekranda güncelle
    document.getElementById("total-revenue").innerText = `${totalRevenue.toFixed(2)} $`;
    document.getElementById("total-expenses").innerText = `${totalExpenses.toFixed(2)} $`;

    // Vergi hesaplaması
    const { taxAmount, taxRate } = calculateTax(totalRevenue);
    document.getElementById('tax-amount').innerText = `${taxAmount} $`;
    document.getElementById('tax-rate').innerText = `${taxRate}%`;
    // Net gelir hesabı
    const netIncome = calculateNetIncome(totalRevenue, totalExpenses, taxAmount);
    document.getElementById('net-income').value = `${netIncome.toFixed(2)} $`;

    // Summary kısmını güncelleme
    document.getElementById("revenue-summary").innerText = `${totalRevenue.toFixed(2)} $`;
    document.getElementById("expenses-summary").innerText = `${totalExpenses.toFixed(2)} $`;
    document.getElementById("tax-summary").innerText = `${taxAmount} $`;
    document.getElementById("net-summary").innerText = `${netIncome.toFixed(2)} $`;

    // Kategoriye göre satışları ve stokları hesaplama
    calculateCategorySales(startDate, endDate);
    calculateCategoryStock(startDate, endDate);
    // Summary kısmını ve Category Summary'yi göster
    const categorySales = document.getElementById("category-sales");
    const categoryStock = document.getElementById("category-stock");
    const summarySection = document.querySelector(".form-section");  

    if (categorySales && categoryStock && summarySection) {
        categorySales.style.display = 'block';  // Category Summary görünür olacak
        categoryStock.style.display = 'block';  // Remaining Stock görünür olacak
        summarySection.style.display = 'block'; // Summary kısmını gösteriyoruz
    }
}

// Export to CSV fonksiyonu
function exportToCSV() {
    // Summary verilerini alır
    const totalRevenue = document.getElementById("revenue-summary").innerText;
    const totalExpenses = document.getElementById("expenses-summary").innerText;
    const taxAmount = document.getElementById("tax-summary").innerText;
    const netIncome = document.getElementById("net-summary").innerText;

    // Category Summary verilerini alır
    const categorySalesContainer = document.getElementById("category-sales");
    const categoryStockContainer = document.getElementById("category-stock");

    // Kategori satışları ve stokları verilerini alır
    const categorySales = categorySalesContainer ? categorySalesContainer.innerText : "";
    const categoryStock = categoryStockContainer ? categoryStockContainer.innerText : "";

    let csvContent = "Financial Summary\n";
    csvContent += "Total Revenue,Total Expenses,Total Tax,Net Income\n";
    csvContent += `${totalRevenue},${totalExpenses},${taxAmount},${netIncome}\n\n`;

    csvContent += "Category Summary\n";
    csvContent += "Products Sold by Category\n";
    csvContent += `${categorySales}\n\n`;
    csvContent += "Remaining Stock by Category\n";
    csvContent += `${categoryStock}\n`;

    // CSV dosyasını indirme
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        // Tarayıcıda CSV'yi indir
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "financial_analysis.csv");
        link.click();
    }
}

// Export to CSV butonu event listener
document.getElementById("export-csv").addEventListener("click", exportToCSV);
document.getElementById("calculate").addEventListener("click", calculateFinancials);