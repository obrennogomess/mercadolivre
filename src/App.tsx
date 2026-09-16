import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ProductGallery } from './components/ProductGallery';
import { ProductDetails } from './components/ProductDetails';
import { PurchaseCard } from './components/PurchaseCard';
import { Footer } from './components/Footer';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CepModal } from './components/CepModal';
import { ShareModal } from './components/ShareModal';
import { PaymentModal } from './components/PaymentModal';
import { MercadoLivreCheckout, CheckoutItem } from './components/MercadoLivreCheckout';
import { PRODUCT_DATA, ProductVariation, getKitDetails } from './data/productData';
import { CheckCircle, X, ShoppingBag } from 'lucide-react';
import { UserLocation, detectUserLocation } from './utils/location';

export default function App() {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(
    PRODUCT_DATA.variations[0]
  );
  const [selectedKitSize, setSelectedKitSize] = useState<string>(
    '1 unidade (400ml)'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [cep, setCep] = useState<string>('01001-000');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Auto-detect user region and corresponding postal code
  useEffect(() => {
    let isMounted = true;
    detectUserLocation().then((loc) => {
      if (isMounted && loc) {
        setUserLocation(loc);
        setCep(loc.cep);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Modals state
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [cepModalOpen, setCepModalOpen] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState<boolean>(false);
  const [mlCheckoutOpen, setMlCheckoutOpen] = useState<boolean>(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Cart state initialized with default product
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      variation: PRODUCT_DATA.variations[0],
      quantity: 1,
      kitSize: '1 unidade (400ml)',
    },
  ]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSelectKitSize = (kitLabel: string) => {
    setSelectedKitSize(kitLabel);
    if (kitLabel.includes('1 unidade') || kitLabel.includes('1 un')) {
      setQuantity(1);
    } else if (kitLabel.includes('2')) {
      setQuantity(2);
    } else if (kitLabel.includes('3')) {
      setQuantity(3);
    } else if (kitLabel.includes('6')) {
      setQuantity(6);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    setQuantity(newQty);
    // When changing quantity, synchronize with kit options if applicable
    if (newQty === 1) {
      setSelectedKitSize('1 unidade (400ml)');
    } else if (newQty === 2) {
      setSelectedKitSize('Kit 2 unidades');
    } else if (newQty === 3) {
      setSelectedKitSize('Kit 3 unidades (Mais vendido)');
    } else if (newQty === 6) {
      setSelectedKitSize('Kit 6 unidades (Econômico)');
    }
  };

  // Dynamic price calculation
  const currentKitInfo = getKitDetails(selectedKitSize);
  const isCurrentSingle = !selectedKitSize || selectedKitSize.includes('1 unidade');
  const currentTotalPrice = isCurrentSingle
    ? selectedVariation.price * quantity
    : (quantity === currentKitInfo.units || quantity === 1
        ? currentKitInfo.price
        : Number((currentKitInfo.price * (quantity > currentKitInfo.units ? Math.ceil(quantity / currentKitInfo.units) : quantity)).toFixed(2)));
  const currentOriginalTotalPrice = isCurrentSingle
    ? selectedVariation.originalPrice * quantity
    : (quantity === currentKitInfo.units || quantity === 1
        ? currentKitInfo.originalPrice
        : Number((currentKitInfo.originalPrice * (quantity > currentKitInfo.units ? Math.ceil(quantity / currentKitInfo.units) : quantity)).toFixed(2)));

  // Cart actions
  const handleAddToCart = () => {
    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) =>
          item.variation.id === selectedVariation.id && item.kitSize === selectedKitSize
      );

      if (existingIdx >= 0) {
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            variation: selectedVariation,
            quantity,
            kitSize: selectedKitSize,
          },
        ];
      }
    });

    setCartOpen(true);

    showToast(
      `Adicionado ao carrinho: ${quantity}x Spray Dryko (${selectedVariation.colorName})`
    );
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    const itemToRemove = cartItems[index];
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    if (itemToRemove) {
      showToast(`Item removido do carrinho`);
    }
  };

  const handleBuyNow = (customQty?: any, color?: string, kitSize?: string) => {
    const kitToUse = typeof kitSize === 'string' && kitSize ? kitSize : selectedKitSize;
    const buyQty = typeof customQty === 'number' && customQty > 0 ? customQty : quantity;
    const variationToUse = typeof color === 'string' && color
      ? PRODUCT_DATA.variations.find(
          (v) => v.colorName.toLowerCase() === color.toLowerCase()
        ) || selectedVariation
      : selectedVariation;

    setCheckoutItems([
      {
        variation: variationToUse,
        quantity: buyQty,
        kitSize: kitToUse,
      },
    ]);
    setMlCheckoutOpen(true);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(
      !isFavorite
        ? 'Produto adicionado aos seus favoritos!'
        : 'Produto removido dos favoritos'
    );
  };

  // Dynamic gallery images based on variation: primary product image + application image
  const galleryImages = [
    selectedVariation.image,
    '/dryko-aplicacao-telhado.webp',
  ];

  return (
    <div className="min-h-screen bg-[#ebebeb] text-gray-800 font-sans flex flex-col antialiased selection:bg-[#fff159] selection:text-black">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-sm"
        >
          <CheckCircle size={18} className="text-[#00a650] shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white p-0.5"
            aria-label="Fechar notificação"
          >
            <X size={16} />
          </button>
        </aside>
      )}

      {/* Header */}
      <Header
        cep={cep}
        userCity={userLocation?.city}
        onOpenCepModal={() => setCepModalOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Main Content Area */}
      <div className="w-full flex-1">
        {/* Breadcrumb Navigation Bar */}
        <Breadcrumbs
          onOpenShare={() => setShareModalOpen(true)}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Main Product Container */}
        <main className="max-w-[1200px] mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Product Gallery: Top Left on desktop/tablet, 1st on mobile */}
              <div className="order-1 md:col-span-7 lg:col-span-8">
                <ProductGallery
                  images={galleryImages}
                  video={PRODUCT_DATA.video}
                  productTitle={PRODUCT_DATA.title}
                  selectedColor={selectedVariation.colorName}
                />
              </div>

              {/* Purchase Card: Right Column on desktop/tablet, 2nd on mobile (immediately below gallery) */}
              <div className="order-2 md:order-2 md:col-span-5 lg:col-span-4 md:row-span-2">
                <PurchaseCard
                  variation={selectedVariation}
                  onSelectVariation={(v) => setSelectedVariation(v)}
                  selectedKitSize={selectedKitSize}
                  onSelectKitSize={handleSelectKitSize}
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  onAddToCart={handleAddToCart}
                  onBuyNow={() => handleBuyNow(quantity, selectedVariation.colorName, selectedKitSize)}
                  cep={cep}
                  userLocationLabel={
                    userLocation
                      ? `${userLocation.city} - ${userLocation.stateCode}`
                      : undefined
                  }
                  onOpenCepModal={() => setCepModalOpen(true)}
                  onOpenPaymentModal={() => setPaymentModalOpen(true)}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenShare={() => setShareModalOpen(true)}
                />
              </div>

              {/* Product In-Depth Details: Under Gallery on desktop/tablet, 3rd on mobile */}
              <div className="order-3 md:order-3 md:col-span-7 lg:col-span-8">
                <hr className="border-t border-gray-200 my-4 sm:my-6" />
                <ProductDetails
                  selectedVariation={selectedVariation}
                  onSelectVariation={(v) => setSelectedVariation(v)}
                  selectedKitSize={selectedKitSize}
                  onSelectKitSize={handleSelectKitSize}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Quick Buy Bar (Always accessible on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-neutral-200 px-4 py-2.5 shadow-lg flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-400 line-through leading-none">
            R$ {currentOriginalTotalPrice.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-base font-bold text-neutral-900 leading-tight">
            R$ {currentTotalPrice.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-[10px] text-[#00a650] font-medium leading-none">
            Frete grátis FULL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3 py-2 text-xs font-semibold rounded bg-[#d9e7fb] hover:bg-[#cbe0f8] text-[#3483fa] transition-colors whitespace-nowrap cursor-pointer"
          >
            Adicionar
          </button>
          <button
            id="mobile-buy-now-btn"
            type="button"
            onClick={() => handleBuyNow(quantity, selectedVariation.colorName, selectedKitSize)}
            className="px-4 py-2 text-xs font-semibold rounded bg-[#3483fa] hover:bg-[#2968c8] text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer text-center block"
          >
            Comprar agora
          </button>
        </div>
      </div>

      {/* Interactive Drawers and Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutItems(
            cartItems.map((item) => ({
              variation: item.variation,
              quantity: item.quantity,
              kitSize: item.kitSize,
            }))
          );
          setMlCheckoutOpen(true);
        }}
        cep={cep}
      />

      <CepModal
        currentCep={cep}
        currentLocation={userLocation}
        isOpen={cepModalOpen}
        onClose={() => setCepModalOpen(false)}
        onSaveCep={(newCep, newLocation) => {
          setCep(newCep);
          if (newLocation) {
            setUserLocation(newLocation);
            showToast(`Região atualizada: ${newLocation.city} - ${newLocation.stateCode} (CEP ${newCep})`);
          } else {
            showToast(`CEP atualizado: ${newCep}`);
          }
        }}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        productTitle={PRODUCT_DATA.title}
        productUrl={window.location.href}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        price={selectedVariation.price * quantity}
      />

      {/* Instant Checkout Confirmation Modal */}
      {checkoutSuccessOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-gray-800 animate-in fade-in zoom-in-95 duration-150 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#00a650]/10 text-[#00a650] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} />
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              Pedido confirmado!
            </h3>

            <p className="text-sm text-center text-gray-600 mb-5">
              Sua compra de{' '}
              <strong className="text-gray-800">
                {quantity}x Spray Dryko Impermeabilizante ({selectedVariation.colorName})
              </strong>{' '}
              foi realizada com sucesso via envio <strong>FULL</strong>.
            </p>

            <div className="bg-gray-50 rounded-md border border-gray-200 p-3.5 mb-5 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Previsão de entrega:</span>
                <span className="font-semibold text-[#00a650]">Amanhã</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Destino:</span>
                <span className="font-semibold text-gray-800">
                  {userLocation ? `${userLocation.city} - ${userLocation.stateCode} (${cep})` : `CEP ${cep}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Forma de envio:</span>
                <span className="font-semibold text-gray-800">Mercado Envios Full (Grátis)</span>
              </div>
              <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 font-medium">
                <span className="text-gray-900">Total pago:</span>
                <span className="text-base font-bold text-gray-900">
                  R$ {(selectedVariation.price * quantity).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCheckoutSuccessOpen(false)}
              className="w-full py-2.5 bg-[#3483fa] hover:bg-[#2968c8] text-white font-semibold rounded text-sm transition-colors cursor-pointer"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      )}

      {/* Mercado Livre Official Native Checkout (Integrated with SigiloPay) */}
      <MercadoLivreCheckout
        isOpen={mlCheckoutOpen}
        onClose={() => setMlCheckoutOpen(false)}
        items={
          checkoutItems.length > 0
            ? checkoutItems
            : [
                {
                  variation: selectedVariation,
                  quantity,
                  kitSize: selectedKitSize,
                },
              ]
        }
        defaultCep={cep}
        onOrderCompleted={(orderId) => {
          showToast(`Pedido #${orderId} aprovado com sucesso via Pix!`);
        }}
      />
    </div>
  );
}
