import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Search, Loader2, AlertCircle } from 'lucide-react';

// --- 1. TYPE DEFINITIONS (Mapping theo JSON thực tế) ---

interface ProductVariant {
  id: number;
  sizeName: string; // VD: "Default", "M", "L"
  price: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  variants: ProductVariant[]; // API trả về variants nằm trong product
}

interface Category {
  id: number;
  name: string;
}

interface Topping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

// Item trong giỏ hàng (Frontend Only)
interface CartItem {
  tempId: string; // ID tạm để phân biệt trong giỏ
  product: Product;
  selectedVariant: ProductVariant;
  selectedToppings: Topping[];
  quantity: number;
  totalPrice: number; // (Giá variant + Giá topping) * quantity
}

// --- 2. MAIN COMPONENT ---

const MenuPage = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & UI State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Detail State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- 3. FETCH DATA ---
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [catRes, prodRes, topRes] = await Promise.all([
        axios.get('https://localhost:7031/api/categories'),
        axios.get('https://localhost:7031/api/products'),
        axios.get('https://localhost:7031/api/toppings')
      ]);

      setCategories(catRes.data);
      setProducts(prodRes.data);
      setToppings(
        Array.isArray(topRes.data)
          ? topRes.data.filter((t: Topping) => t.isAvailable)
          : []
      );

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleOpenProduct = (product: Product) => {
    // Nếu sản phẩm KHÔNG có variant (như Gà rán case), không cho mở hoặc báo lỗi
    if (!product.variants || product.variants.length === 0) {
      alert("Món này đang tạm hết hoặc chưa cập nhật giá (Missing Variants).");
      return;
    }

    setCurrentProduct(product);
    setQuantity(1);
    setSelectedToppings([]);
    
    // Mặc định chọn variant đầu tiên (thường là Default hoặc size nhỏ nhất)
    setSelectedVariant(product.variants[0]);
    setIsModalOpen(true);
  };

  const addToCart = () => {
    if (!currentProduct || !selectedVariant) return;

    // Tính giá đơn vị (1 món + topping)
    const unitPrice = selectedVariant.price + selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const finalPrice = unitPrice * quantity;

    const newItem: CartItem = {
      tempId: `${currentProduct.id}-${selectedVariant.id}-${Date.now()}`,
      product: currentProduct,
      selectedVariant: selectedVariant,
      selectedToppings: selectedToppings,
      quantity: quantity,
      totalPrice: finalPrice
    };

    setCart([...cart, newItem]);
    setIsModalOpen(false);
    setIsCartOpen(true);
  };

  const removeFromCart = (tempId: string) => {
    setCart(cart.filter(item => item.tempId !== tempId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const payload = {
      tableId: 1, // Đảm bảo bàn ID=1 có trong database
      staffId: null, // Thử để null nếu không bắt buộc, hoặc đổi thành ID nhân viên có thật
      customerId: null, // Tương tự staffId
      items: cart.map(item => ({
        productVariantId: item.selectedVariant.id,
        quantity: item.quantity,
        voiceNote: "",
        originalVoiceText: "",
        toppingIds: item.selectedToppings.map(t => t.id)
      }))
    };

    try {
      // SỬA 1: Thêm domain đầy đủ https://localhost:7031
      const res = await axios.post('https://localhost:7031/api/Orders', payload);
      
      const newOrderId = res.data?.orderId;

      alert('Đặt món thành công! Bếp đang chuẩn bị.');
      setCart([]);
      setIsCartOpen(false);

      if (newOrderId) {
        navigate(`/payment/${newOrderId}`);
      } else {
        console.warn('Backend không trả về orderId:', res.data);
        // Vẫn điều hướng về trang chủ hoặc thông báo thêm
      }

    } catch (error: any) {
      // SỬA 2: Log chi tiết lỗi ra console để debug
      console.error("CHI TIẾT LỖI:", error);
      
      if (error.response) {
        // Server đã trả về response nhưng là lỗi (4xx, 5xx)
        console.error("Data lỗi từ server:", error.response.data);
        console.error("Status code:", error.response.status);
        alert(`Đặt món thất bại: ${JSON.stringify(error.response.data)}`); 
      } else if (error.request) {
        // Không nhận được phản hồi (Lỗi mạng, sai port, CORS)
        console.error("Không có phản hồi từ server (Kiểm tra lại Port/Server chạy chưa)", error.request);
        alert('Không thể kết nối đến Server. Vui lòng kiểm tra lại đường truyền.');
      } else {
        alert('Lỗi thiết lập đơn hàng: ' + error.message);
      }
    }
  };

  // --- 5. RENDER HELPERS ---

  // Helper hiển thị giá ngoài danh sách
  const getDisplayPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return "Liên hệ";
    // Lấy giá thấp nhất để hiển thị "Từ..."
    const minPrice = Math.min(...product.variants.map(v => v.price));
    return minPrice.toLocaleString('vi-VN') + " đ";
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin h-10 w-10 text-orange-600"/></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR / CATEGORIES */}
      <aside className="w-full md:w-64 bg-white shadow-lg sticky top-0 z-20 md:h-screen flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Thực đơn </h1>
        </div>
        
        {/* Search Bar Mobile/Desktop */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm món ngon..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-orange-500 rounded-xl text-sm transition-all focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategoryId === 'ALL' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
            }`}
          >
            Tất cả món
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                selectedCategoryId === cat.id 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header Mobile Cart Trigger */}
        <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold text-gray-800">Thực đơn</h2>
            <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-white text-orange-600 rounded-full shadow-md border border-gray-100"
            >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
            </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const hasVariants = product.variants && product.variants.length > 0;
            return (
              <div 
                key={product.id} 
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col ${!hasVariants ? 'opacity-70 grayscale' : 'cursor-pointer'}`}
                onClick={() => hasVariants && handleOpenProduct(product)}
              >
                {/* Image Area */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                   {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-xs">Chưa có ảnh</span>
                     </div>
                   )}
                   
                   {/* Add Button Overlay */}
                   {hasVariants && (
                     <div className="absolute bottom-3 right-3 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="bg-white p-2 rounded-full shadow-md text-orange-500 hover:bg-orange-500 hover:text-white">
                          <Plus className="h-5 w-5" />
                        </div>
                     </div>
                   )}
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{product.categoryName}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description || "Món ăn hấp dẫn đang chờ bạn thưởng thức."}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-gray-900">
                        {getDisplayPrice(product)}
                      </span>
                      {!hasVariants && <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Hết hàng</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- MODAL CHI TIẾT MÓN --- */}
      {isModalOpen && currentProduct && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
            
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="relative h-56 bg-gray-200 shrink-0">
                    <img src={currentProduct.imageUrl || "https://via.placeholder.com/500?text=Food"} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 transition shadow-sm"><X className="h-5 w-5" /></button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
                        <h2 className="text-2xl font-bold text-white">{currentProduct.name}</h2>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* Size / Variants Selection */}
                    <div className="mb-6">
                        <label className="text-sm font-bold text-gray-700 mb-3 block">Chọn kích thước</label>
                        <div className="grid grid-cols-2 gap-3">
                            {currentProduct.variants.map(v => (
                                <div 
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`cursor-pointer p-3 border rounded-xl flex justify-between items-center transition-all ${selectedVariant.id === v.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}
                                >
                                    <span className={`text-sm font-medium ${selectedVariant.id === v.id ? 'text-orange-700' : 'text-gray-700'}`}>
                                        {v.sizeName === 'Default' ? 'Tiêu chuẩn' : `Size ${v.sizeName}`}
                                    </span>
                                    <span className="text-sm font-semibold">{v.price.toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Toppings Selection */}
                    {toppings.length > 0 && (
                        <div className="mb-6">
                             <label className="text-sm font-bold text-gray-700 mb-3 block">Thêm Topping</label>
                             <div className="space-y-2">
                                {toppings.map(t => {
                                    const isSelected = selectedToppings.some(item => item.id === t.id);
                                    return (
                                        <div 
                                            key={t.id}
                                            onClick={() => {
                                                if (isSelected) setSelectedToppings(prev => prev.filter(i => i.id !== t.id));
                                                else setSelectedToppings(prev => [...prev, t]);
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className="text-sm text-gray-700">{t.name}</span>
                                            </div>
                                            <span className="text-sm text-gray-500">+{t.price.toLocaleString()}đ</span>
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-4">
                        <div className="flex items-center border border-gray-300 rounded-xl px-2">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-500 hover:text-orange-600"><Minus className="h-5 w-5" /></button>
                            <span className="w-8 text-center font-bold text-gray-700">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-500 hover:text-orange-600"><Plus className="h-5 w-5" /></button>
                        </div>
                        <button 
                            onClick={addToCart}
                            className="flex-1 bg-orange-600 text-white rounded-xl py-3 font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex justify-between px-6 items-center"
                        >
                            <span>Thêm vào giỏ</span>
                            <span>{((selectedVariant.price + selectedToppings.reduce((s,t) => s+t.price, 0)) * quantity).toLocaleString()}đ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- CART SLIDE-OVER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            
            <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-orange-600" /> 
                        Giỏ hàng <span className="text-gray-400 font-normal text-base">({cart.length} món)</span>
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X className="h-6 w-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                <ShoppingCart className="h-10 w-10 text-gray-400" />
                            </div>
                            <p>Chưa có món nào được chọn</p>
                            <button onClick={() => setIsCartOpen(false)} className="text-orange-600 font-medium hover:underline">Quay lại thực đơn</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.tempId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                     <img src={item.product.imageUrl || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 truncate pr-2">{item.product.name}</h4>
                                        <button onClick={() => removeFromCart(item.tempId)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Size: <span className="font-medium text-gray-700">{item.selectedVariant.sizeName === 'Default' ? 'Tiêu chuẩn' : item.selectedVariant.sizeName}</span>
                                    </p>
                                    {item.selectedToppings.length > 0 && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            Topping: {item.selectedToppings.map(t => t.name).join(', ')}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-end mt-3">
                                        <span className="font-bold text-orange-600">{item.totalPrice.toLocaleString()}đ</span>
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">x{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-600">
                            <span>Tạm tính</span>
                            <span>{cartTotal.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                            <span>Tổng thanh toán</span>
                            <span className="text-orange-600">{cartTotal.toLocaleString()}đ</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-orange-200"
                    >
                        Đặt đơn ngay
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;