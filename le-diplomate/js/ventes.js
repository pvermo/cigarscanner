/**
 * Module Ventes - Le Diplomate (Version corrigée)
 * Gère les fonctionnalités de vente et le scanner QR Code
 */

// Initialiser le module de ventes
LeDiplomate.ventes = {
    // Variables du module
    scanner: null,
    videoStream: null,
    cart: [],
    
    /**
     * Initialise le module
     */
    init: function() {
        console.log('Initialisation du module Ventes');
        
        // Initialiser les gestionnaires d'événements
        this.initEventListeners();
        
        // Charger l'historique des ventes récentes
        this.loadRecentSales();
    },
    
    /**
     * Initialise les gestionnaires d'événements
     */
    initEventListeners: function() {
        console.log('Initialisation des gestionnaires d\'événements de vente');
        
        // Scanner QR Code
        const startScannerBtn = document.getElementById('start-scanner');
        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', this.startScanner.bind(this));
        } else {
            console.warn('Bouton "Activer Scanner" non trouvé dans le DOM');
        }
        
        const stopScannerBtn = document.getElementById('stop-scanner');
        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', this.stopScanner.bind(this));
        } else {
            console.warn('Bouton "Arrêter Scanner" non trouvé dans le DOM');
        }
        
        // Recherche manuelle
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.searchProducts.bind(this), 300));
        } else {
            console.warn('Champ de recherche produit non trouvé dans le DOM');
        }
        
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', this.searchProducts.bind(this));
        } else {
            console.warn('Bouton "Rechercher" non trouvé dans le DOM');
        }
        
        // Panier - CORRECTION: Vérification de l'existence et liaison explicite
        const completeSaleBtn = document.getElementById('complete-sale');
        if (completeSaleBtn) {
            console.log('Bouton "Valider la vente" trouvé, ajout du gestionnaire d\'événements');
            completeSaleBtn.addEventListener('click', () => {
                console.log('Bouton "Valider la vente" cliqué');
                this.showCompleteSaleModal();
            });
        } else {
            console.error('Bouton "Valider la vente" non trouvé dans le DOM');
        }
        
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', this.clearCart.bind(this));
        } else {
            console.warn('Bouton "Vider le panier" non trouvé dans le DOM');
        }
        
        // Formulaire de finalisation de vente - CORRECTION: Ajout du délai pour s'assurer que tout est initialisé
        setTimeout(() => {
            document.querySelector('body').addEventListener('submit', (e) => {
                console.log('Formulaire soumis:', e.target.id);
                if (e.target.id === 'complete-sale-form') {
                    e.preventDefault();
                    console.log('Finalisation de la vente...');
                    this.completeSale();
                }
            });
            
            console.log('Écouteur d\'événements de soumission de formulaire attaché au body');
        }, 500);
        
        // Écouter les actions sur l'historique des ventes
        const historyList = document.getElementById('sales-history-list');
        if (historyList) {
            historyList.addEventListener('click', e => {
                // Vérifier si c'est un bouton d'édition ou de suppression
                if (e.target.classList.contains('edit-sale-btn') || 
                    e.target.parentElement.classList.contains('edit-sale-btn')) {
                    const saleId = e.target.closest('.sale-item').dataset.saleId;
                    this.editSale(saleId);
                } else if (e.target.classList.contains('delete-sale-btn') || 
                           e.target.parentElement.classList.contains('delete-sale-btn')) {
                    const saleId = e.target.closest('.sale-item').dataset.saleId;
                    this.deleteSale(saleId);
                }
            });
        } else {
            console.warn('Conteneur d\'historique des ventes non trouvé dans le DOM');
        }
    },
    
    /**
     * Démarre le scanner QR Code
     */
    startScanner: function() {
        const videoElement = document.getElementById('scanner-video');
        const canvasElement = document.getElementById('scanner-canvas');
        const startButton = document.getElementById('start-scanner');
        const stopButton = document.getElementById('stop-scanner');
        
        if (!videoElement || !canvasElement) {
            console.error('Éléments du scanner non trouvés dans le DOM');
            return;
        }
        
        // Afficher le loader
        canvasElement.style.backgroundColor = '#ddd';
        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Initialisation de la caméra...', canvasElement.width / 2, canvasElement.height / 2);
        
        // Vérifier si le navigateur supporte l'API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            LeDiplomate.notifications.show('Votre navigateur ne supporte pas l\'accès à la caméra', 'error');
            return;
        }
        
        // Accéder à la caméra
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(stream => {
                this.videoStream = stream;
                videoElement.srcObject = stream;
                videoElement.play();
                videoElement.classList.remove('hidden');
                
                startButton.classList.add('hidden');
                stopButton.classList.remove('hidden');
                
                this.scanner = setInterval(() => {
                    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
                        // Dessiner la vidéo sur le canvas
                        canvasElement.height = videoElement.videoHeight;
                        canvasElement.width = videoElement.videoWidth;
                        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                        
                        // Analyser le QR code
                        const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'dontInvert',
                        });
                        
                        if (code) {
                            console.log('QR Code détecté:', code.data);
                            this.processQRCode(code.data);
                        }
                    }
                }, 500);
            })
            .catch(error => {
                console.error('Erreur d\'accès à la caméra:', error);
                LeDiplomate.notifications.show('Impossible d\'accéder à la caméra. Vérifiez les permissions.', 'error');
            });
    },
    
    /**
     * Arrête le scanner QR Code
     */
    stopScanner: function() {
        // Arrêter le scanner
        if (this.scanner) {
            clearInterval(this.scanner);
            this.scanner = null;
        }
        
        // Arrêter le flux vidéo
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        
        // Masquer la vidéo
        const videoElement = document.getElementById('scanner-video');
        if (videoElement) {
            videoElement.pause();
            videoElement.srcObject = null;
            videoElement.classList.add('hidden');
        }
        
        // Mettre à jour les boutons
        const startButton = document.getElementById('start-scanner');
        const stopButton = document.getElementById('stop-scanner');
        
        if (startButton) startButton.classList.remove('hidden');
        if (stopButton) stopButton.classList.add('hidden');
        
        // Réinitialiser le canvas
        const canvasElement = document.getElementById('scanner-canvas');
        if (canvasElement) {
            const ctx = canvasElement.getContext('2d');
            ctx.fillStyle = '#ddd';
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        }
    },
    
    /**
     * Traite les données d'un QR Code
     * @param {string} data - Données du QR Code
     */
    processQRCode: function(data) {
        try {
            // Le format attendu est "Marque: X|Cigare: Y|Pays: Z|Prix: W"
            const parts = data.split('|');
            let productInfo = {};
            
            parts.forEach(part => {
                const [key, value] = part.split(':').map(s => s.trim());
                if (key && value) {
                    if (key === 'Marque') productInfo.brand = value;
                    if (key === 'Cigare') productInfo.name = value;
                    if (key === 'Pays') productInfo.country = value;
                    if (key === 'Prix') productInfo.price = value.replace('€', '');
                }
            });
            
            // Rechercher le produit correspondant
            if (productInfo.brand && productInfo.name) {
                const products = LeDiplomate.dataManager.products.search(productInfo.brand + ' ' + productInfo.name);
                
                if (products.length > 0) {
                    // Prendre le premier produit correspondant
                    const product = products[0];
                    
                    // Vérifier si le produit est en stock
                    const stockItem = LeDiplomate.dataManager.stock.getByProductId(product.id);
                    
                    if (stockItem && stockItem.quantity > 0) {
                        // Ajouter au panier
                        this.addToCart(product.id, stockItem.price);
                        LeDiplomate.notifications.show(`${product.brand} ${product.name} ajouté au panier`, 'success');
                    } else {
                        LeDiplomate.notifications.show(`${product.brand} ${product.name} est en rupture de stock`, 'warning');
                    }
                } else {
                    LeDiplomate.notifications.show('Produit non trouvé dans le catalogue', 'error');
                }
            } else {
                LeDiplomate.notifications.show('QR Code non reconnu', 'error');
            }
        } catch (error) {
            console.error('Erreur lors du traitement du QR Code:', error);
            LeDiplomate.notifications.show('Format de QR Code non reconnu', 'error');
        }
    },
    
    /**
     * Recherche des produits dans le catalogue
     */
    searchProducts: function() {
        const query = document.getElementById('product-search').value;
        const resultsContainer = document.getElementById('search-results');
        
        if (!resultsContainer) {
            console.error('Conteneur de résultats de recherche non trouvé dans le DOM');
            return;
        }
        
        if (!query || query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        // Rechercher les produits
        const products = LeDiplomate.dataManager.products.search(query);
        
        if (products.length === 0) {
            resultsContainer.innerHTML = '<div class="search-item">Aucun produit trouvé</div>';
            return;
        }
        
        // Afficher les résultats
        resultsContainer.innerHTML = '';
        products.forEach(product => {
            // Vérifier si le produit est en stock
            const stockItem = LeDiplomate.dataManager.stock.getByProductId(product.id);
            
            if (stockItem && stockItem.quantity > 0) {
                const item = document.createElement('div');
                item.className = 'search-item';
                item.innerHTML = `
                    <span>${product.brand} ${product.name} (${product.country})</span>
                    <small>Prix: ${LeDiplomate.formatPrice(stockItem.price)}€ | Stock: ${stockItem.quantity}</small>
                `;
                
                item.addEventListener('click', () => {
                    this.addToCart(product.id, stockItem.price);
                    resultsContainer.innerHTML = '';
                    document.getElementById('product-search').value = '';
                });
                
                resultsContainer.appendChild(item);
            }
        });
    },
    
    /**
     * Ajoute un produit au panier
     * @param {string} productId - ID du produit
     * @param {number} price - Prix du produit
     */
    addToCart: function(productId, price) {
        // Vérifier si le produit est déjà dans le panier
        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            // Incrémenter la quantité
            existingItem.quantity += 1;
        } else {
            // Ajouter un nouvel article
            this.cart.push({
                productId: productId,
                price: parseFloat(price),
                quantity: 1
            });
        }
        
        // Mettre à jour l'affichage du panier
        this.updateCartDisplay();
    },
    
    /**
     * Met à jour l'affichage du panier
     */
    updateCartDisplay: function() {
        const cartContainer = document.getElementById('cart-items');
        const totalElement = document.getElementById('cart-total-amount');
        
        if (!cartContainer || !totalElement) {
            console.error('Éléments du panier non trouvés dans le DOM');
            return;
        }
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<div class="cart-empty">Le panier est vide</div>';
            totalElement.textContent = '0.00';
            return;
        }
        
        // Calculer le total
        let total = 0;
        
        // Afficher les articles
        cartContainer.innerHTML = '';
        this.cart.forEach((item, index) => {
            const product = LeDiplomate.dataManager.products.getById(item.productId);
            if (!product) {
                console.error('Produit non trouvé pour l\'ID:', item.productId);
                return;
            }
            
            const subtotal = item.price * item.quantity;
            total += subtotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <strong>${product.brand} ${product.name}</strong>
                    <div>${item.quantity} x ${LeDiplomate.formatPrice(item.price)}€ = ${LeDiplomate.formatPrice(subtotal)}€</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-decrease" title="Diminuer">-</button>
                    <button class="btn-increase" title="Augmenter">+</button>
                    <button class="btn-remove" title="Supprimer">×</button>
                </div>
            `;
            
            // Ajouter les événements
            cartItem.querySelector('.btn-decrease').addEventListener('click', () => this.decreaseQuantity(index));
            cartItem.querySelector('.btn-increase').addEventListener('click', () => this.increaseQuantity(index));
            cartItem.querySelector('.btn-remove').addEventListener('click', () => this.removeFromCart(index));
            
            cartContainer.appendChild(cartItem);
        });
        
        // Mettre à jour le total
        totalElement.textContent = LeDiplomate.formatPrice(total);
    },
    
    /**
     * Augmente la quantité d'un article du panier
     * @param {number} index - Index de l'article dans le panier
     */
    increaseQuantity: function(index) {
        if (index >= 0 && index < this.cart.length) {
            const item = this.cart[index];
            
            // Vérifier le stock disponible
            const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
            
            if (stockItem && item.quantity < stockItem.quantity) {
                item.quantity += 1;
                this.updateCartDisplay();
            } else {
                const product = LeDiplomate.dataManager.products.getById(item.productId);
                if (product) {
                    LeDiplomate.notifications.show(`Stock insuffisant pour ${product.brand} ${product.name}`, 'warning');
                } else {
                    LeDiplomate.notifications.show('Stock insuffisant', 'warning');
                }
            }
        }
    },
    
    /**
     * Diminue la quantité d'un article du panier
     * @param {number} index - Index de l'article dans le panier
     */
    decreaseQuantity: function(index) {
        if (index >= 0 && index < this.cart.length) {
            const item = this.cart[index];
            
            if (item.quantity > 1) {
                item.quantity -= 1;
                this.updateCartDisplay();
            } else {
                this.removeFromCart(index);
            }
        }
    },
    
    /**
     * Supprime un article du panier
     * @param {number} index - Index de l'article dans le panier
     */
    removeFromCart: function(index) {
        if (index >= 0 && index < this.cart.length) {
            this.cart.splice(index, 1);
            this.updateCartDisplay();
        }
    },
    
    /**
     * Vide le panier
     */
    clearCart: function() {
        if (this.cart.length === 0) return;
        
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            this.cart = [];
            this.updateCartDisplay();
        }
    },
    
    /**
     * Affiche la modale de finalisation de vente
     */
    /**
/**
 * Version corrigée de la méthode showCompleteSaleModal
 * Cette version s'assure que les éléments de la modale sont accessibles
 */
showCompleteSaleModal: function() {
    console.log('Tentative d\'affichage de la modale de finalisation de vente');
    
    if (this.cart.length === 0) {
        console.log('Le panier est vide, impossible de finaliser la vente');
        LeDiplomate.notifications.show('Le panier est vide', 'warning');
        return;
    }
    
    // Calculer le total et préparer les items
    let total = 0;
    const summaryItems = [];
    
    console.log('Contenu du panier:', JSON.stringify(this.cart));
    
    this.cart.forEach(item => {
        const product = LeDiplomate.dataManager.products.getById(item.productId);
        if (!product) {
            console.error('Produit non trouvé pour l\'ID:', item.productId);
            return;
        }
        
        const subtotal = item.price * item.quantity;
        console.log(`Calcul pour ${product.brand} ${product.name}: ${item.quantity} x ${item.price}€ = ${subtotal}€`);
        total += subtotal;
        
        summaryItems.push(`
            <div class="sale-summary-item">
                <span>${product.brand} ${product.name} (${item.quantity}x)</span>
                <span>${LeDiplomate.formatPrice(subtotal)}€</span>
            </div>
        `);
    });
    
    console.log('Total calculé:', total);
    const formattedTotal = LeDiplomate.formatPrice(total);
    
    // CORRECTION IMPORTANTE: Utiliser le callback de la modale pour mettre à jour le contenu
    // une fois que la modale est affichée et que les éléments sont dans le DOM
    const thisSaved = this; // Sauvegarder le contexte this
    
    // Créer une fonction de rappel pour mettre à jour les éléments après l'affichage de la modale
    function updateModalContent() {
        // Maintenant les éléments devraient être dans le DOM
        setTimeout(() => {
            const summaryElement = document.getElementById('sale-items-summary');
            if (summaryElement) {
                summaryElement.innerHTML = summaryItems.join('');
                console.log('Récapitulatif mis à jour');
            } else {
                console.error('Élément "sale-items-summary" toujours non trouvé après délai');
            }
            
            const totalElement = document.getElementById('sale-total-amount');
            if (totalElement) {
                totalElement.textContent = formattedTotal;
                console.log('Total mis à jour avec:', formattedTotal);
            } else {
                console.error('Élément "sale-total-amount" toujours non trouvé après délai');
            }
        }, 100); // Petit délai pour s'assurer que le DOM est mis à jour
    }
    
    // Afficher la modale puis mettre à jour son contenu
    if (typeof LeDiplomate.modals.show === 'function') {
        console.log('Affichage de la modale de finalisation de vente');
        
        // MÉTHODE 1: Essayer avec la méthode habituelle
        LeDiplomate.modals.show('tpl-modal-complete-sale');
        updateModalContent();
        
        // MÉTHODE ALTERNATIVE: Si la méthode ci-dessus ne fonctionne pas, 
        // il se peut que nous devions copier et modifier la logique de la modale
        /*
        // Récupérer le template de la modale
        const template = document.getElementById('tpl-modal-complete-sale');
        if (!template) {
            console.error('Template de modale non trouvé');
            return;
        }
        
        // Cloner le contenu du template
        const modalContent = document.importNode(template.content, true);
        
        // Mettre à jour le contenu de la modale directement
        const summaryElement = modalContent.querySelector('#sale-items-summary');
        if (summaryElement) {
            summaryElement.innerHTML = summaryItems.join('');
        }
        
        const totalElement = modalContent.querySelector('#sale-total-amount');
        if (totalElement) {
            totalElement.textContent = formattedTotal;
        }
        
        // Injecter dans la modale et l'afficher
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(modalContent);
        
        // Afficher la modale
        document.getElementById('modal-container').classList.remove('hidden');
        */
    } else {
        console.error('La fonction LeDiplomate.modals.show n\'est pas disponible');
    }
},
    
    /**
     * Finalise la vente
     */
    completeSale: function() {
        console.log('Tentative de finalisation de la vente');
        
        if (this.cart.length === 0) {
            LeDiplomate.notifications.show('Le panier est vide', 'warning');
            return;
        }
        
        // Vérifier la disponibilité des articles en stock
        for (const item of this.cart) {
            const stockItem = LeDiplomate.dataManager.stock.getByProductId(item.productId);
            if (!stockItem || stockItem.quantity < item.quantity) {
                const product = LeDiplomate.dataManager.products.getById(item.productId);
                const productName = product ? `${product.brand} ${product.name}` : 'Produit inconnu';
                
                LeDiplomate.notifications.show(`Stock insuffisant pour ${productName}`, 'error');
                return;
            }
        }
        
        // Récupérer les données du formulaire
        const paymentMethodSelect = document.getElementById('sale-payment-method');
        const notesElement = document.getElementById('sale-notes');
        
        if (!paymentMethodSelect || !notesElement) {
            console.error('Éléments du formulaire de finalisation non trouvés');
            return;
        }
        
        const paymentMethod = paymentMethodSelect.value;
        const notes = notesElement.value;
        
        // Calculer le total
        let total = 0;
        this.cart.forEach(item => {
            total += item.price * item.quantity;
        });
        
        // Créer la vente
        const sale = {
            date: new Date().toISOString(),
            items: this.cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            total: parseFloat(total.toFixed(2)), // Éviter les erreurs de précision
            paymentMethod: paymentMethod,
            notes: notes
        };
        
        // Enregistrer la vente
        try {
            console.log('Enregistrement de la vente:', sale);
            LeDiplomate.dataManager.sales.add(sale);
            
            // Vider le panier
            this.cart = [];
            this.updateCartDisplay();
            
            // Fermer la modale
            if (typeof LeDiplomate.modals.hide === 'function') {
                LeDiplomate.modals.hide();
            } else {
                console.error('La fonction LeDiplomate.modals.hide n\'est pas disponible');
            }
            
            // Notification
            LeDiplomate.notifications.show('Vente enregistrée avec succès', 'success');
            
            // Mettre à jour l'historique des ventes
            this.loadRecentSales();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de la vente:', error);
            LeDiplomate.notifications.show(`Erreur lors de l'enregistrement de la vente: ${error.message}`, 'error');
        }
    },
    
    /**
     * Edite une vente existante
     * @param {string} saleId - ID de la vente à éditer
     */
    editSale: function(saleId) {
        // Récupérer la vente
        const sale = LeDiplomate.dataManager.sales.getById(saleId);
        if (!sale) {
            LeDiplomate.notifications.show('Vente non trouvée', 'error');
            return;
        }
        
        // Vérifier si le panier est vide
        if (this.cart.length > 0) {
            if (!confirm('Cette action va remplacer votre panier actuel. Continuer?')) {
                return;
            }
        }
        
        // Supprimer la vente (cela va remettre les produits en stock)
        LeDiplomate.dataManager.sales.delete(saleId);
        
        // Réinitialiser le panier et remplir avec les articles de la vente
        this.cart = sale.items.map(item => ({
            productId: item.productId,
            price: item.price,
            quantity: item.quantity
        }));
        
        // Mettre à jour l'affichage du panier
        this.updateCartDisplay();
        
        // Notifier l'utilisateur
        LeDiplomate.notifications.show('Vente chargée pour modification', 'success');
    },
    
    /**
     * Supprime une vente et remet les produits en stock
     * @param {string} saleId - ID de la vente à supprimer
     */
    deleteSale: function(saleId) {
        // Récupérer la vente
        const sale = LeDiplomate.dataManager.sales.getById(saleId);
        if (!sale) {
            LeDiplomate.notifications.show('Vente non trouvée', 'error');
            return;
        }
        
        // Demander confirmation
        if (!confirm('Êtes-vous sûr de vouloir annuler cette vente et remettre les produits en stock?')) {
            return;
        }
        
        // Supprimer la vente
        LeDiplomate.dataManager.sales.delete(saleId);
        
        // Mettre à jour l'historique des ventes
        this.loadRecentSales();
        
        // Notifier l'utilisateur
        LeDiplomate.notifications.show('Vente annulée et produits remis en stock', 'success');
    },
    
    /**
     * Charge l'historique des ventes récentes
     */
    loadRecentSales: function() {
        const historyContainer = document.getElementById('sales-history-list');
        
        if (!historyContainer) {
            console.error('Conteneur d\'historique des ventes non trouvé');
            return;
        }
        
        try {
            // Récupérer les 10 dernières ventes
            const sales = LeDiplomate.dataManager.sales.getDetailedSales()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);
            
            if (sales.length === 0) {
                historyContainer.innerHTML = '<div class="sale-empty">Aucune vente enregistrée</div>';
                return;
            }
            
            // Afficher les ventes
            historyContainer.innerHTML = '';
            sales.forEach(sale => {
                const date = new Date(sale.date);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                
                const productNames = sale.items.map(item => {
                    if (item.product) {
                        return `${item.product.brand} ${item.product.name} (${item.quantity}x)`;
                    }
                    return `Produit inconnu (${item.quantity}x)`;
                }).join(', ');
                
                const saleItem = document.createElement('div');
                saleItem.className = 'sale-item';
                saleItem.dataset.saleId = sale.id;
                saleItem.innerHTML = `
                    <div class="sale-item-info">
                        <div><strong>${formattedDate}</strong></div>
                        <div>${productNames}</div>
                    </div>
                    <div class="sale-item-actions">
                        <button class="action-btn edit-sale-btn" title="Modifier">✎</button>
                        <button class="action-btn delete-sale-btn" title="Annuler">✕</button>
                        <div class="sale-item-total">
                            <strong>${LeDiplomate.formatPrice(sale.total)}€</strong>
                        </div>
                    </div>
                `;
                
                historyContainer.appendChild(saleItem);
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'historique des ventes:', error);
            historyContainer.innerHTML = '<div class="sale-empty">Erreur lors du chargement de l\'historique</div>';
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