/**
 * Module Statistiques - Le Diplomate
 * Gère les statistiques et reporting des ventes
 */

// Initialiser le module de statistiques
LeDiplomate.statistiques = {
    // Variables du module
    currentFilters: {
        dateFrom: null,
        dateTo: null,
        brand: '',
        supplierId: ''
    },
    chartInstances: {},
    
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Statistiques');
        
        // Initialiser les gestionnaires d'événements
        this.initEventListeners();
        
        // Initialiser les filtres avec les valeurs par défaut
        this.initDefaultFilters();
        
        // Charger les données initiales
        this.loadStatisticsData();
    },
    
    /**
     * Initialise les gestionnaires d'événements
     */
    initEventListeners: function() {
        // Filtres
        document.getElementById('apply-filters').addEventListener('click', this.applyFilters.bind(this));
        document.getElementById('export-stats').addEventListener('click', this.exportStatisticsExcel.bind(this));
        
        // Date par défaut si champs vides
        document.getElementById('stats-date-from').addEventListener('change', this.updateDateFilters.bind(this));
        document.getElementById('stats-date-to').addEventListener('change', this.updateDateFilters.bind(this));
    },
    
    /**
     * Initialise les filtres avec les valeurs par défaut
     */
    initDefaultFilters: function() {
        // Date de début: début du mois courant
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.currentFilters.dateFrom = firstDayOfMonth;
        
        // Date de fin: aujourd'hui
        this.currentFilters.dateTo = now;
        
        // Mettre à jour les champs de formulaire
        document.getElementById('stats-date-from').valueAsDate = firstDayOfMonth;
        document.getElementById('stats-date-to').valueAsDate = now;
        
        // Remplir les listes déroulantes de marques et fournisseurs
        this.populateFilterLists();
    },
    
    /**
     * Remplit les listes déroulantes des filtres
     */
    populateFilterLists: function() {
        // Remplir la liste des marques
        const brandSelect = document.getElementById('stats-brand');
        brandSelect.innerHTML = '<option value="">Toutes</option>';
        
        // Récupérer les marques uniques
        const brands = [...new Set(LeDiplomate.dataManager.products.getAll().map(p => p.brand))];
        brands.sort().forEach(brand => {
            if (brand) {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            }
        });
        
        // Remplir la liste des fournisseurs
        const supplierSelect = document.getElementById('stats-supplier');
        supplierSelect.innerHTML = '<option value="">Tous</option>';
        
        LeDiplomate.dataManager.suppliers.getAll().forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            supplierSelect.appendChild(option);
        });
    },
    
    /**
     * Met à jour les filtres de date
     */
    updateDateFilters: function() {
        const dateFrom = document.getElementById('stats-date-from').valueAsDate;
        const dateTo = document.getElementById('stats-date-to').valueAsDate;
        
        if (dateFrom) {
            this.currentFilters.dateFrom = dateFrom;
        }
        
        if (dateTo) {
            this.currentFilters.dateTo = dateTo;
        }
    },
    
    /**
     * Applique les filtres et met à jour les statistiques
     */
    applyFilters: function() {
        // Mettre à jour les filtres
        this.updateDateFilters();
        
        this.currentFilters.brand = document.getElementById('stats-brand').value;
        this.currentFilters.supplierId = document.getElementById('stats-supplier').value;
        
        // Recharger les données
        this.loadStatisticsData();
    },
    
    /**
     * Charge les données statistiques
     */
    loadStatisticsData: function() {
        // Récupérer les ventes filtrées
        const filteredSales = LeDiplomate.dataManager.sales.filterSales(this.currentFilters);
        
        // Mettre à jour les cartes de statistiques
        this.updateStatCards(filteredSales);
        
        // Mettre à jour les graphiques
        this.updateCharts(filteredSales);
        
        // Mettre à jour le tableau de détails
        this.updateSalesDetailsTable(filteredSales);
    },
    
    /**
     * Met à jour les cartes de statistiques
     * @param {Array} sales - Liste des ventes filtrées
     */
    updateStatCards: function(sales) {
        // Calculer les statistiques
        let totalSales = 0;
        let productsSold = 0;
        const brandSales = {};
        
        sales.forEach(sale => {
            totalSales += sale.total;
            
            sale.items.forEach(item => {
                productsSold += item.quantity;
                
                // Compter les ventes par marque
                if (item.product && item.product.brand) {
                    const brand = item.product.brand;
                    if (!brandSales[brand]) {
                        brandSales[brand] = 0;
                    }
                    brandSales[brand] += item.quantity * item.price;
                }
            });
        });
        
        // Mettre à jour les cartes de statistiques
        document.getElementById('total-sales').textContent = `${LeDiplomate.formatPrice(totalSales)}€`;
        document.getElementById('products-sold').textContent = productsSold;
        
        // Panier moyen
        const avgCart = sales.length > 0 ? totalSales / sales.length : 0;
        document.getElementById('avg-cart').textContent = `${LeDiplomate.formatPrice(avgCart)}€`;
        
        // Top marque
        let topBrand = '-';
        let topBrandSales = 0;
        
        for (const [brand, sales] of Object.entries(brandSales)) {
            if (sales > topBrandSales) {
                topBrandSales = sales;
                topBrand = brand;
            }
        }
        
        document.getElementById('top-brand').textContent = topBrand;
    },
    
    /**
     * Met à jour les graphiques
     * @param {Array} sales - Liste des ventes filtrées
     */
    updateCharts: function(sales) {
        try {
            // Détruire les graphiques existants pour éviter les fuites mémoire
            if (this.chartInstances.brandSales) {
                this.chartInstances.brandSales.destroy();
            }
            
            if (this.chartInstances.salesTrend) {
                this.chartInstances.salesTrend.destroy();
            }
            
            // Préparer les données pour le graphique des ventes par marque
            const brandData = this.prepareBrandSalesData(sales);
            this.renderBrandSalesChart(brandData);
            
            // Préparer les données pour le graphique d'évolution des ventes
            const trendData = this.prepareSalesTrendData(sales);
            this.renderSalesTrendChart(trendData);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des graphiques:', error);
            LeDiplomate.notifications.show('Erreur lors de la mise à jour des graphiques', 'error');
        }
    },
    
    /**
     * Prépare les données pour le graphique des ventes par marque
     * @param {Array} sales - Liste des ventes filtrées
     * @returns {Object} - Données formatées pour le graphique
     */
    prepareBrandSalesData: function(sales) {
        const brandSales = {};
        
        // S'assurer qu'il y a des ventes à traiter
        if (!sales || sales.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: 'Ventes (€)',
                    data: [],
                    backgroundColor: 'rgba(139, 69, 19, 0.6)',
                    borderColor: 'rgba(139, 69, 19, 1)',
                    borderWidth: 1
                }]
            };
        }
        
        sales.forEach(sale => {
            if (sale.items && Array.isArray(sale.items)) {
                sale.items.forEach(item => {
                    if (item.product && item.product.brand) {
                        const brand = item.product.brand;
                        if (!brandSales[brand]) {
                            brandSales[brand] = 0;
                        }
                        brandSales[brand] += item.quantity * item.price;
                    }
                });
            }
        });
        
        // Trier par montant de ventes décroissant
        const sortedBrands = Object.keys(brandSales).sort((a, b) => brandSales[b] - brandSales[a]);
        
        // Limiter à 10 marques maximum pour la lisibilité
        const topBrands = sortedBrands.slice(0, 10);
        
        return {
            labels: topBrands,
            datasets: [{
                label: 'Ventes (€)',
                data: topBrands.map(brand => brandSales[brand]),
                backgroundColor: 'rgba(139, 69, 19, 0.6)',
                borderColor: 'rgba(139, 69, 19, 1)',
                borderWidth: 1
            }]
        };
    },
    
    /**
     * Prépare les données pour le graphique d'évolution des ventes
     * @param {Array} sales - Liste des ventes filtrées
     * @returns {Object} - Données formatées pour le graphique
     */
    prepareSalesTrendData: function(sales) {
        // S'assurer qu'il y a des ventes à traiter
        if (!sales || sales.length === 0) {
            return {
                labels: [],
                datasets: [{
                    label: 'Ventes journalières (€)',
                    data: [],
                    backgroundColor: 'rgba(109, 76, 65, 0.2)',
                    borderColor: 'rgba(109, 76, 65, 1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            };
        }
        
        // Grouper les ventes par jour
        const dailySales = {};
        
        sales.forEach(sale => {
            try {
                const date = new Date(sale.date);
                if (isNaN(date.getTime())) {
                    console.warn('Date de vente invalide:', sale.date);
                    return;
                }
                
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                
                if (!dailySales[dateKey]) {
                    dailySales[dateKey] = 0;
                }
                
                dailySales[dateKey] += sale.total;
            } catch (error) {
                console.error('Erreur lors du traitement de la date:', error, sale);
            }
        });
        
        // Trier les dates et limiter à 30 jours pour la lisibilité
        const sortedDates = Object.keys(dailySales).sort();
        const recentDates = sortedDates.slice(-30);
        
        return {
            labels: recentDates.map(date => {
                const [year, month, day] = date.split('-');
                return `${day}/${month}`;
            }),
            datasets: [{
                label: 'Ventes journalières (€)',
                data: recentDates.map(date => dailySales[date]),
                backgroundColor: 'rgba(109, 76, 65, 0.2)',
                borderColor: 'rgba(109, 76, 65, 1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        };
    },
    
    /**
     * Affiche le graphique des ventes par marque
     * @param {Object} data - Données formatées pour le graphique
     */
    renderBrandSalesChart: function(data) {
        try {
            const canvas = document.getElementById('brand-sales-chart');
            if (!canvas) {
                console.error('Canvas pour le graphique des marques non trouvé');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Contexte 2D non disponible pour le graphique des marques');
                return;
            }
            
            this.chartInstances.brandSales = new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${LeDiplomate.formatPrice(context.raw)}€`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '€';
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors du rendu du graphique des marques:', error);
        }
    },
    
    /**
     * Affiche le graphique d'évolution des ventes
     * @param {Object} data - Données formatées pour le graphique
     */
    renderSalesTrendChart: function(data) {
        try {
            const canvas = document.getElementById('sales-trend-chart');
            if (!canvas) {
                console.error('Canvas pour le graphique de tendance non trouvé');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Contexte 2D non disponible pour le graphique de tendance');
                return;
            }
            
            this.chartInstances.salesTrend = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${LeDiplomate.formatPrice(context.raw)}€`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value + '€';
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors du rendu du graphique de tendance:', error);
        }
    },
    
    /**
     * Met à jour le tableau de détails des ventes
     * @param {Array} sales - Liste des ventes filtrées
     */
    updateSalesDetailsTable: function(sales) {
        const tableBody = document.getElementById('sales-details-items');
        if (!tableBody) {
            console.error('Élément du tableau de détails des ventes non trouvé');
            return;
        }
        
        tableBody.innerHTML = '';
        
        if (!sales || sales.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">Aucune vente pour cette période</td>';
            tableBody.appendChild(row);
            return;
        }
        
        // Aplatir les ventes pour avoir une ligne par article vendu
        const flattenedSales = [];
        
        sales.forEach(sale => {
            if (!sale.date) {
                console.warn('Vente sans date:', sale);
                return;
            }
            
            try {
                const date = new Date(sale.date);
                const formattedDate = LeDiplomate.formatDate(date);
                
                if (sale.items && Array.isArray(sale.items)) {
                    sale.items.forEach(item => {
                        const product = item.product || { brand: '--', name: '--' };
                        
                        flattenedSales.push({
                            date: formattedDate,
                            brand: product.brand,
                            product: product.name,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.quantity * item.price
                        });
                    });
                }
            } catch (error) {
                console.error('Erreur lors du traitement de la vente:', error, sale);
            }
        });
        
        // Trier par date décroissante
        flattenedSales.sort((a, b) => {
            const dateA = a.date.split('/').reverse().join('');
            const dateB = b.date.split('/').reverse().join('');
            return dateB.localeCompare(dateA);
        });
        
        // Afficher les détails (limités à 100 lignes pour la performance)
        const limit = Math.min(flattenedSales.length, 100);
        
        for (let i = 0; i < limit; i++) {
            const item = flattenedSales[i];
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.date}</td>
                <td>${item.brand}</td>
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${LeDiplomate.formatPrice(item.price)}€</td>
                <td>${LeDiplomate.formatPrice(item.total)}€</td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Indiquer s'il y a plus de résultats
        if (flattenedSales.length > limit) {
            const infoRow = document.createElement('tr');
            infoRow.innerHTML = `<td colspan="6" class="text-center">... et ${flattenedSales.length - limit} autres résultats</td>`;
            tableBody.appendChild(infoRow);
        }
    },
    
    /**
     * Exporte les données statistiques vers un fichier Excel
     */
    exportStatisticsExcel: function() {
        // Exporter les données filtrées
        const result = LeDiplomate.dataManager.export.toExcel('sales');
        
        if (result.success) {
            LeDiplomate.notifications.show(`${result.count} lignes exportées vers ${result.fileName}`, 'success');
        } else {
            LeDiplomate.notifications.show('Erreur lors de l\'exportation', 'error');
        }
    },
    
    /**
     * Fonction utilitaire pour limiter le nombre d'appels à une fonction
     * @param {Function} func - Fonction à exécuter
     * @param {number} wait - Délai en millisecondes
     * @returns {Function} - Fonction limitée
     */
    debounce: function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};