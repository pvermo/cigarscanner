// Intégration des fournisseurs dans le catalogue de produits

// Mise à jour du formulaire d'ajout de produit
function updateProductForms() {
    // Mettre à jour le formulaire d'ajout
    const addForm = document.getElementById('addProductForm');
    if (addForm && !document.getElementById('productSupplier')) {
        // Créer le champ de sélection du fournisseur
        const supplierField = document.createElement('div');
        supplierField.className = 'mb-3';
        supplierField.innerHTML = `
            <label for="productSupplier" class="form-label">Fournisseur</label>
            <select class="form-select" id="productSupplier" required>
                <option value="">Sélectionnez un fournisseur</option>
                ${getSuppliers().map(supplier => `<option value="${supplier}">${supplier}</option>`).join('')}
            </select>
        `;
        
        // Insérer avant le dernier champ (prix)
        const priceField = addForm.querySelector('div:last-child');
        addForm.insertBefore(supplierField, priceField);
    }
    
    // Mettre à jour le formulaire d'édition
    const editForm = document.getElementById('editProductForm');
    if (editForm && !document.getElementById('editProductSupplier')) {
        // Créer le champ de sélection du fournisseur
        const supplierField = document.createElement('div');
        supplierField.className = 'mb-3';
        supplierField.innerHTML = `
            <label for="editProductSupplier" class="form-label">Fournisseur</label>
            <select class="form-select" id="editProductSupplier" required>
                <option value="">Sélectionnez un fournisseur</option>
                ${getSuppliers().map(supplier => `<option value="${supplier}">${supplier}</option>`).join('')}
            </select>
        `;
        
        // Insérer avant le dernier champ (prix)
        const priceField = editForm.querySelector('div:last-child');
        editForm.insertBefore(supplierField, priceField);
    }
}

// Mise à jour de la fonction addProductToCatalog pour inclure le fournisseur
const originalAddProductToCatalog = window.addProductToCatalog;
window.addProductToCatalog = function() {
    const brand = document.getElementById('productBrand').value.trim();
    const name = document.getElementById('productName').value.trim();
    const country = document.getElementById('productCountry').value.trim();
    const supplier = document.getElementById('productSupplier').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    
    if (!brand || !name || !country || !supplier || isNaN(price)) {
        showToast('Veuillez remplir tous les champs', 'danger');
        return;
    }
    
    const newProduct = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        brand,
        name,
        country,
        supplier, // Nouveau champ fournisseur
        price
    };
    
    productCatalog.push(newProduct);
    saveToLocalStorage();
    renderCatalog();
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal.hide();
    
    // Réinitialiser le formulaire
    document.getElementById('addProductForm').reset();
    
    showToast('Produit ajouté avec succès', 'success');
};

// Mise à jour de la fonction editProduct pour inclure le fournisseur
const originalEditProduct = window.editProduct;
window.editProduct = function(productId) {
    const product = productCatalog.find(p => p.id === productId);
    
    if (!product) {
        showToast('Produit non trouvé', 'danger');
        return;
    }
    
    // Remplir le formulaire
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductBrand').value = product.brand;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCountry').value = product.country;
    document.getElementById('editProductPrice').value = product.price.toFixed(2);
    
    // Définir le fournisseur
    const supplierSelect = document.getElementById('editProductSupplier');
    if (supplierSelect) {
        if (product.supplier) {
            supplierSelect.value = product.supplier;
        } else {
            supplierSelect.value = '';
        }
    }
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
};

// Mise à jour de la fonction updateProduct pour inclure le fournisseur
const originalUpdateProduct = window.updateProduct;
window.updateProduct = function() {
    const id = document.getElementById('editProductId').value;
    const brand = document.getElementById('editProductBrand').value.trim();
    const name = document.getElementById('editProductName').value.trim();
    const country = document.getElementById('editProductCountry').value.trim();
    const supplier = document.getElementById('editProductSupplier').value.trim();
    const price = parseFloat(document.getElementById('editProductPrice').value);
    
    if (!id || !brand || !name || !country || !supplier || isNaN(price)) {
        showToast('Veuillez remplir tous les champs', 'danger');
        return;
    }
    
    // Trouver et mettre à jour le produit
    const index = productCatalog.findIndex(p => p.id === id);
    if (index !== -1) {
        productCatalog[index] = {
            id,
            brand,
            name,
            country,
            supplier, // Nouveau champ fournisseur
            price
        };
        
        saveToLocalStorage();
        renderCatalog();
        
        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        
        showToast('Produit mis à jour avec succès', 'success');
    } else {
        showToast('Produit non trouvé', 'danger');
    }
};

// Mise à jour de renderCatalog pour afficher le fournisseur
const originalRenderCatalog = window.renderCatalog;
window.renderCatalog = function() {
    const catalogItemsEl = document.getElementById('catalog-items');
    
    if (productCatalog.length === 0) {
        catalogItemsEl.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Aucun produit dans le catalogue</td>
            </tr>
        `;
        return;
    }
    
    catalogItemsEl.innerHTML = '';
    productCatalog.forEach(product => {
        catalogItemsEl.innerHTML += `
            <tr>
                <td>${product.brand}</td>
                <td>${product.name}</td>
                <td>${product.country}</td>
                <td>${product.supplier || 'Non spécifié'}</td>
                <td>${product.price.toFixed(2)}€</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="generateQRCode('${product.id}')">
                        <i class="fas fa-qrcode"></i> Générer
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
};

// Mise à jour de l'en-tête du tableau du catalogue
function updateCatalogTableHeader() {
    const catalogTable = document.getElementById('catalog-table');
    if (catalogTable) {
        const thead = catalogTable.querySelector('thead tr');
        if (thead) {
            // Vérifier si la colonne "Fournisseur" existe déjà
            if (!Array.from(thead.querySelectorAll('th')).some(th => th.textContent === 'Fournisseur')) {
                // Créer la nouvelle cellule d'en-tête
                const supplierTh = document.createElement('th');
                supplierTh.textContent = 'Fournisseur';
                
                // Insérer avant la colonne "Prix"
                const priceTh = Array.from(thead.querySelectorAll('th')).find(th => th.textContent === 'Prix');
                if (priceTh) {
                    thead.insertBefore(supplierTh, priceTh);
                }
            }
        }
    }
}

// Mise à jour du QR code pour inclure le fournisseur
const originalGenerateQRCode = window.generateQRCode;
window.generateQRCode = function(productId) {
    const product = productCatalog.find(p => p.id === productId);
    
    if (!product) {
        showToast('Produit non trouvé', 'danger');
        return;
    }
    
    // Créer le contenu du QR code avec le fournisseur
    const qrContent = `Marque: ${product.brand}|Cigare: ${product.name}|Pays: ${product.country}|Fournisseur: ${product.supplier || 'Non spécifié'}|Prix: ${product.price.toFixed(2)}`;
    
    // URL pour générer un QR code via une API externe
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}`;
    
    // Créer une fenêtre pop-up avec le QR code
    const popupWindow = window.open('', '_blank', 'width=400,height=500');
    popupWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR Code - ${product.brand} ${product.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                h2 {
                    margin-bottom: 5px;
                }
                p {
                    margin: 5px 0;
                    color: #666;
                }
                img {
                    margin: 20px 0;
                    max-width: 100%;
                }
                button {
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 10px 2px;
                    cursor: pointer;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <h2>${product.brand} - ${product.name}</h2>
            <p>Pays: ${product.country}</p>
            <p>Fournisseur: ${product.supplier || 'Non spécifié'}</p>
            <p>Prix: ${product.price.toFixed(2)}€</p>
            <img src="${qrCodeUrl}" alt="QR Code">
            <br>
            <button onclick="window.print()">Imprimer</button>
        </body>
        </html>
    `);
};

// Mise à jour de l'export/import CSV pour inclure le fournisseur
// Mise à jour de la fonction exportCatalogCSV pour inclure le fournisseur
const originalExportCatalogCSV = window.exportCatalogCSV;
window.exportCatalogCSV = function() {
    if (productCatalog.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // Préparer les données
    const csvData = [];
    
    // En-têtes
    csvData.push(['Marque', 'Cigare', 'Pays', 'Fournisseur', 'Prix']);
    
    // Données
    productCatalog.forEach(product => {
        csvData.push([
            product.brand,
            product.name,
            product.country,
            product.supplier || '',
            product.price.toFixed(2)
        ]);
    });
    
    // Créer le fichier CSV
    const csv = Papa.unparse(csvData);
    downloadFile(csv, 'catalogue_produits.csv', 'text/csv');
};

// Mise à jour pour l'ajout du fournisseur à l'export Excel
function updateCatalogExcelExport() {
    // Modifier exportCatalogExcel pour inclure les fournisseurs
    if (typeof exportCatalogExcel === 'function') {
        const originalExportCatalogExcel = exportCatalogExcel;
        window.exportCatalogExcel = function() {
            if (productCatalog.length === 0) {
                showToast('Aucune donnée à exporter', 'warning');
                return;
            }
            
            // Préparer les données
            const headers = ['Marque', 'Nom', 'Pays', 'Fournisseur', 'Prix'];
            const rows = [headers];
            
            // Ajouter les données
            productCatalog.forEach(product => {
                rows.push([
                    product.brand,
                    product.name,
                    product.country,
                    product.supplier || 'Non spécifié',
                    product.price
                ]);
            });
            
            // Créer un workbook et une feuille
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(rows);
            
            // Formatage
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_col(C) + '1';
                if (!ws[address]) continue;
                ws[address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "CCCCCC" } }
                };
            }
            
            // Ajouter la feuille au workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
            
            // Générer un blob et télécharger
            XLSX.writeFile(wb, 'catalogue.xlsx');
        };
    }
    
    // Modifier generateCatalogExcelTemplate pour inclure les fournisseurs
    if (typeof generateCatalogExcelTemplate === 'function') {
        const originalGenerateCatalogExcelTemplate = generateCatalogExcelTemplate;
        window.generateCatalogExcelTemplate = function() {
            try {
                // Définir les en-têtes
                const headers = ['Marque', 'Nom', 'Pays', 'Fournisseur', 'Prix'];
                
                // Créer un exemple de données
                const sampleData = [
                    headers,
                    ['Cohiba', 'Robusto', 'Cuba', 'Coprova', 25.50],
                    ['Montecristo', 'No. 2', 'Cuba', 'Coprova', 22.00],
                    ['Davidoff', 'Grand Cru', 'République Dominicaine', 'Davidoff', 30.75],
                    ['', '', '', '', '']
                ];
                // Créer un workbook et une feuille
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(sampleData);
                
                // Ajouter la feuille au workbook
                XLSX.utils.book_append_sheet(wb, ws, 'Catalogue');
                
                // Générer un blob et télécharger directement
                XLSX.writeFile(wb, 'modele_catalogue.xlsx');
            } catch (error) {
                console.error('Erreur lors de la génération du modèle Excel:', error);
                showToast('Erreur lors de la génération du modèle Excel.', 'danger');
            }
        };
    }
    
    // Modifier processCatalogExcelFile pour inclure les fournisseurs
    if (typeof processCatalogExcelFile === 'function') {
        const originalProcessCatalogExcelFile = processCatalogExcelFile;
        window.processCatalogExcelFile = function(data) {
            try {
                // Lire le workbook
                const workbook = XLSX.read(data, {
                    type: 'array',
                    cellDates: true,
                    cellStyles: true
                });
                
                // Récupérer la première feuille
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convertir en JSON
                const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (excelData.length < 2) {
                    showToast('Le fichier Excel ne contient pas suffisamment de données.', 'warning');
                    return;
                }
                
                // Analyser les en-têtes
                const headers = excelData[0];
                
                // Vérifier le format minimal requis
                const requiredColumns = ['Marque', 'Nom', 'Pays', 'Prix'];
                const columnIndexes = {};
                
                // Trouver les index de colonnes
                requiredColumns.forEach(column => {
                    const index = headers.findIndex(header => 
                        typeof header === 'string' && header.trim().toLowerCase() === column.toLowerCase()
                    );
                    columnIndexes[column] = index;
                });
                
                // Trouver l'index du fournisseur (optionnel)
                const supplierIndex = headers.findIndex(header => 
                    typeof header === 'string' && header.trim().toLowerCase() === 'fournisseur'
                );
                columnIndexes['Fournisseur'] = supplierIndex;
                
                // Vérifier si toutes les colonnes requises sont présentes
                const missingColumns = requiredColumns.filter(column => columnIndexes[column] === -1);
                
                if (missingColumns.length > 0) {
                    showToast(`Colonnes manquantes: ${missingColumns.join(', ')}. Format Excel non valide.`, 'danger');
                    return;
                }
                
                // Demander confirmation avant d'importer
                showConfirmDialog(
                    'Importer le catalogue',
                    `Vous êtes sur le point d'importer ${excelData.length - 1} produits. Voulez-vous continuer?`,
                    () => {
                        // Vérifier si l'utilisateur veut remplacer ou ajouter
                        showConfirmDialog(
                            'Mode d\'importation',
                            'Voulez-vous remplacer le catalogue existant ou ajouter à celui-ci?',
                            () => {
                                // Remplacer le catalogue
                                importCatalogProducts(excelData, columnIndexes, true);
                            },
                            () => {
                                // Ajouter au catalogue
                                importCatalogProducts(excelData, columnIndexes, false);
                            },
                            'Remplacer',
                            'Ajouter'
                        );
                    }
                );
            } catch (error) {
                console.error('Erreur lors du traitement du fichier Excel:', error);
                showToast('Erreur lors du traitement du fichier Excel.', 'danger');
            } finally {
                // Réinitialiser l'input file
                document.getElementById('catalogExcelFileInput').value = '';
            }
        };
    }
    
    // Modifier importCatalogProducts pour inclure les fournisseurs
    if (typeof importCatalogProducts === 'function') {
        const originalImportCatalogProducts = importCatalogProducts;
        window.importCatalogProducts = function(excelData, columnIndexes, replace) {
            // Si on remplace, vider le catalogue actuel
            if (replace) {
                productCatalog = [];
            }
            
            let newCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            
            // Parcourir les lignes de données (en sautant l'en-tête)
            for (let i = 1; i < excelData.length; i++) {
                const row = excelData[i];
                
                // Vérifier que la ligne contient des données
                if (!row || row.length === 0) continue;
                
                // Extraire les données
                const brand = row[columnIndexes['Marque']];
                const name = row[columnIndexes['Nom']];
                const country = row[columnIndexes['Pays']];
                const price = parseFloat(row[columnIndexes['Prix']]);
                let supplier = '';
                
                // Extraire le fournisseur s'il existe
                if (columnIndexes['Fournisseur'] !== -1 && row[columnIndexes['Fournisseur']]) {
                    supplier = row[columnIndexes['Fournisseur']];
                    
                    // Vérifier si le fournisseur existe, sinon l'ajouter
                    const suppliers = getSuppliers();
                    if (!suppliers.includes(supplier)) {
                        addSupplier(supplier);
                    }
                }
                
                // Vérifier la validité des données
                if (!brand || !name || !country || isNaN(price) || price <= 0) {
                    errorCount++;
                    continue;
                }
                
                // Chercher si le produit existe déjà (par nom et marque)
                const existingIndex = productCatalog.findIndex(p => 
                    p.brand.toLowerCase() === brand.toString().toLowerCase() && 
                    p.name.toLowerCase() === name.toString().toLowerCase()
                );
                
                if (existingIndex !== -1) {
                    // Mettre à jour le produit existant
                    productCatalog[existingIndex].country = country;
                    productCatalog[existingIndex].price = price;
                    if (supplier) {
                        productCatalog[existingIndex].supplier = supplier;
                    }
                    updatedCount++;
                } else {
                    // Ajouter un nouveau produit
                    const newId = Date.now() + Math.random().toString(36).substr(2, 9);
                    productCatalog.push({
                        id: newId,
                        brand: brand,
                        name: name,
                        country: country,
                        supplier: supplier,
                        price: price
                    });
                    newCount++;
                }
            }
            
            // Sauvegarder et rafraîchir
            saveToLocalStorage();
            renderCatalog();
            
            // Message récapitulatif
            showToast(`Import Excel terminé : ${newCount} nouveaux produits, ${updatedCount} produits mis à jour, ${errorCount} erreurs.`, 
                    errorCount > 0 ? 'warning' : 'success');
        };
    }
}