/**
 * Gestionnaire de données - Le Diplomate
 * Gère la persistance des données avec LocalStorage et les importations/exportations Excel
 */

// Initialiser le module de gestion des données
LeDiplomate.dataManager = {
    // Clés de stockage dans le LocalStorage
    STORAGE_KEYS: {
        PRODUCTS: 'le-diplomate-products',
        STOCK: 'le-diplomate-stock',
        SUPPLIERS: 'le-diplomate-suppliers',
        SALES: 'le-diplomate-sales',
        LABELS: 'le-diplomate-labels',
    },
    
    // Données en mémoire
    data: {
        products: [], // Catalogue des produits
        stock: [],    // Stock actuel
        suppliers: [], // Fournisseurs
        sales: [],    // Historique des ventes
        labels: [],   // Étiquettes enregistrées
    },
    
    /**
     * Initialise le gestionnaire de données
     */
    initialize: function() {
        // Charger les données depuis le LocalStorage
        this.loadAllData();
        
        // Si c'est la première utilisation, charger des données de démonstration
        if (this.data.products.length === 0 && this.data.suppliers.length === 0) {
            this.loadDemoData();
        }
        
        console.log('Gestionnaire de données initialisé');
    },
    
    /**
     * Charge toutes les données depuis le LocalStorage
     */
    loadAllData: function() {
        // Charger les produits
        const productsData = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
        if (productsData) {
            this.data.products = JSON.parse(productsData);
        }
        
        // Charger le stock
        const stockData = localStorage.getItem(this.STORAGE_KEYS.STOCK);
        if (stockData) {
            this.data.stock = JSON.parse(stockData);
        }
        
        // Charger les fournisseurs
        const suppliersData = localStorage.getItem(this.STORAGE_KEYS.SUPPLIERS);
        if (suppliersData) {
            this.data.suppliers = JSON.parse(suppliersData);
        }
        
        // Charger les ventes
        const salesData = localStorage.getItem(this.STORAGE_KEYS.SALES);
        if (salesData) {
            this.data.sales = JSON.parse(salesData);
        }
        
        // Charger les étiquettes
        const labelsData = localStorage.getItem(this.STORAGE_KEYS.LABELS);
        if (labelsData) {
            this.data.labels = JSON.parse(labelsData);
        }
    },
    
    /**
     * Sauvegarde toutes les données dans le LocalStorage
     */
    saveAllData: function() {
        // Sauvegarder les produits
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.data.products));
        
        // Sauvegarder le stock
        localStorage.setItem(this.STORAGE_KEYS.STOCK, JSON.stringify(this.data.stock));
        
        // Sauvegarder les fournisseurs
        localStorage.setItem(this.STORAGE_KEYS.SUPPLIERS, JSON.stringify(this.data.suppliers));
        
        // Sauvegarder les ventes
        localStorage.setItem(this.STORAGE_KEYS.SALES, JSON.stringify(this.data.sales));
        
        // Sauvegarder les étiquettes
        localStorage.setItem(this.STORAGE_KEYS.LABELS, JSON.stringify(this.data.labels));
    },
    
    /**
     * Charge des données de démonstration
     */
    loadDemoData: function() {
        // Fournisseurs de démonstration
        this.data.suppliers = [
            {
                id: 'sup-001',
                name: 'Habanos S.A.',
                contact: 'José Rodriguez',
                email: 'contact@habanos.cu',
                phone: '+53 12 345 6789',
                country: 'Cuba'
            },
            {
                id: 'sup-002',
                name: 'Centaure Imports',
                contact: 'Martine Dubois',
                email: 'contact@centaure-imports.fr',
                phone: '+33 1 23 45 67 89',
                country: 'France'
            },
            {
                id: 'sup-003',
                name: 'Nicaragua Cigar Co.',
                contact: 'Carlos Mendez',
                email: 'info@nicaraguacigar.com',
                phone: '+505 2222 3333',
                country: 'Nicaragua'
            }
        ];
        
        // Produits de démonstration
        this.data.products = [
            {
                id: 'prod-001',
                brand: 'Montecristo',
                name: 'No. 2',
                country: 'Cuba',
                vitole: 'Pirámide (52 x 156mm)',
                wrapper: 'Cubaine',
                binder: 'Cubaine',
                filler: 'Cubaine',
                strength: 'Moyenne-Forte'
            },
            {
                id: 'prod-002',
                brand: 'Padron',
                name: '1964 Anniversary',
                country: 'Nicaragua',
                vitole: 'Torpedo',
                wrapper: 'Maduro',
                binder: 'Nicaragua',
                filler: 'Nicaragua',
                strength: 'Forte'
            },
            {
                id: 'prod-003',
                brand: 'Cohiba',
                name: 'Siglo VI',
                country: 'Cuba',
                vitole: 'Canonazo (52 x 150mm)',
                wrapper: 'Cubaine',
                binder: 'Cubaine',
                filler: 'Cubaine',
                strength: 'Moyenne'
            },
            {
                id: 'prod-004',
                brand: 'Arturo Fuente',
                name: 'Opus X',
                country: 'République Dominicaine',
                vitole: 'Robusto',
                wrapper: 'Dominicaine',
                binder: 'Dominicaine',
                filler: 'Dominicaine',
                strength: 'Forte'
            },
            {
                id: 'prod-005',
                brand: 'Romeo y Julieta',
                name: 'Churchill',
                country: 'Cuba',
                vitole: 'Churchill (47 x 178mm)',
                wrapper: 'Cubaine',
                binder: 'Cubaine',
                filler: 'Cubaine',
                strength: 'Moyenne'
            }
        ];
        
        // Stock de démonstration
        this.data.stock = [
            {
                id: 'stock-001',
                productId: 'prod-001',
                supplierId: 'sup-001',
                quantity: 15,
                price: 15.50
            },
            {
                id: 'stock-002',
                productId: 'prod-002',
                supplierId: 'sup-002',
                quantity: 8,
                price: 22.00
            },
            {
                id: 'stock-003',
                productId: 'prod-003',
                supplierId: 'sup-001',
                quantity: 5,
                price: 35.00
            },
            {
                id: 'stock-004',
                productId: 'prod-004',
                supplierId: 'sup-002',
                quantity: 12,
                price: 28.50
            },
            {
                id: 'stock-005',
                productId: 'prod-005',
                supplierId: 'sup-001',
                quantity: 10,
                price: 18.00
            }
        ];
        
        // Ventes de démonstration
        this.data.sales = [
            {
                id: 'sale-001',
                date: '2024-07-01T14:30:00',
                items: [
                    {
                        productId: 'prod-001',
                        quantity: 2,
                        price: 15.50
                    },
                    {
                        productId: 'prod-005',
                        quantity: 1,
                        price: 18.00
                    }
                ],
                total: 49.00,
                paymentMethod: 'Carte bancaire',
                notes: ''
            },
            {
                id: 'sale-002',
                date: '2024-07-02T11:15:00',
                items: [
                    {
                        productId: 'prod-003',
                        quantity: 1,
                        price: 35.00
                    }
                ],
                total: 35.00,
                paymentMethod: 'Espèces',
                notes: 'Client régulier'
            }
        ];
        
        // Étiquettes de démonstration (compatibles avec le format existant)
        this.data.labels = [
            {
                brand: 'Montecristo',
                name: 'No. 2',
                country: 'Cuba',
                vitole: 'Pirámide (52 x 156mm)',
                wrapper: 'Cubaine',
                binder: 'Cubaine',
                filler: 'Cubaine',
                strength: 'Moyenne-Forte',
                price: '15.50€'
            },
            {
                brand: 'Cohiba',
                name: 'Siglo VI',
                country: 'Cuba',
                vitole: 'Canonazo (52 x 150mm)',
                wrapper: 'Cubaine',
                binder: 'Cubaine',
                filler: 'Cubaine',
                strength: 'Moyenne',
                price: '35.00€'
            }
        ];
        
        // Sauvegarder toutes les données
        this.saveAllData();
        
        console.log('Données de démonstration chargées');
    },
    
    /**
     * Méthodes CRUD pour les produits
     */
    products: {
        getAll: function() {
            return LeDiplomate.dataManager.data.products;
        },
        
        getById: function(id) {
            return LeDiplomate.dataManager.data.products.find(product => product.id === id);
        },
        
        add: function(product) {
            // Générer un ID si non fourni
            if (!product.id) {
                product.id = 'prod-' + LeDiplomate.generateId();
            }
            
            LeDiplomate.dataManager.data.products.push(product);
            LeDiplomate.dataManager.saveAllData();
            return product;
        },
        
        update: function(product) {
            const index = LeDiplomate.dataManager.data.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.products[index] = product;
                LeDiplomate.dataManager.saveAllData();
                return product;
            }
            return null;
        },
        
        delete: function(id) {
            const index = LeDiplomate.dataManager.data.products.findIndex(p => p.id === id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.products.splice(index, 1);
                LeDiplomate.dataManager.saveAllData();
                return true;
            }
            return false;
        },
        
        search: function(query) {
            if (!query) return this.getAll();
            
            query = query.toLowerCase();
            return LeDiplomate.dataManager.data.products.filter(product => {
                return (
                    product.brand.toLowerCase().includes(query) ||
                    product.name.toLowerCase().includes(query) ||
                    product.country.toLowerCase().includes(query) ||
                    product.vitole.toLowerCase().includes(query)
                );
            });
        }
    },
    
    /**
     * Méthodes CRUD pour le stock
     */
    stock: {
        getAll: function() {
            return LeDiplomate.dataManager.data.stock;
        },
        
        getById: function(id) {
            return LeDiplomate.dataManager.data.stock.find(item => item.id === id);
        },
        
        getByProductId: function(productId) {
            return LeDiplomate.dataManager.data.stock.find(item => item.productId === productId);
        },
        
        add: function(stockItem) {
            // Générer un ID si non fourni
            if (!stockItem.id) {
                stockItem.id = 'stock-' + LeDiplomate.generateId();
            }
            
            LeDiplomate.dataManager.data.stock.push(stockItem);
            LeDiplomate.dataManager.saveAllData();
            return stockItem;
        },
        
        update: function(stockItem) {
            const index = LeDiplomate.dataManager.data.stock.findIndex(item => item.id === stockItem.id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.stock[index] = stockItem;
                LeDiplomate.dataManager.saveAllData();
                return stockItem;
            }
            return null;
        },
        
        delete: function(id) {
            const index = LeDiplomate.dataManager.data.stock.findIndex(item => item.id === id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.stock.splice(index, 1);
                LeDiplomate.dataManager.saveAllData();
                return true;
            }
            return false;
        },
        
        updateQuantity: function(productId, delta) {
            const stockItem = this.getByProductId(productId);
            if (stockItem) {
                stockItem.quantity += delta;
                if (stockItem.quantity < 0) {
                    stockItem.quantity = 0;
                }
                LeDiplomate.dataManager.saveAllData();
                return stockItem;
            }
            return null;
        },
        
        getFullStock: function() {
            // Retourne le stock avec les détails des produits et fournisseurs
            return LeDiplomate.dataManager.data.stock.map(item => {
                const product = LeDiplomate.dataManager.products.getById(item.productId);
                const supplier = LeDiplomate.dataManager.suppliers.getById(item.supplierId);
                
                return {
                    ...item,
                    product,
                    supplier
                };
            });
        },
        
        search: function(query) {
            if (!query) return this.getFullStock();
            
            query = query.toLowerCase();
            const fullStock = this.getFullStock();
            
            return fullStock.filter(item => {
                return (
                    item.product.brand.toLowerCase().includes(query) ||
                    item.product.name.toLowerCase().includes(query) ||
                    item.product.country.toLowerCase().includes(query) ||
                    (item.supplier && item.supplier.name.toLowerCase().includes(query))
                );
            });
        }
    },
    
    /**
     * Méthodes CRUD pour les fournisseurs
     */
    suppliers: {
        getAll: function() {
            return LeDiplomate.dataManager.data.suppliers;
        },
        
        getById: function(id) {
            return LeDiplomate.dataManager.data.suppliers.find(supplier => supplier.id === id);
        },
        
        add: function(supplier) {
            // Générer un ID si non fourni
            if (!supplier.id) {
                supplier.id = 'sup-' + LeDiplomate.generateId();
            }
            
            LeDiplomate.dataManager.data.suppliers.push(supplier);
            LeDiplomate.dataManager.saveAllData();
            return supplier;
        },
        
        update: function(supplier) {
            const index = LeDiplomate.dataManager.data.suppliers.findIndex(s => s.id === supplier.id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.suppliers[index] = supplier;
                LeDiplomate.dataManager.saveAllData();
                return supplier;
            }
            return null;
        },
        
        delete: function(id) {
            const index = LeDiplomate.dataManager.data.suppliers.findIndex(s => s.id === id);
            if (index !== -1) {
                LeDiplomate.dataManager.data.suppliers.splice(index, 1);
                LeDiplomate.dataManager.saveAllData();
                return true;
            }
            return false;
        },
        
        getProductCount: function(supplierId) {
            return LeDiplomate.dataManager.data.stock.filter(item => item.supplierId === supplierId).length;
        }
    },
    
    /**
     * Méthodes CRUD pour les ventes
     */
    sales: {
        getAll: function() {
            return LeDiplomate.dataManager.data.sales;
        },
        
        getById: function(id) {
            return LeDiplomate.dataManager.data.sales.find(sale => sale.id === id);
        },
        
        add: function(sale) {
            // Générer un ID et date si non fournis
            if (!sale.id) {
                sale.id = 'sale-' + LeDiplomate.generateId();
            }
            if (!sale.date) {
                sale.date = new Date().toISOString();
            }
            
            // Mettre à jour le stock
            sale.items.forEach(item => {
                LeDiplomate.dataManager.stock.updateQuantity(item.productId, -item.quantity);
            });
            
            LeDiplomate.dataManager.data.sales.push(sale);
            LeDiplomate.dataManager.saveAllData();
            return sale;
        },
        
        update: function(sale) {
            const index = LeDiplomate.dataManager.data.sales.findIndex(s => s.id === sale.id);
            if (index !== -1) {
                // Restaurer le stock pour l'ancienne vente
                const oldSale = LeDiplomate.dataManager.data.sales[index];
                oldSale.items.forEach(item => {
                    LeDiplomate.dataManager.stock.updateQuantity(item.productId, item.quantity);
                });
                
                // Mettre à jour le stock pour la nouvelle vente
                sale.items.forEach(item => {
                    LeDiplomate.dataManager.stock.updateQuantity(item.productId, -item.quantity);
                });
                
                LeDiplomate.dataManager.data.sales[index] = sale;
                LeDiplomate.dataManager.saveAllData();
                return sale;
            }
            return null;
        },
        
        delete: function(id) {
            const index = LeDiplomate.dataManager.data.sales.findIndex(s => s.id === id);
            if (index !== -1) {
                // Restaurer le stock
                const sale = LeDiplomate.dataManager.data.sales[index];
                sale.items.forEach(item => {
                    LeDiplomate.dataManager.stock.updateQuantity(item.productId, item.quantity);
                });
                
                LeDiplomate.dataManager.data.sales.splice(index, 1);
                LeDiplomate.dataManager.saveAllData();
                return true;
            }
            return false;
        },
        
        getDetailedSales: function() {
            // Retourne les ventes avec les détails des produits
            return LeDiplomate.dataManager.data.sales.map(sale => {
                const detailedItems = sale.items.map(item => {
                    const product = LeDiplomate.dataManager.products.getById(item.productId);
                    return {
                        ...item,
                        product
                    };
                });
                
                return {
                    ...sale,
                    items: detailedItems
                };
            });
        },
        
        filterSales: function(filters = {}) {
            let sales = this.getDetailedSales();
            
            // Filtrer par date
            if (filters.dateFrom) {
                const dateFrom = new Date(filters.dateFrom);
                sales = sales.filter(sale => new Date(sale.date) >= dateFrom);
            }
            
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59, 999); // Fin de la journée
                sales = sales.filter(sale => new Date(sale.date) <= dateTo);
            }
            
            // Filtrer par marque
            if (filters.brand) {
                sales = sales.filter(sale => {
                    return sale.items.some(item => 
                        item.product && item.product.brand === filters.brand
                    );
                });
            }
            
            // Filtrer par fournisseur
            if (filters.supplierId) {
                sales = sales.filter(sale => {
                    return sale.items.some(item => {
                        const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
                        return stockItem && stockItem.supplierId === filters.supplierId;
                    });
                });
            }
            
            return sales;
        }
    },
    
    /**
     * Méthodes pour les étiquettes
     */
    labels: {
        getAll: function() {
            return LeDiplomate.dataManager.data.labels;
        },
        
        add: function(label) {
            LeDiplomate.dataManager.data.labels.push(label);
            LeDiplomate.dataManager.saveAllData();
            return label;
        },
        
        update: function(index, label) {
            if (index >= 0 && index < LeDiplomate.dataManager.data.labels.length) {
                LeDiplomate.dataManager.data.labels[index] = label;
                LeDiplomate.dataManager.saveAllData();
                return label;
            }
            return null;
        },
        
        delete: function(index) {
            if (index >= 0 && index < LeDiplomate.dataManager.data.labels.length) {
                LeDiplomate.dataManager.data.labels.splice(index, 1);
                LeDiplomate.dataManager.saveAllData();
                return true;
            }
            return false;
        },
        
        clear: function() {
            LeDiplomate.dataManager.data.labels = [];
            LeDiplomate.dataManager.saveAllData();
        }
    },
    
    /**
     * Méthodes d'import/export
     */
    import: {
        fromExcel: function(file, dataType, callback) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    
                    // Prendre la première feuille
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Convertir en JSON
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    // Traiter selon le type de données
                    switch (dataType) {
                        case 'products':
                            importProducts(jsonData);
                            break;
                        case 'stock':
                            importStock(jsonData);
                            break;
                        case 'suppliers':
                            importSuppliers(jsonData);
                            break;
                        case 'labels':
                            importLabels(jsonData);
                            break;
                        default:
                            callback({success: false, message: 'Type de données non reconnu'});
                            return;
                    }
                    
                    callback({success: true, message: 'Importation réussie', count: jsonData.length});
                } catch (error) {
                    console.error('Erreur lors de l\'importation:', error);
                    callback({success: false, message: 'Erreur lors de l\'importation'});
                }
            };
            
            reader.readAsArrayBuffer(file);
            
            // Fonctions d'importation spécifiques
            function importProducts(jsonData) {
                jsonData.forEach(row => {
                    const product = {
                        id: 'prod-' + LeDiplomate.generateId(),
                        brand: row['Marque'] || row['Brand'] || '',
                        name: row['Nom'] || row['Nom du cigare'] || row['Name'] || '',
                        country: row['Pays'] || row['Pays d\'origine'] || row['Country'] || '',
                        vitole: row['Vitole'] || '',
                        wrapper: row['Cape'] || row['Wrapper'] || '',
                        binder: row['Sous-cape'] || row['Binder'] || '',
                        filler: row['Tripe'] || row['Filler'] || '',
                        strength: row['Force'] || row['Force/Intensité'] || row['Strength'] || 'Moyenne'
                    };
                    
                    // Vérifier si le produit existe déjà (par marque et nom)
                    const existingProduct = LeDiplomate.dataManager.data.products.find(p => 
                        p.brand === product.brand && p.name === product.name
                    );
                    
                    if (existingProduct) {
                        // Mettre à jour le produit existant
                        Object.assign(existingProduct, product);
                    } else {
                        // Ajouter le nouveau produit
                        LeDiplomate.dataManager.data.products.push(product);
                    }
                });
                
                LeDiplomate.dataManager.saveAllData();
            }
            
            function importStock(jsonData) {
                jsonData.forEach(row => {
                    // Trouver le produit correspondant
                    let productId = null;
                    
                    // Si l'ID du produit est directement fourni
                    if (row['ProductId'] || row['IdProduit']) {
                        productId = row['ProductId'] || row['IdProduit'];
                    } else {
                        // Rechercher par marque et nom
                        const brand = row['Marque'] || row['Brand'] || '';
                        const name = row['Nom'] || row['Nom du cigare'] || row['Name'] || '';
                        
                        const product = LeDiplomate.dataManager.data.products.find(p => 
                            p.brand === brand && p.name === name
                        );
                        
                        if (product) {
                            productId = product.id;
                        } else {
                            // Créer un nouveau produit si nécessaire
                            const newProduct = {
                                id: 'prod-' + LeDiplomate.generateId(),
                                brand: brand,
                                name: name,
                                country: row['Pays'] || row['Pays d\'origine'] || row['Country'] || '',
                                vitole: row['Vitole'] || '',
                                wrapper: row['Cape'] || row['Wrapper'] || '',
                                binder: row['Sous-cape'] || row['Binder'] || '',
                                filler: row['Tripe'] || row['Filler'] || '',
                                strength: row['Force'] || row['Force/Intensité'] || row['Strength'] || 'Moyenne'
                            };
                            
                            LeDiplomate.dataManager.data.products.push(newProduct);
                            productId = newProduct.id;
                        }
                    }
                    
                    // Trouver le fournisseur correspondant
                    let supplierId = null;
                    
                    // Si l'ID du fournisseur est directement fourni
                    if (row['SupplierId'] || row['IdFournisseur']) {
                        supplierId = row['SupplierId'] || row['IdFournisseur'];
                    } else {
                        // Rechercher par nom
                        const supplierName = row['Fournisseur'] || row['Supplier'] || '';
                        
                        const supplier = LeDiplomate.dataManager.data.suppliers.find(s => 
                            s.name === supplierName
                        );
                        
                        if (supplier) {
                            supplierId = supplier.id;
                        } else if (supplierName) {
                            // Créer un nouveau fournisseur si nécessaire
                            const newSupplier = {
                                id: 'sup-' + LeDiplomate.generateId(),
                                name: supplierName,
                                contact: '',
                                email: '',
                                phone: '',
                                country: ''
                            };
                            
                            LeDiplomate.dataManager.data.suppliers.push(newSupplier);
                            supplierId = newSupplier.id;
                        } else {
                            // Utiliser le premier fournisseur disponible
                            if (LeDiplomate.dataManager.data.suppliers.length > 0) {
                                supplierId = LeDiplomate.dataManager.data.suppliers[0].id;
                            }
                        }
                    }
                    
                    // Vérifier si l'article existe déjà en stock
                    const existingStockItem = LeDiplomate.dataManager.data.stock.find(item => 
                        item.productId === productId
                    );
                    
                    const quantity = parseInt(row['Quantité'] || row['Quantity'] || 0);
                    const price = parseFloat(row['Prix'] || row['Price'] || 0);
                    
                    if (existingStockItem) {
                        // Mettre à jour l'article existant
                        existingStockItem.quantity = quantity;
                        existingStockItem.price = price;
                        if (supplierId) {
                            existingStockItem.supplierId = supplierId;
                        }
                    } else if (productId) {
                        // Ajouter un nouvel article en stock
                        const stockItem = {
                            id: 'stock-' + LeDiplomate.generateId(),
                            productId: productId,
                            supplierId: supplierId,
                            quantity: quantity,
                            price: price
                        };
                        
                        LeDiplomate.dataManager.data.stock.push(stockItem);
                    }
                });
                
                LeDiplomate.dataManager.saveAllData();
            }
            
            function importSuppliers(jsonData) {
                jsonData.forEach(row => {
                    const supplier = {
                        id: 'sup-' + LeDiplomate.generateId(),
                        name: row['Nom'] || row['Name'] || '',
                        contact: row['Contact'] || '',
                        email: row['Email'] || '',
                        phone: row['Téléphone'] || row['Phone'] || '',
                        country: row['Pays'] || row['Country'] || ''
                    };
                    
                    // Vérifier si le fournisseur existe déjà (par nom)
                    const existingSupplier = LeDiplomate.dataManager.data.suppliers.find(s => 
                        s.name === supplier.name
                    );
                    
                    if (existingSupplier) {
                        // Mettre à jour le fournisseur existant
                        Object.assign(existingSupplier, supplier);
                    } else {
                        // Ajouter le nouveau fournisseur
                        LeDiplomate.dataManager.data.suppliers.push(supplier);
                    }
                });
                
                LeDiplomate.dataManager.saveAllData();
            }
            
            function importLabels(jsonData) {
                const labels = jsonData.map(row => ({
                    brand: row['Marque'] || row['Brand'] || '',
                    name: row['Nom'] || row['Nom du cigare'] || row['Name'] || '',
                    country: row['Pays'] || row['Pays d\'origine'] || row['Country'] || '',
                    vitole: row['Vitole'] || '',
                    wrapper: row['Cape'] || row['Wrapper'] || '',
                    binder: row['Sous-cape'] || row['Binder'] || '',
                    filler: row['Tripe'] || row['Filler'] || '',
                    strength: row['Force'] || row['Force/Intensité'] || row['Strength'] || 'Moyenne',
                    price: row['Prix'] || row['Price'] || ''
                }));
                
                LeDiplomate.dataManager.data.labels = labels;
                LeDiplomate.dataManager.saveAllData();
            }
        }
    },
    
    export: {
        toExcel: function(dataType) {
            let data = [];
            let fileName = 'export-le-diplomate.xlsx';
            
            // Préparer les données selon le type
            switch (dataType) {
                case 'products':
                    data = LeDiplomate.dataManager.data.products.map(p => ({
                        'Marque': p.brand,
                        'Nom du cigare': p.name,
                        'Pays d\'origine': p.country,
                        'Vitole': p.vitole,
                        'Cape': p.wrapper,
                        'Sous-cape': p.binder,
                        'Tripe': p.filler,
                        'Force/Intensité': p.strength
                    }));
                    fileName = 'catalogue-produits.xlsx';
                    break;
                    
                case 'stock':
                    data = LeDiplomate.dataManager.stock.getFullStock().map(item => {
                        const product = item.product || {};
                        const supplier = item.supplier || {};
                        
                        return {
                            'Marque': product.brand || '',
                            'Nom du cigare': product.name || '',
                            'Pays d\'origine': product.country || '',
                            'Fournisseur': supplier.name || '',
                            'Quantité': item.quantity,
                            'Prix': item.price
                        };
                    });
                    fileName = 'stock-cigares.xlsx';
                    break;
                    
                case 'suppliers':
                    data = LeDiplomate.dataManager.data.suppliers.map(s => ({
                        'Nom': s.name,
                        'Contact': s.contact,
                        'Email': s.email,
                        'Téléphone': s.phone,
                        'Pays': s.country,
                        'Nombre de produits': LeDiplomate.dataManager.suppliers.getProductCount(s.id)
                    }));
                    fileName = 'fournisseurs.xlsx';
                    break;
                    
                case 'sales':
                    const detailedSales = LeDiplomate.dataManager.sales.getDetailedSales();
                    
                    data = [];
                    detailedSales.forEach(sale => {
                        const date = new Date(sale.date);
                        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                        
                        sale.items.forEach(item => {
                            const product = item.product || {};
                            
                            data.push({
                                'Date': formattedDate,
                                'ID Transaction': sale.id,
                                'Marque': product.brand || '',
                                'Nom du cigare': product.name || '',
                                'Quantité': item.quantity,
                                'Prix unitaire': item.price,
                                'Sous-total': item.price * item.quantity,
                                'Total transaction': sale.total,
                                'Méthode de paiement': sale.paymentMethod,
                                'Notes': sale.notes
                            });
                        });
                    });
                    fileName = 'historique-ventes.xlsx';
                    break;
                    
                case 'labels':
                    data = LeDiplomate.dataManager.data.labels.map(label => ({
                        'Marque': label.brand,
                        'Nom du cigare': label.name,
                        'Pays d\'origine': label.country,
                        'Vitole': label.vitole,
                        'Cape': label.wrapper,
                        'Sous-cape': label.binder,
                        'Tripe': label.filler,
                        'Force/Intensité': label.strength,
                        'Prix': label.price
                    }));
                    fileName = 'etiquettes-cigares.xlsx';
                    break;
                    
                default:
                    console.error('Type de données non reconnu pour l\'export');
                    return null;
            }
            
            // Créer le workbook
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Données');
            
            // Déclencher le téléchargement
            XLSX.writeFile(wb, fileName);
            
            return {
                success: true,
                fileName: fileName,
                count: data.length
            };
        }
    }
};
/**
 * Méthodes CRUD pour les ventes (version améliorée)
 */
LeDiplomate.dataManager.sales = {
    getAll: function() {
        return LeDiplomate.dataManager.data.sales;
    },
    
    getById: function(id) {
        return LeDiplomate.dataManager.data.sales.find(sale => sale.id === id);
    },
    
    add: function(sale) {
        // Générer un ID et date si non fournis
        if (!sale.id) {
            sale.id = 'sale-' + LeDiplomate.generateId();
        }
        if (!sale.date) {
            sale.date = new Date().toISOString();
        }
        
        // Vérifier le stock disponible pour chaque article
        for (const item of sale.items) {
            const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
            if (!stockItem || stockItem.quantity < item.quantity) {
                const product = LeDiplomate.dataManager.products.getById(item.productId);
                const productName = product ? `${product.brand} ${product.name}` : 'Produit inconnu';
                
                throw new Error(`Stock insuffisant pour ${productName} (${stockItem ? stockItem.quantity : 0} disponible, ${item.quantity} demandé)`);
            }
        }
        
        // Mettre à jour le stock
        sale.items.forEach(item => {
            LeDiplomate.dataManager.stock.updateQuantity(item.productId, -item.quantity);
        });
        
        LeDiplomate.dataManager.data.sales.push(sale);
        LeDiplomate.dataManager.saveAllData();
        return sale;
    },
    
    update: function(sale) {
        const index = LeDiplomate.dataManager.data.sales.findIndex(s => s.id === sale.id);
        if (index !== -1) {
            // Restaurer le stock pour l'ancienne vente
            const oldSale = LeDiplomate.dataManager.data.sales[index];
            oldSale.items.forEach(item => {
                LeDiplomate.dataManager.stock.updateQuantity(item.productId, item.quantity);
            });
            
            // Vérifier le stock disponible pour chaque article de la nouvelle vente
            for (const item of sale.items) {
                const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
                if (!stockItem || stockItem.quantity < item.quantity) {
                    // Restaurer le stock à l'état initial (avant cette fonction) en cas d'erreur
                    oldSale.items.forEach(oldItem => {
                        LeDiplomate.dataManager.stock.updateQuantity(oldItem.productId, -oldItem.quantity);
                    });
                    
                    const product = LeDiplomate.dataManager.products.getById(item.productId);
                    const productName = product ? `${product.brand} ${product.name}` : 'Produit inconnu';
                    
                    throw new Error(`Stock insuffisant pour ${productName} (${stockItem ? stockItem.quantity : 0} disponible, ${item.quantity} demandé)`);
                }
            }
            
            // Mettre à jour le stock pour la nouvelle vente
            sale.items.forEach(item => {
                LeDiplomate.dataManager.stock.updateQuantity(item.productId, -item.quantity);
            });
            
            LeDiplomate.dataManager.data.sales[index] = sale;
            LeDiplomate.dataManager.saveAllData();
            return sale;
        }
        return null;
    },
    
    delete: function(id) {
        const index = LeDiplomate.dataManager.data.sales.findIndex(s => s.id === id);
        if (index !== -1) {
            // Restaurer le stock
            const sale = LeDiplomate.dataManager.data.sales[index];
            sale.items.forEach(item => {
                LeDiplomate.dataManager.stock.updateQuantity(item.productId, item.quantity);
            });
            
            LeDiplomate.dataManager.data.sales.splice(index, 1);
            LeDiplomate.dataManager.saveAllData();
            return true;
        }
        return false;
    },
    
    getDetailedSales: function() {
        // Retourne les ventes avec les détails des produits
        return LeDiplomate.dataManager.data.sales.map(sale => {
            const detailedItems = sale.items.map(item => {
                const product = LeDiplomate.dataManager.products.getById(item.productId);
                return {
                    ...item,
                    product
                };
            });
            
            return {
                ...sale,
                items: detailedItems
            };
        });
    },
    
    filterSales: function(filters = {}) {
        let sales = this.getDetailedSales();
        
        // Filtrer par date
        if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom);
            sales = sales.filter(sale => new Date(sale.date) >= dateFrom);
        }
        
        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999); // Fin de la journée
            sales = sales.filter(sale => new Date(sale.date) <= dateTo);
        }
        
        // Filtrer par marque
        if (filters.brand) {
            sales = sales.filter(sale => {
                return sale.items.some(item => 
                    item.product && item.product.brand === filters.brand
                );
            });
        }
        
        // Filtrer par fournisseur
        if (filters.supplierId) {
            sales = sales.filter(sale => {
                return sale.items.some(item => {
                    const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
                    return stockItem && stockItem.supplierId === filters.supplierId;
                });
            });
        }
        
        return sales;
    }
};

// Méthode améliorée pour updateQuantity
LeDiplomate.dataManager.stock.updateQuantity = function(productId, delta) {
    const stockItem = this.getByProductId(productId);
    if (stockItem) {
        const newQuantity = stockItem.quantity + delta;
        if (newQuantity < 0) {
            throw new Error(`Impossible de mettre à jour le stock: quantité insuffisante pour le produit ${productId}`);
        }
        stockItem.quantity = newQuantity;
        LeDiplomate.dataManager.saveAllData();
        return stockItem;
    }
    return null;
};