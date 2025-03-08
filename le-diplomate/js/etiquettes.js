/**
 * Module Étiquettes - Le Diplomate
 * Intègre le générateur d'étiquettes existant
 */

// Initialiser le module d'étiquettes
LeDiplomate.etiquettes = {
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Étiquettes');
        
        // Injecter le contenu du générateur d'étiquettes existant
        this.injectEtiquettesGenerator();
    },
    
    /**
     * Injecte le générateur d'étiquettes
     */
    injectEtiquettesGenerator: function() {
        const container = document.getElementById('etiquettes-container');
        
        // Créer les éléments nécessaires du générateur d'étiquettes
        container.innerHTML = `
            <div class="controls">
                <div class="tabs">
                    <div class="tab active" data-tab="manuel">Saisie Manuelle</div>
                    <div class="tab" data-tab="excel">Import Excel</div>
                    <div class="tab" data-tab="etiquettes">Étiquettes Enregistrées</div>
                    <div class="tab" data-tab="catalogue">Depuis Catalogue</div>
                </div>
                
                <div id="tab-manuel" class="tab-content active">
                    <div class="form-group">
                        <label for="brand">Marque:</label>
                        <input type="text" id="brand" placeholder="Ex: Montecristo">
                    </div>
                    
                    <div class="form-group">
                        <label for="cigarName">Nom du Cigare:</label>
                        <input type="text" id="cigarName" placeholder="Ex: No. 2">
                    </div>
                    
                    <div class="form-group">
                        <label for="country">Pays d'origine:</label>
                        <input type="text" id="country" placeholder="Ex: Cuba">
                    </div>
                    
                    <div class="form-group">
                        <label for="vitole">Vitole:</label>
                        <input type="text" id="vitole" placeholder="Ex: Pirámide (52 x 156mm)">
                    </div>
                    
                    <div class="form-group">
                        <label for="wrapper">Cape:</label>
                        <input type="text" id="wrapper" placeholder="Ex: Cubaine">
                    </div>
                    
                    <div class="form-group">
                        <label for="binder">Sous-cape:</label>
                        <input type="text" id="binder" placeholder="Ex: Cubaine">
                    </div>
                    
                    <div class="form-group">
                        <label for="filler">Tripe:</label>
                        <input type="text" id="filler" placeholder="Ex: Cubaine">
                    </div>
                    
                    <div class="form-group">
                        <label for="strength">Force/Intensité:</label>
                        <select id="strength">
                            <option value="Légère">Légère</option>
                            <option value="Légère-Moyenne">Légère-Moyenne</option>
                            <option value="Moyenne" selected>Moyenne</option>
                            <option value="Moyenne-Forte">Moyenne-Forte</option>
                            <option value="Forte">Forte</option>
                            <option value="Très Forte">Très Forte</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="price">Prix:</label>
                        <input type="text" id="price" placeholder="Ex: 12.50€">
                    </div>
                    
                    <button id="addLabel" class="btn primary">Ajouter Étiquette</button>
                    <p><em>Les QR codes feront 2cm x 2cm à l'impression.</em></p>
                </div>
                
                <div id="tab-excel" class="tab-content">
                    <div class="file-upload">
                        <p>Importez votre fichier Excel contenant les informations de vos cigares:</p>
                        <input type="file" id="excelFile" accept=".xlsx, .xls, .csv">
                        
                        <p><small>Colonnes attendues: Marque, Nom du cigare, Pays d'origine, Vitole, Cape, Sous-cape, Tripe, Force/Intensité, Prix</small></p>
                        
                        <button id="downloadTemplate" class="btn secondary">Télécharger modèle Excel</button>
                    </div>
                    
                    <div id="excel-preview-container" style="display: none;">
                        <h3>Aperçu des données:</h3>
                        <div style="overflow-x: auto;">
                            <table id="excel-preview" class="data-table"></table>
                        </div>
                        
                        <div class="excel-controls">
                            <button id="importAllLabels" class="btn primary">Importer les Étiquettes</button>
                            <button id="cancelImport" class="btn secondary">Annuler</button>
                        </div>
                    </div>
                </div>
                
                <div id="tab-etiquettes" class="tab-content">
                    <div class="label-actions">
                        <button id="printLabels" class="btn primary">Imprimer les Étiquettes</button>
                        <button id="clearLabels" class="btn secondary">Effacer Toutes</button>
                    </div>
                    
                    <div class="saved-labels">
                        <div id="savedLabelsList"></div>
                    </div>
                </div>
                
                <div id="tab-catalogue" class="tab-content">
                    <div class="search-bar mb-10">
                        <input type="text" id="catalogue-search" placeholder="Rechercher un produit...">
                        <button id="catalogue-search-btn" class="btn primary">Rechercher</button>
                    </div>
                    
                    <div id="catalogue-products" class="catalogue-products"></div>
                </div>
            </div>
            
            <div class="print-sheet">
                <div id="printContainer" class="print-container"></div>
            </div>
        `;
        
        // Initialiser les fonctionnalités
        this.initEtiquettesGenerator();
    },
    
    /**
     * Initialise les fonctionnalités du générateur d'étiquettes
     */
    initEtiquettesGenerator: function() {
        // Variables
        let labels = LeDiplomate.dataManager.labels.getAll() || [];
        let excelData = [];
        
        // Fonction pour générer un QR code
        function generateQRCode(text, container) {
            try {
                // Utiliser la bibliothèque qrcode
                const qr = qrcode(0, 'L');
                qr.addData(text);
                qr.make();
                
                const img = document.createElement('img');
                img.src = qr.createDataURL(4);
                img.style.display = 'block';
                img.style.width = '100%';
                img.style.height = '100%';
                
                container.innerHTML = '';
                container.appendChild(img);
            } catch (error) {
                console.error('Erreur lors de la génération du QR code:', error);
            }
        }
        
        // Fonction pour changer d'onglet
        function changeTab(tabId) {
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        }
        
        // Fonction pour ajouter une étiquette
        function addLabel() {
            const brand = document.getElementById('brand').value;
            const name = document.getElementById('cigarName').value;
            const country = document.getElementById('country').value;
            const vitole = document.getElementById('vitole').value;
            const wrapper = document.getElementById('wrapper').value;
            const binder = document.getElementById('binder').value;
            const filler = document.getElementById('filler').value;
            const strength = document.getElementById('strength').value;
            const price = document.getElementById('price').value;
            
            if (!name) {
                alert('Veuillez entrer au moins le nom du cigare.');
                return;
            }
            
            const label = {
                brand, name, country, vitole, wrapper, binder, filler, strength, price
            };
            
            // Ajouter l'étiquette
            LeDiplomate.dataManager.labels.add(label);
            labels = LeDiplomate.dataManager.labels.getAll();
            
            // Mettre à jour les vues
            updateLabelsList();
            updatePrintPreview();
            
            // Réinitialiser le formulaire
            document.getElementById('brand').value = '';
            document.getElementById('cigarName').value = '';
            document.getElementById('country').value = '';
            document.getElementById('vitole').value = '';
            document.getElementById('wrapper').value = '';
            document.getElementById('binder').value = '';
            document.getElementById('filler').value = '';
            document.getElementById('strength').value = 'Moyenne';
            document.getElementById('price').value = '';
            
            changeTab('etiquettes');
        }
        
        // Fonction pour mettre à jour la liste des étiquettes
        function updateLabelsList() {
            const listElement = document.getElementById('savedLabelsList');
            listElement.innerHTML = '';
            
            if (labels.length === 0) {
                listElement.innerHTML = '<p>Aucune étiquette enregistrée.</p>';
                return;
            }
            
            labels.forEach((label, index) => {
                const item = document.createElement('div');
                item.className = 'saved-label-item';
                item.innerHTML = `
                    <div>${label.brand || ''} ${label.name || ''} (${label.country || '--'})</div>
                    <div>
                        <button class="btn secondary btn-sm" onclick="LeDiplomate.etiquettes.editLabel(${index})">Modifier</button>
                        <button class="btn secondary btn-sm" onclick="LeDiplomate.etiquettes.removeLabel(${index})">Supprimer</button>
                    </div>
                `;
                listElement.appendChild(item);
            });
        }
        
        // Fonction pour mettre à jour l'aperçu d'impression
        function updatePrintPreview() {
            const container = document.getElementById('printContainer');
            container.innerHTML = '';
            
            labels.forEach((label, index) => {
                const etiquette = document.createElement('div');
                etiquette.className = 'etiquette';
                
                // Création d'un header qui ne chevauche pas le QR code
                const header = document.createElement('h4');
                header.innerHTML = `
                    <span class="brand">${label.brand || ''}</span>
                    <span class="cigar-name">${label.name || ''}</span>
                `;
                etiquette.appendChild(header);
                
                // Ajout des informations
                const info = document.createElement('div');
                info.innerHTML = `
                    <p><strong>Pays d'origine:</strong> ${label.country || '--'}</p>
                    <p><strong>Vitole:</strong> ${label.vitole || '--'}</p>
                    <p><strong>Cape:</strong> ${label.wrapper || '--'}</p>
                    <p><strong>Sous-cape:</strong> ${label.binder || '--'}</p>
                    <p><strong>Tripe:</strong> ${label.filler || '--'}</p>
                    <p><strong>Force/Intensité:</strong> ${label.strength || '--'}</p>
                `;
                etiquette.appendChild(info);
                
                if (label.price) {
                    const priceElement = document.createElement('div');
                    priceElement.className = 'price-display';
                    priceElement.textContent = label.price;
                    etiquette.appendChild(priceElement);
                }
                
                const qrContainer = document.createElement('div');
                qrContainer.className = 'qr-code-container';
                qrContainer.id = `qrcode-${index}`;
                etiquette.appendChild(qrContainer);
                
                container.appendChild(etiquette);
                
                // Générer le QR code
                const qrData = `Marque: ${label.brand || ''}|Cigare: ${label.name || ''}|Pays: ${label.country || ''}|Prix: ${label.price || ''}`;
                generateQRCode(qrData, qrContainer);
            });
        }
        
        // Fonction pour gérer l'import Excel
        function handleExcelImport(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    
                    // Prendre la première feuille
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    
                    // Convertir en JSON
                    excelData = XLSX.utils.sheet_to_json(firstSheet);
                    
                    // Afficher l'aperçu
                    showExcelPreview(excelData);
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier Excel:', error);
                    alert('Erreur lors de la lecture du fichier. Vérifiez le format.');
                }
            };
            
            reader.readAsArrayBuffer(file);
        }
        
        // Fonction pour afficher l'aperçu Excel
        function showExcelPreview(data) {
            const container = document.getElementById('excel-preview-container');
            const table = document.getElementById('excel-preview');
            
            container.style.display = 'block';
            table.innerHTML = '';
            
            if (data.length === 0) {
                table.innerHTML = '<tr><td>Aucune donnée trouvée dans le fichier.</td></tr>';
                return;
            }
            
            // Créer l'en-tête
            const headerRow = document.createElement('tr');
            const headers = Object.keys(data[0]);
            
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            
            table.appendChild(headerRow);
            
            // Afficher les premières lignes (max 5)
            const rowsToShow = Math.min(data.length, 5);
            
            for (let i = 0; i < rowsToShow; i++) {
                const tr = document.createElement('tr');
                
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = data[i][header] || '';
                    tr.appendChild(td);
                });
                
                table.appendChild(tr);
            }
        }
        
        // Fonction pour télécharger un modèle Excel
        function downloadTemplate() {
            const templateData = [
                {
                    'Marque': 'Montecristo',
                    'Nom du cigare': 'No. 2',
                    'Pays d\'origine': 'Cuba',
                    'Vitole': 'Pirámide (52 x 156mm)',
                    'Cape': 'Cubaine',
                    'Sous-cape': 'Cubaine',
                    'Tripe': 'Cubaine',
                    'Force/Intensité': 'Moyenne-Forte',
                    'Prix': '15.50€'
                },
                {
                    'Marque': 'Padron',
                    'Nom du cigare': '1964',
                    'Pays d\'origine': 'Nicaragua',
                    'Vitole': 'Torpedo',
                    'Cape': 'Maduro',
                    'Sous-cape': 'Nicaragua',
                    'Tripe': 'Nicaragua',
                    'Force/Intensité': 'Forte',
                    'Prix': '22.00€'
                }
            ];
            
            const ws = XLSX.utils.json_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Cigares');
            XLSX.writeFile(wb, 'modele_etiquettes_cigares.xlsx');
        }
        
        // Fonction pour rechercher des produits du catalogue
        function searchCatalogueProducts() {
            const query = document.getElementById('catalogue-search').value.trim();
            const resultsContainer = document.getElementById('catalogue-products');
            
            if (!query) {
                // Afficher tous les produits
                displayCatalogueProducts(LeDiplomate.dataManager.products.getAll());
            } else {
                // Rechercher les produits
                const products = LeDiplomate.dataManager.products.search(query);
                displayCatalogueProducts(products);
            }
        }
        
        // Fonction pour afficher les produits du catalogue
        function displayCatalogueProducts(products) {
            const container = document.getElementById('catalogue-products');
            container.innerHTML = '';
            
            if (products.length === 0) {
                container.innerHTML = '<p>Aucun produit trouvé</p>';
                return;
            }
            
            products.forEach(product => {
                const stockItem = LeDiplomate.dataManager.stock.getByProductId(product.id);
                const price = stockItem ? stockItem.price : '';
                
                const item = document.createElement('div');
                item.className = 'catalogue-item';
                item.innerHTML = `
                    <div>
                        <strong>${product.brand} ${product.name}</strong>
                        <div>Origine: ${product.country || '--'}</div>
                        <div>Vitole: ${product.vitole || '--'}</div>
                        ${stockItem ? `<div>Prix: ${LeDiplomate.formatPrice(stockItem.price)}€</div>` : ''}
                    </div>
                    <button class="btn primary btn-sm">Créer Étiquette</button>
                `;
                
                // Ajouter l'événement pour créer l'étiquette
                item.querySelector('button').addEventListener('click', () => {
                    const label = {
                        brand: product.brand,
                        name: product.name,
                        country: product.country,
                        vitole: product.vitole,
                        wrapper: product.wrapper,
                        binder: product.binder,
                        filler: product.filler,
                        strength: product.strength,
                        price: stockItem ? `${LeDiplomate.formatPrice(stockItem.price)}€` : ''
                    };
                    
                    // Ajouter l'étiquette
                    LeDiplomate.dataManager.labels.add(label);
                    labels = LeDiplomate.dataManager.labels.getAll();
                    
                    // Mettre à jour les vues
                    updateLabelsList();
                    updatePrintPreview();
                    
                    // Afficher l'onglet des étiquettes
                    changeTab('etiquettes');
                    
                    // Notification
                    LeDiplomate.notifications.show(`Étiquette créée pour ${product.brand} ${product.name}`, 'success');
                });
                
                container.appendChild(item);
            });
        }
        
        // Événements pour les onglets
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                changeTab(this.getAttribute('data-tab'));
            });
        });
        
        // Événement pour l'ajout d'étiquette
        document.getElementById('addLabel').addEventListener('click', addLabel);
        
        // Événements pour l'import Excel
        document.getElementById('excelFile').addEventListener('change', handleExcelImport);
        document.getElementById('importAllLabels').addEventListener('click', function() {
            if (excelData.length === 0) {
                alert('Aucune donnée à importer.');
                return;
            }
            
            // Importer les étiquettes
            const result = LeDiplomate.dataManager.import.fromExcel(
                document.getElementById('excelFile').files[0], 
                'labels', 
                result => {
                    if (result.success) {
                        LeDiplomate.notifications.show(`${result.count} étiquettes importées avec succès`, 'success');
                        
                        // Recharger les étiquettes
                        labels = LeDiplomate.dataManager.labels.getAll();
                        updateLabelsList();
                        updatePrintPreview();
                        
                        // Afficher l'onglet des étiquettes
                        changeTab('etiquettes');
                    } else {
                        LeDiplomate.notifications.show(`Erreur lors de l'importation: ${result.message}`, 'error');
                    }
                }
            );
            
            // Réinitialiser
            document.getElementById('excelFile').value = '';
            document.getElementById('excel-preview-container').style.display = 'none';
            excelData = [];
        });
        
        document.getElementById('cancelImport').addEventListener('click', function() {
            document.getElementById('excelFile').value = '';
            document.getElementById('excel-preview-container').style.display = 'none';
            excelData = [];
        });
        
        // Événement pour télécharger le modèle Excel
        document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);
        
        // Événement pour imprimer les étiquettes
        document.getElementById('printLabels').addEventListener('click', function() {
            if (labels.length === 0) {
                alert('Aucune étiquette à imprimer.');
                return;
            }
            
            window.print();
        });
        
        // Événement pour effacer toutes les étiquettes
        document.getElementById('clearLabels').addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir supprimer toutes les étiquettes ?')) {
                LeDiplomate.dataManager.labels.clear();
                labels = [];
                updateLabelsList();
                updatePrintPreview();
            }
        });
        
        // Événements pour la recherche dans le catalogue
        document.getElementById('catalogue-search').addEventListener('input', LeDiplomate.stock.debounce(searchCatalogueProducts, 300));
        document.getElementById('catalogue-search-btn').addEventListener('click', searchCatalogueProducts);
        
        // Exposer les fonctions nécessaires
        LeDiplomate.etiquettes.editLabel = function(index) {
            const label = labels[index];
            
            // Remplir le formulaire
            document.getElementById('brand').value = label.brand || '';
            document.getElementById('cigarName').value = label.name || '';
            document.getElementById('country').value = label.country || '';
            document.getElementById('vitole').value = label.vitole || '';
            document.getElementById('wrapper').value = label.wrapper || '';
            document.getElementById('binder').value = label.binder || '';
            document.getElementById('filler').value = label.filler || '';
            document.getElementById('strength').value = label.strength || 'Moyenne';
            document.getElementById('price').value = label.price || '';
            
            // Supprimer l'étiquette existante
            LeDiplomate.dataManager.labels.delete(index);
            labels = LeDiplomate.dataManager.labels.getAll();
            
            // Mettre à jour les vues
            updateLabelsList();
            updatePrintPreview();
            
            // Afficher l'onglet de saisie manuelle
            changeTab('manuel');
        };
        
        LeDiplomate.etiquettes.removeLabel = function(index) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette étiquette ?')) {
                LeDiplomate.dataManager.labels.delete(index);
                labels = LeDiplomate.dataManager.labels.getAll();
                updateLabelsList();
                updatePrintPreview();
            }
        };
        
        // Initialiser les vues
        updateLabelsList();
        updatePrintPreview();
        
        // Afficher les produits du catalogue
        searchCatalogueProducts();
        
        // Ajouter des styles pour l'impression
        const style = document.createElement('style');
        style.innerHTML = `
            .etiquette {
                width: 270px; 
                height: 212px;
                margin: 10px;
                padding: 12px;
                background-color: var(--background-light);
                border: 1px solid var(--border-color);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                position: relative;
                page-break-inside: avoid;
            }

            .etiquette h4 {
                text-align: center;
                margin-bottom: 12px;
                border-bottom: none;
                padding-bottom: 6px;
                padding-right: 80px;
            }

            .etiquette .brand {
                font-size: 12px;
                color: var(--secondary-brown);
                text-transform: uppercase;
                margin-bottom: 3px;
                display: block;
            }

            .etiquette .cigar-name {
                font-size: 16px;
                font-weight: bold;
                color: var(--text-dark-brown);
                display: block;
            }

            .etiquette p {
                margin: 4px 0;
                font-size: 10px;
                line-height: 1.3;
            }
            
            .etiquette strong {
                color: var(--text-dark-brown);
            }

            .etiquette .price-display {
                position: absolute;
                bottom: 8px;
                right: 15px;
                width: 75px;
                box-sizing: border-box;
                background-color: var(--primary-brown);
                color: white;
                padding: 3px 0;
                border-radius: 4px;
                font-weight: bold;
                text-align: center;
            }

            .qr-code-container {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 75px;
                height: 75px;
                background-color: var(--background-light);
                padding: 3px;
                border-radius: 4px;
                z-index: 10;
            }

            .qr-code-container img {
                width: 100%;
                height: 100%;
            }

            .print-sheet {
                width: 210mm;
                margin: 0 auto;
                background-color: white;
                padding: 10mm;
                box-shadow: 0 0 10px rgba(0,0,0,0.2);
            }

            .print-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-around;
            }
            
            .saved-label-item {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                border-bottom: 1px solid #eee;
                align-items: center;
            }
            
            .catalogue-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #eee;
                align-items: center;
            }
            
            .btn-sm {
                padding: 4px 8px;
                font-size: 12px;
            }
            
            @media print {
                @page {
                    size: A4;
                    margin: 10mm;
                }
                
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                .controls, h1, h2, header, nav, .label-actions {
                    display: none !important;
                }
                
                .module-container {
                    background: none;
                    box-shadow: none;
                    padding: 0;
                    margin: 0;
                }
                
                .print-sheet {
                    width: 100%;
                    box-shadow: none;
                    padding: 0;
                    margin: 0;
                }
                
                .qr-code-container {
                    width: 2cm !important;
                    height: 2cm !important;
                }
                
                .qr-code-container img {
                    width: 2cm !important;
                    height: 2cm !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
};