import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Search,
  Loader2,
  Receipt,
  ChevronRight
} from 'lucide-react';
import {  useSearchParams } from 'react-router-dom';

// --- 1. TYPE DEFINITIONS ---

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
  variants: ProductVariant[];
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

interface CartItem {
  tempId: string;
  product: Product;
  selectedVariant: ProductVariant;
  selectedToppings: Topping[];
  quantity: number;
  totalPrice: number;
}

// Thêm Type cho Bàn
interface TableOrderInfo {
  orderId: number;
  orderCode: string;
  totalAmount: number;
}

interface Table {
  id: number;
  name: string;
  status: string;
  currentOrder: TableOrderInfo | null;
}

// --- 2. MAIN COMPONENT ---

const MenuPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const existingOrderId = searchParams.get('orderId');

  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [tables, setTables] = useState<Table[]>([]); // State lưu danh sách bàn
  const [loading, setLoading] = useState(true);

 
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [selectedTableId, setSelectedTableId] = useState<number | ''>(''); // State lưu bàn đang chọn
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Lỗi parse giỏ hàng:", e);
        return [];
      }
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- 3. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Thay đổi URL API cho phù hợp với backend của bạn
        const BASE_URL = 'https://localhost:7031/api';

        // Gọi thêm API lấy danh sách bàn
        const [catRes, prodRes, topRes, tableRes] = await Promise.all([
          axios.get(`${BASE_URL}/categories`),
          axios.get(`${BASE_URL}/products`),
          axios.get(`${BASE_URL}/toppings`),
          axios.get(`${BASE_URL}/Tables/GetAllTable`)
        ]);

        setCategories(catRes.data);
        setProducts(prodRes.data);
        setToppings(
          Array.isArray(topRes.data)
            ? topRes.data.filter((t: Topping) => t.isAvailable)
            : []
        );
        setTables(tableRes.data); // Lưu dữ liệu bàn

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // --- 4. HANDLERS ---

  const handleOpenProduct = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      alert("Món này tạm hết hoặc chưa cập nhật giá.");
      return;
    }
    setCurrentProduct(product);
    setQuantity(1);
    setSelectedToppings([]);
    setSelectedVariant(product.variants[0]);
    setIsModalOpen(true);
  };

  const addToCart = () => {
    if (!currentProduct || !selectedVariant) return;

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
  };

  const removeFromCart = (tempId: string) => {
    setCart(cart.filter(item => item.tempId !== tempId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      if (existingOrderId) {
        // LUỒNG 1: THÊM MÓN VÀO ĐƠN CŨ
        // Cấu trúc JSON khớp 100% với API Swagger bạn đưa
        const payload = {
          items: cart.map(item => ({
            productVariantId: item.selectedVariant.id,
            quantity: item.quantity,
            voiceNote: "", // Nếu sau này có input ghi chú thì gán vào đây, tạm thời để rỗng
            originalVoiceText: "",
            toppingIds: item.selectedToppings.map(t => t.id)
          }))
        };

        // Gọi đúng endpoint: /api/Orders/{id}/items
        await axios.post(`https://localhost:7031/api/Orders/${existingOrderId}/items`, payload);
        alert('Thêm món vào đơn thành công!');
        
        setCart([]);
        setIsCartOpen(false);
        // Quay lại đúng cái trang thanh toán của đơn đó
        navigate(`/payment/${existingOrderId}`); 

      } else {
        // LUỒNG 2: TẠO ĐƠN MỚI
        if (selectedTableId === '') {
          alert('Vui lòng chọn bàn trước khi xác nhận đặt đơn!');
          return;
        }

        const payload = {
          tableId: selectedTableId,
          staffId: null,
          items: cart.map(item => ({
            productVariantId: item.selectedVariant.id,
            quantity: item.quantity,
            toppingIds: item.selectedToppings.map(t => t.id)
          }))
        };

        const res = await axios.post('https://localhost:7031/api/Orders', payload);
        alert('Đặt món thành công!');
        
        setCart([]);
        setSelectedTableId(''); 
        setIsCartOpen(false);

        if (res.data?.orderId) {
          navigate(`/payment/${res.data.orderId}`);
        }
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert('Có lỗi xảy ra khi xử lý.');
    }
  };

  // --- 5. CALCULATIONS & HELPERS ---

  const getDisplayPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return "Liên hệ";
    const minPrice = Math.min(...product.variants.map(v => v.price));
    return minPrice.toLocaleString('vi-VN') + "đ";
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "https://via.placeholder.com/300";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `https://localhost:7031/images/${imageUrl}`;
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // --- 6. RENDER ---

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin h-10 w-10 text-orange-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans relative">

      {/* --- SIDEBAR / CATEGORIES --- */}
      <aside className="w-full md:w-64 bg-white shadow-lg sticky top-0 z-20 md:h-screen flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2 h-8 bg-red-700 rounded-full"></div>
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">THỰC ĐƠN</h1>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm món..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-red-700 rounded-xl text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories List */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategoryId('ALL')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center group ${selectedCategoryId === 'ALL'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-red-700'
              }`}
          >
            <span>Tất cả món</span>
            {selectedCategoryId === 'ALL' && <ChevronRight className="h-4 w-4" />}
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between items-center group ${selectedCategoryId === cat.id
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-red-700'
                }`}
            >
              <span>{cat.name}</span>
              {selectedCategoryId === cat.id && <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-32">
        {/* Mobile Header */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-xl font-bold text-gray-800">Danh sách món</h2>
          <div className="relative p-2 bg-white rounded-full shadow-sm">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{totalQuantity}</span>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const hasVariants = product.variants && product.variants.length > 0;
            return (
              <div
                key={product.id}
                onClick={() => hasVariants && handleOpenProduct(product)}
                className={`
                  bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden 
                  group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col 
                  ${!hasVariants ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
                `}
              >
                {/* Image */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                  {/* Overlay Button */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur text-red-700 px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Chọn món
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description || "Món ngon mỗi ngày"}</p>
                  <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className="text-lg font-extrabold text-red-700">{getDisplayPrice(product)}</span>
                    <div className="bg-red-50 p-1.5 rounded-lg text-red-700">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- FLOATING CART WIDGET --- */}
      {cart.length > 0 && (
        <div
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 cursor-pointer group animate-in slide-in-from-bottom-10 duration-500"
        >
          <div className="relative bg-[#3b000f] hover:bg-[#2a0009] transition-colors rounded-2xl shadow-2xl p-3 pl-4 pr-6 flex items-center gap-4 min-w-[240px] border border-red-900">
            <div className="bg-[#ce1212] p-3 rounded-xl shrink-0 text-white shadow-inner">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider">
                {totalQuantity} món tạm tính
              </span>
              <span className="text-xl font-bold text-[#fbbf24] font-mono tracking-tight leading-none mt-0.5">
                {cartTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {cart.length}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL --- */}
      {isModalOpen && currentProduct && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative h-48 shrink-0">
              <img src={getImageUrl(currentProduct.imageUrl)} className="w-full h-full object-cover" alt="" />
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition backdrop-blur-md">
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                <h2 className="text-2xl font-bold text-white shadow-sm">{currentProduct.name}</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Size Selector */}
              <div className="mb-6">
                <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Chọn kích cỡ</label>
                <div className="space-y-2">
                  {currentProduct.variants.map(v => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`cursor-pointer p-3 border rounded-xl flex justify-between items-center transition-all ${selectedVariant.id === v.id
                        ? 'border-red-700 bg-red-50 ring-1 ring-red-700'
                        : 'border-gray-200 hover:border-red-300'
                        }`}
                    >
                      <span className={`text-sm font-medium ${selectedVariant.id === v.id ? 'text-red-700' : 'text-gray-700'}`}>
                        {v.sizeName === 'Default' ? 'Tiêu chuẩn' : `Size ${v.sizeName}`}
                      </span>
                      <span className="text-sm font-bold">{v.price.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topping Selector */}
              {toppings.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wide">Thêm Topping</label>
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
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-red-700 bg-red-50' : 'border-gray-100 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-700 border-red-700' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm text-gray-700">{t.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-500">+{t.price.toLocaleString()}đ</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-white shadow-xl z-20">
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl px-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:text-red-700"><Minus className="h-5 w-5" /></button>
                  <span className="w-8 text-center font-bold text-gray-800 text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:text-red-700"><Plus className="h-5 w-5" /></button>
                </div>
                <button
                  onClick={addToCart}
                  className="flex-1 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-xl py-3 font-bold hover:shadow-lg transition flex justify-between px-6 items-center"
                >
                  <span>Thêm vào đơn</span>
                  <span>{((selectedVariant.price + selectedToppings.reduce((s, t) => s + t.price, 0)) * quantity).toLocaleString()}đ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CART DRAWER (SLIDE OVER) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />

          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Cart Header */}
            <div className="p-5 border-b flex justify-between items-center bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-red-700" />
                Giỏ hàng <span className="text-gray-400 font-normal text-base">({cart.length})</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                  <ShoppingCart className="h-16 w-16 text-gray-300" />
                  <p>Chưa có món nào được chọn</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-red-700 font-bold hover:underline">Quay lại chọn món</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.tempId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-3 relative group">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                      <img src={getImageUrl(item.product.imageUrl)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800 truncate pr-6">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.tempId)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.selectedVariant.sizeName !== 'Default' && `Size: ${item.selectedVariant.sizeName}`}
                          {item.selectedToppings.length > 0 && item.selectedVariant.sizeName !== 'Default' && ' • '}
                          {item.selectedToppings.map(t => t.name).join(', ')}
                        </p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <span className="font-bold text-red-700">{item.totalPrice.toLocaleString()}đ</span>
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-5 bg-white border-t shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] z-10">
              
              {/* Vùng Chọn Bàn (MỚI THÊM VÀO ĐÂY) */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chọn bàn <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-700 bg-gray-50 text-gray-700 cursor-pointer"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(Number(e.target.value))}
                >
                  <option value="" disabled>-- Vui lòng chọn bàn trống --</option>
                  {tables
                    .filter((table) => table.status === 'available')
                    .map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-4 border-t pt-4">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-3 border-t">
                  <span>Tổng tiền</span>
                  <span className="text-orange-600 font-extrabold">{cartTotal.toLocaleString()}đ</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-gradient-to-r from-red-700 to-red-900 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Xác nhận đặt đơn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuPage;