// Fonctions pour l'import Excel dans la gestion des stocks

// Ajouter un bouton d'import Excel à côté du bouton d'import CSV
// Fonction améliorée pour éviter les doublons du bouton d'import Excel
function addExcelImportButton() {
    // Vérifier si le bouton existe déjà (en utilisant un ID unique)
    if (document.getElementById('importExcelButton')) {
        return; // Le bouton existe déjà, ne rien faire
    }
    
    const importCSVButton = document.querySelector('button[onclick="importInventoryCSV()"]');
    if (importCSVButton) {
        // Créer le bouton avec un ID unique
        const excelButton = document.createElement('button');
        excelButton.id = 'importExcelButton'; // Identifiant unique
        excelButton.className = 'btn btn-outline-success me-2';
        excelButton.innerHTML = '<i class="fas fa-file-excel"></i> Importer Excel';
        excelButton.onclick = importInventoryExcel;
        
        // Insérer le bouton avant le bouton d'import CSV
        importCSVButton.parentNode.insertBefore(excelButton, importCSVButton);
    }
    
    // Ajouter aussi l'input file pour Excel (une seule fois)
    if (!document.getElementById('excelFileInput')) {
        const body = document.querySelector('body');
        const excelInput = document.createElement('input');
        excelInput.type = 'file';
        excelInput.id = 'excelFileInput';
        excelInput.accept = '.xlsx, .xls';
        excelInput.style.display = 'none';
        excelInput.onchange = handleExcelSelect;
        
        body.appendChild(excelInput);
    }
}

// Fonction pour déclencher l'importation Excel
function importInventoryExcel() {
    document.getElementById('excelFileInput').click();
}

// Fonction pour traiter le fichier Excel sélectionné
function handleExcelSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        processExcelFile(data);
    };
    reader.readAsArrayBuffer(file);
}

// Traitement du fichier Excel
function processExcelFile(data) {
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
        const requiredColumns = ['Marque', 'Nom', 'Quantité', 'Seuil d\'alerte'];
        const columnIndexes = {};
        
        // Trouver les index de colonnes
        requiredColumns.forEach(column => {
            const index = headers.findIndex(header => 
                typeof header === 'string' && header.trim().toLowerCase() === column.toLowerCase()
            );
            columnIndexes[column] = index;
        });
        
        // Vérifier si toutes les colonnes requises sont présentes
        const missingColumns = requiredColumns.filter(column => columnIndexes[column] === -1);
        
        if (missingColumns.length > 0) {
            showToast(`Colonnes manquantes: ${missingColumns.join(', ')}. Format Excel non valide.`, 'danger');
            return;
        }
        
        // Collecter les données
        let updatedCount = 0;
        let newCount = 0;
        let errorCount = 0;
        
        // Parcourir les lignes de données (en sautant l'en-tête)
        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            
            // Vérifier que la ligne contient des données
            if (!row || row.length === 0) continue;
            
            // Extraire les données de base
            const brand = row[columnIndexes['Marque']];
            const name = row[columnIndexes['Nom']];
            const quantity = parseInt(row[columnIndexes['Quantité']]);
            const threshold = parseInt(row[columnIndexes['Seuil d\'alerte']]);
            
            // Vérifier la validité des données
            if (!brand || !name || isNaN(quantity) || isNaN(threshold)) {
                errorCount++;
                continue;
            }
            
            // Trouver le produit correspondant dans le catalogue
            const product = productCatalog.find(p => 
                p.brand.toLowerCase() === brand.toString().toLowerCase() && 
                p.name.toLowerCase() === name.toString().toLowerCase()
            );
            
            if (!product) {
                errorCount++;
                continue;
            }
            
            // Trouver ou créer l'élément d'inventaire
            let inventoryItem = inventoryItems.find(item => item.productId === product.id);
            
            if (inventoryItem) {
                // Mettre à jour l'élément existant
                const adjustment = new StockAdjustment(
                    quantity - inventoryItem.quantity,
                    'import',
                    'Import Excel'
                );
                
                inventoryItem.quantity = quantity;
                inventoryItem.threshold = threshold;
                inventoryItem.addHistory(adjustment);
                
                updatedCount++;
            } else {
                // Créer un nouvel élément
                inventoryItem = new InventoryItem(product.id, quantity, threshold);
                
                const adjustment = new StockAdjustment(
                    quantity,
                    'initial',
                    'Import Excel'
                );
                
                inventoryItem.addHistory(adjustment);
                inventoryItems.push(inventoryItem);
                
                newCount++;
            }
        }
        
        // Sauvegarder et rafraîchir
        saveInventoryData();
        renderInventory();
        updateInventoryStats();
        
        // Message récapitulatif
        showToast(`Import Excel terminé : ${updatedCount} produits mis à jour, ${newCount} nouveaux produits, ${errorCount} erreurs.`, 
        errorCount > 0 ? 'warning' : 'success');
    } catch (error) {
        console.error('Erreur lors du traitement du fichier Excel:', error);
        showToast('Erreur lors du traitement du fichier Excel.', 'danger');
    }
    
    // Réinitialiser l'input file
    document.getElementById('excelFileInput').value = '';
}

// Fonction pour générer un modèle Excel
function generateExcelTemplate() {
    try {
        // Définir les en-têtes
        const headers = ['Marque', 'Nom', 'Pays', 'Quantité', 'Seuil d\'alerte', 'Prix'];
        
        // Créer un exemple de données
        const sampleData = [
            headers,
            ['Cohiba', 'Robusto', 'Cuba', 10, 5, 25.50],
            ['Montecristo', 'No. 2', 'Cuba', 15, 8, 22.00],
            ['', '', '', '', '', '']
        ];
        
        // Créer un workbook et une feuille
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        
        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
        
        // Générer un blob et télécharger directement
        XLSX.writeFile(wb, 'modele_inventaire.xlsx');
    } catch (error) {
        console.error('Erreur lors de la génération du modèle Excel:', error);
        showToast('Erreur lors de la génération du modèle Excel.', 'danger');
    }
}

// Ajouter un bouton pour télécharger le modèle Excel
function addTemplateButton() {
    const inventorySection = document.querySelector('#inventory');
    if (inventorySection) {
        const buttonsContainer = inventorySection.querySelector('.d-flex.justify-content-between.align-items-center div');
        
        if (buttonsContainer) {
            // Vérifier si le bouton existe déjà
            if (!document.getElementById('downloadTemplateBtn')) {
                const templateButton = document.createElement('button');
                templateButton.id = 'downloadTemplateBtn';
                templateButton.className = 'btn btn-outline-info me-2';
                templateButton.innerHTML = '<i class="fas fa-download"></i> Modèle Excel';
                templateButton.onclick = generateExcelTemplate;
                
                // Ajouter le bouton en premier
                if (buttonsContainer.firstChild) {
                    buttonsContainer.insertBefore(templateButton, buttonsContainer.firstChild);
                } else {
                    buttonsContainer.appendChild(templateButton);
                }
            }
        }
    }
}

// Initialiser les fonctionnalités d'import Excel
function initExcelImport() {
    // S'assurer que la bibliothèque XLSX est disponible
    if (typeof XLSX !== 'undefined') {
        addExcelImportButton();
        addTemplateButton();
    } else {
        console.error('La bibliothèque SheetJS (XLSX) n\'est pas disponible.');
    }
}

// Ajouter à l'initialisation du module de gestion des stocks
document.addEventListener('DOMContentLoaded', function() {
    // S'abonner à un événement pour l'onglet Stocks
    const inventoryTab = document.getElementById('inventory-tab');
    if (inventoryTab) {
        inventoryTab.addEventListener('shown.bs.tab', function() {
            // Initialiser l'import Excel quand l'onglet est affiché
            initExcelImport();
        });
    }
    
    // Appeler aussi lors du chargement initial
    setTimeout(initExcelImport, 1000);
});

// Exporter l'inventaire au format Excel
function exportInventoryExcel() {
    if (inventoryItems.length === 0) {
        showToast('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // Préparer les données
    const headers = ['Marque', 'Nom', 'Pays', 'Quantité', 'Seuil d\'alerte', 'Prix unitaire', 'Valeur', 'Catégorie', 'Dernière mise à jour'];
    const rows = [headers];
    
    // Ajouter les données
    inventoryItems.forEach(item => {
        const product = productCatalog.find(p => p.id === item.productId);
        if (!product) return;
        
        rows.push([
            product.brand,
            product.name,
            product.country,
            item.quantity,
            item.threshold,
            product.price,
            product.price * item.quantity,
            item.category,
            new Date(item.lastUpdated).toLocaleDateString()
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
    
    // Fusionner les cellules d'en-tête
    //ws['!merges'] = [];
    
    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
    
    // Générer un blob et télécharger
    XLSX.writeFile(wb, 'inventaire.xlsx');
}

// Ajouter le bouton d'export Excel
function addExcelExportButton() {
    const exportCSVButton = document.querySelector('button[onclick="exportInventoryCSV()"]');
    if (exportCSVButton) {
        const exportExcelButton = document.createElement('button');
        exportExcelButton.className = 'btn btn-outline-success me-2';
        exportExcelButton.innerHTML = '<i class="fas fa-file-excel"></i> Exporter Excel';
        exportExcelButton.onclick = exportInventoryExcel;
        
        exportCSVButton.parentNode.insertBefore(exportExcelButton, exportCSVButton);
    }
}

// Compléter l'initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les fonctionnalités d'export Excel
    setTimeout(addExcelExportButton, 1000);
});