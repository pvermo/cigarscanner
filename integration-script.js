// Script d'intégration et d'initialisation pour la gestion des fournisseurs

// Fonction pour mettre à jour les produits existants sans fournisseur
function updateExistingProductsWithSupplier() {
    // Récupérer le catalogue existant
    const catalog = JSON.parse(localStorage.getItem('productCatalog') || '[]');
    let updated = false;
    
    // Récupérer les fournisseurs
    const suppliers = getSuppliers();
    
    // Assigner des fournisseurs par défaut aux produits qui n'en ont pas
    catalog.forEach(product => {
        if (!product.supplier) {
            // Logique simple pour assigner un fournisseur par défaut basé sur la marque
            // On pourrait améliorer cette logique selon les besoins
            if (product.brand === 'Cohiba' || product.brand === 'Montecristo' || product.brand === 'Romeo y Julieta') {
                product.supplier = 'Coprova';
            } else if (product.brand === 'Davidoff') {
                product.supplier = 'Davidoff';
            } else if (product.brand === 'Flor de Selva') {
                product.supplier = 'Flor de Selva';
            } else if (product.brand === 'Oliva') {
                product.supplier = 'Oliva';
            } else {
                // Assigner un fournisseur aléatoire si aucun match spécifique
                const randomIndex = Math.floor(Math.random() * suppliers.length);
                product.supplier = suppliers[randomIndex];
            }
            updated = true;
        }
    });
    
    // Sauvegarder les changements si nécessaire
    if (updated) {
        localStorage.setItem('productCatalog', JSON.stringify(catalog));
        console.log('Catalogue mis à jour avec des fournisseurs par défaut');
    }
}

// Vérifier la compatibilité du système de stockage
function checkStorageCompatibility() {
    // Vérifier si le localStorage est disponible
    if (typeof localStorage === 'undefined') {
        alert('Votre navigateur ne supporte pas le stockage local. L\'application pourrait ne pas fonctionner correctement.');
        return false;
    }
    
    try {
        // Tester l'accès en écriture/lecture
        localStorage.setItem('test', 'test');
        if (localStorage.getItem('test') !== 'test') {
            throw new Error('Échec de la vérification de lecture/écriture');
        }
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        alert('Erreur d\'accès au stockage local. Veuillez vérifier les permissions de votre navigateur.');
        console.error('Erreur de stockage:', e);
        return false;
    }
}

// Intégration de tous les modules liés aux fournisseurs
function initSupplierIntegration() {
    // Vérifier la compatibilité du stockage
    if (!checkStorageCompatibility()) return;
    
    // Mettre à jour les produits existants avec des fournisseurs
    updateExistingProductsWithSupplier();
    
    // Initialiser le tableau du catalogue pour inclure la colonne fournisseur
    setTimeout(updateCatalogTableHeader, 1000);
    
    // Mettre à jour les formulaires pour inclure le champ fournisseur
    setTimeout(updateProductForms, 1000);
    
    // Mettre à jour les fonctions d'import/export Excel
    setTimeout(updateCatalogExcelExport, 1000);
    
    console.log('Intégration des fournisseurs initialisée');
}

// Exécuter l'initialisation quand le document est prêt
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'intégration des fournisseurs
    setTimeout(initSupplierIntegration, 1500);
});

// Fonction pour intégrer tous les scripts dans la page
function integrateSupplierScripts() {
    const scripts = [
        'supplier-management.js',
        'catalog-excel-import.js'
    ];
    
    scripts.forEach(script => {
        if (!document.querySelector(`script[src="${script}"]`)) {
            const scriptEl = document.createElement('script');
            scriptEl.src = script;
            document.body.appendChild(scriptEl);
        }
    });
}

// Exécuter l'intégration des scripts après le chargement de la page
window.addEventListener('load', function() {
    integrateSupplierScripts();
});

// Extension du processus de scan QR pour gérer le fournisseur
function processQRCodeWithSupplier(qrCodeData) {
    try {
        // Format attendu: Marque: XXX|Cigare: YYY|Pays: ZZZ|[Fournisseur: SSS]|Prix: 99.99
        const parts = qrCodeData.split('|');
        const brandPart = parts.find(p => p.startsWith('Marque:'));
        const namePart = parts.find(p => p.startsWith('Cigare:'));
        const countryPart = parts.find(p => p.startsWith('Pays:'));
        const supplierPart = parts.find(p => p.startsWith('Fournisseur:'));
        const pricePart = parts.find(p => p.startsWith('Prix:'));
        
        if (!brandPart || !namePart || !countryPart || !pricePart) {
            throw new Error('Format QR code invalide - champs manquants');
        }
        
        const brand = brandPart.split(': ')[1];
        const name = namePart.split(': ')[1];
        const country = countryPart.split(': ')[1];
        const price = pricePart.split(': ')[1];
        const supplier = supplierPart ? supplierPart.split(': ')[1] : null;
        
        // Créer le cigare
        const cigar = new Cigar(brand, name, country, price);
        
        // Ajouter le fournisseur si disponible
        if (supplier) {
            cigar.supplier = supplier;
        }
        
        return cigar;
    } catch (error) {
        console.error('Erreur de traitement du QR code:', error);
        return null;
    }
}

// Fonction pour afficher les informations du fournisseur dans le panier
function enhanceCartDisplay() {
    // Vérifier si l'élément renderCart existe déjà
    if (typeof renderCart === 'function') {
        const originalRenderCart = renderCart;
        
        // Remplacer par une version améliorée
        window.renderCart = function() {
            // Appeler d'abord la fonction originale
            originalRenderCart();
            
            // Ajouter les informations de fournisseur dans le panier si nécessaire
            const cartItems = document.querySelectorAll('#cartItems .list-group-item');
            cartItems.forEach(item => {
                const itemId = item.querySelector('button')?.getAttribute('onclick')?.match(/removeFromCart\('(.+?)'\)/)?.[1];
                
                if (itemId) {
                    const cartItem = currentCart.items.find(i => i.id === itemId);
                    if (cartItem && cartItem.supplier) {
                        // Ajouter le badge fournisseur s'il n'existe pas déjà
                        const badgesContainer = item.querySelector('.small');
                        if (badgesContainer && !badgesContainer.textContent.includes(cartItem.supplier)) {
                            const supplierBadge = document.createElement('span');
                            supplierBadge.className = 'badge bg-info supplier-badge ms-1';
                            supplierBadge.textContent = cartItem.supplier;
                            badgesContainer.appendChild(supplierBadge);
                        }
                    }
                }
            });
        };
    }
}

// Fonction pour mettre à jour les statistiques globales
function enhanceStatsDisplay() {
    // Ajouter un graphique radar pour comparer pays/marques/fournisseurs
    const statsSection = document.getElementById('stats');
    if (statsSection && !document.getElementById('comparison-chart-container')) {
        // Créer la section
        const comparisonSection = document.createElement('div');
        comparisonSection.id = 'comparison-chart-section';
        comparisonSection.className = 'row mt-4';
        
        // Ajouter le titre
        const titleDiv = document.createElement('div');
        titleDiv.className = 'col-12 mb-3';
        titleDiv.innerHTML = '<h4>Comparaison des ventes</h4>';
        comparisonSection.appendChild(titleDiv);
        
        // Graphique pour la comparaison
        const chartDiv = document.createElement('div');
        chartDiv.className = 'col-12';
        chartDiv.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Ventes comparées</h5>
                </div>
                <div class="card-body">
                    <div id="comparison-chart-container">
                        <canvas id="comparisonChart"></canvas>
                    </div>
                </div>
            </div>
        `;
        comparisonSection.appendChild(chartDiv);
        
        // Ajouter à la suite des autres stats
        statsSection.appendChild(comparisonSection);
        
        // Initialiser le graphique
        initializeComparisonChart();
        
        // Mettre à jour avec les données actuelles
        setTimeout(() => updateComparisonChart(currentStatsPeriod), 500);
    }
}

// Initialiser le graphique de comparaison
let comparisonChart = null;
function initializeComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    comparisonChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Top Marques',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Top Pays',
                    data: [],
                    backgroundColor: 'rgba(255, 206, 86, 0.5)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Top Fournisseurs',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de ventes'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparaison des meilleures ventes'
                }
            }
        }
    });
}

// Mettre à jour le graphique de comparaison
function updateComparisonChart(period) {
    if (!comparisonChart) return;
    
    // Filtrer les données selon la période
    const now = new Date();
    const filteredSales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        switch (period) {
            case 'day':
                return saleDate.getDate() === now.getDate() &&
                       saleDate.getMonth() === now.getMonth() &&
                       saleDate.getFullYear() === now.getFullYear();
            case 'month':
                return saleDate.getMonth() === now.getMonth() &&
                       saleDate.getFullYear() === now.getFullYear();
            case 'year':
                return saleDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    });
    
    // Compter les ventes par marque, pays et fournisseur
    const brandSales = {};
    const countrySales = {};
    const supplierSales = {};
    
    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            // Compter par marque
            if (!brandSales[item.brand]) {
                brandSales[item.brand] = 0;
            }
            brandSales[item.brand]++;
            
            // Compter par pays
            if (!countrySales[item.country]) {
                countrySales[item.country] = 0;
            }
            countrySales[item.country]++;
            
            // Compter par fournisseur
            const product = productCatalog.find(p => 
                p.brand === item.brand && 
                p.name === item.name
            );
            
            if (product && product.supplier) {
                if (!supplierSales[product.supplier]) {
                    supplierSales[product.supplier] = 0;
                }
                supplierSales[product.supplier]++;
            }
        });
    });
    
    // Obtenir les 5 meilleurs dans chaque catégorie
    const topBrands = Object.entries(brandSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topCountries = Object.entries(countrySales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const topSuppliers = Object.entries(supplierSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Fusionner les labels et uniformiser les données
    const allLabels = new Set();
    topBrands.forEach(([brand]) => allLabels.add(brand));
    topCountries.forEach(([country]) => allLabels.add(country));
    topSuppliers.forEach(([supplier]) => allLabels.add(supplier));
    
    const labels = Array.from(allLabels);
    
    // Préparer les données pour chaque série
    const brandData = labels.map(label => {
        const entry = topBrands.find(([brand]) => brand === label);
        return entry ? entry[1] : 0;
    });
    
    const countryData = labels.map(label => {
        const entry = topCountries.find(([country]) => country === label);
        return entry ? entry[1] : 0;
    });
    
    const supplierData = labels.map(label => {
        const entry = topSuppliers.find(([supplier]) => supplier === label);
        return entry ? entry[1] : 0;
    });
    
    // Mettre à jour le graphique
    comparisonChart.data.labels = labels;
    comparisonChart.data.datasets[0].data = brandData;
    comparisonChart.data.datasets[1].data = countryData;
    comparisonChart.data.datasets[2].data = supplierData;
    comparisonChart.update();
}

// Ajout de l'écouteur pour mettre à jour le graphique de comparaison
if (typeof showStats === 'function') {
    const enhancedShowStats = window.showStats;
    window.showStats = function(period) {
        enhancedShowStats(period);
        updateComparisonChart(period);
    };
}

// Initialiser les améliorations d'affichage
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        enhanceCartDisplay();
        enhanceStatsDisplay();
    }, 2000);
});