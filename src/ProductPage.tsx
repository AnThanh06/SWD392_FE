import { useEffect, useState } from "react";
import axios from "axios";

// --- TYPES ---
type Variant = {
  id?: number;
  sizeName: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  variants: Variant[];
};

type Category = {
  id: number;
  name: string;
};

type Topping = {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
};

export default function ProductPage() {
  // --- STATES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Product Form States
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [variants, setVariants] = useState<Variant[]>([]);

  // Topping Form States
  const [editingToppingId, setEditingToppingId] = useState<number | null>(null);
  const [toppingName, setToppingName] = useState("");
  const [toppingPrice, setToppingPrice] = useState<number | "">("");
  const [toppingIsAvailable, setToppingIsAvailable] = useState(true);

  // --- FETCH DATA ---
  const fetchProducts = async () => {
    try {
      const res = await axios.get("https://localhost:7031/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Lỗi tải products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("https://localhost:7031/api/categories");
      setCategories(res.data);
      if (res.data.length > 0 && categoryId === "") {
        setCategoryId(res.data[0].id);
      }
    } catch (error) {
      console.error("Lỗi tải categories:", error);
    }
  };

  const fetchToppings = async () => {
    try {
      const res = await axios.get("https://localhost:7031/api/toppings");
      setToppings(res.data);
    } catch (error) {
      console.error("Lỗi tải toppings:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchCategories(), fetchToppings()]);
    };
    loadData();
  }, []);

  // --- PRODUCT LOGIC ---
  const resetProductForm = () => {
    setEditingProductId(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setVariants([]);
    setIsModalOpen(false);
  };

  const addVariant = () => setVariants([...variants, { sizeName: "", price: 0 }]);
  const removeVariant = (indexToRemove: number) => setVariants(variants.filter((_, index) => index !== indexToRemove));
  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Hàm này xử lý cả Tạo mới (POST) và Cập nhật (PUT)
  const saveProduct = async () => {
    if (!name.trim() || categoryId === "") return alert("Vui lòng nhập tên và chọn danh mục!");

    const formattedVariants = variants.map((v) => ({
      id: v.id || 0, // Giữ lại id của variant nếu có để update cho đúng
      sizeName: v.sizeName,
      price: Number(v.price)
    }));

    const payload = {
      id: editingProductId || 0, // Gửi id nếu đang update
      name: name,
      description: description,
      imageUrl: imageUrl || "",
      isActive: true,
      categoryId: Number(categoryId),
      variants: formattedVariants,
    };

    try {
      if (editingProductId) {
        // GỌI API PUT ĐỂ UPDATE
        await axios.put(`https://localhost:7031/api/products/${editingProductId}`, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        // GỌI API POST ĐỂ TẠO MỚI
        await axios.post("https://localhost:7031/api/products", payload);
        alert("Tạo sản phẩm thành công!");
      }

      resetProductForm();
      fetchProducts();
    } catch (error) {
      console.error("Lỗi lưu product:", error);
      alert("Đã xảy ra lỗi khi lưu sản phẩm, vui lòng kiểm tra console!");
    }
  };

  // Hàm mở modal và đổ dữ liệu vào form để sửa
  const editProduct = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setImageUrl(p.imageUrl || "");
    setCategoryId(p.categoryId);
    // Copy mảng variants để tránh tham chiếu trực tiếp
    setVariants(p.variants.map(v => ({ ...v }))); 
    setIsModalOpen(true);
  };

  // Hàm xóa sản phẩm
  const deleteProduct = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Sản phẩm này? Hành động này không thể hoàn tác!")) return;
    try {
      await axios.delete(`https://localhost:7031/api/products/${id}`);
      fetchProducts();
      alert("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Lỗi xóa product:", error);
      alert("Lỗi khi xóa sản phẩm!");
    }
  };

  // --- TOPPING LOGIC ---
  const resetToppingForm = () => {
    setEditingToppingId(null);
    setToppingName("");
    setToppingPrice("");
    setToppingIsAvailable(true);
  };

  const saveTopping = async () => {
    if (!toppingName.trim() || toppingPrice === "") return alert("Vui lòng nhập tên và giá topping!");
    const payload = {
      name: toppingName,
      price: Number(toppingPrice),
      isAvailable: toppingIsAvailable,
    };

    try {
      if (editingToppingId) {
        await axios.put(`https://localhost:7031/api/toppings/${editingToppingId}`, { id: editingToppingId, ...payload });
      } else {
        await axios.post("https://localhost:7031/api/toppings", payload);
      }
      resetToppingForm();
      fetchToppings();
    } catch (error) {
      console.error("Lỗi lưu topping:", error);
    }
  };

  const editTopping = (t: Topping) => {
    setEditingToppingId(t.id);
    setToppingName(t.name);
    setToppingPrice(t.price);
    setToppingIsAvailable(t.isAvailable ?? true);
  };

  const deleteTopping = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Topping này?")) return;
    try {
      await axios.delete(`https://localhost:7031/api/toppings/${id}`);
      fetchToppings();
    } catch (error) {
      console.error("Lỗi xóa topping:", error);
    }
  };

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto p-6 font-sans text-gray-800 relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <button 
          onClick={() => { resetProductForm(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
        >
          + Create Product
        </button>
      </div>

      <div className="space-y-8">
        {/* === KHỐI 1: TOPPINGS MANAGEMENT === */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Toppings Management</h2>
          
          <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Tên Topping</label>
              <input 
                value={toppingName} onChange={(e) => setToppingName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500" placeholder="Trân châu trắng..."
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Giá (đ)</label>
              <input 
                type="number" value={toppingPrice} onChange={(e) => setToppingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500" placeholder="5000"
              />
            </div>
            <div className="w-24 flex items-center mb-2">
              <input 
                type="checkbox" id="isAvailable" checked={toppingIsAvailable} onChange={(e) => setToppingIsAvailable(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isAvailable" className="text-sm text-gray-700 cursor-pointer">Còn hàng</label>
            </div>
            <div className="flex gap-2">
              <button onClick={saveTopping} className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900">
                {editingToppingId ? "Update" : "Add"}
              </button>
              {editingToppingId && (
                <button onClick={resetToppingForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300">
                  Hủy
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {toppings.map((t) => (
              <div key={t.id} className={`flex items-center gap-2 border px-3 py-2 rounded-lg ${t.isAvailable ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-60'}`}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">{t.name}</span>
                  <span className="text-xs text-gray-500">{t.price.toLocaleString()}đ {t.isAvailable ? '' : '(Hết)'}</span>
                </div>
                <div className="ml-2 flex gap-1 border-l pl-2">
                  <button onClick={() => editTopping(t)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Sửa</button>
                  <button onClick={() => deleteTopping(t.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Xóa</button>
                </div>
              </div>
            ))}
            {toppings.length === 0 && <p className="text-sm text-gray-500 italic">Chưa có topping nào.</p>}
          </div>
        </div>

        {/* === KHỐI 2: PRODUCT LIST (TABLE) === */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Product List</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-medium">Hình ảnh</th>
                  <th className="px-6 py-4 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 font-medium">Danh mục</th>
                  <th className="px-6 py-4 font-medium">Biến thể</th>
                  <th className="px-6 py-4 font-medium text-center">Thao tác</th> {/* Cột mới */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400 text-xs">No Image</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2 max-w-xs">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                        {p.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="flex flex-wrap gap-2">
                        {p.variants.map((v) => (
                          <span key={v.id} className="text-xs bg-gray-100 border border-gray-200 px-2 py-1 rounded text-gray-700">
                            <strong className="text-gray-900">{v.sizeName}</strong>: {v.price.toLocaleString()}đ
                          </span>
                        ))}
                        {p.variants.length === 0 && <span className="text-xs text-gray-400">Không có</span>}
                      </div>
                    </td>
                    {/* Cột Thao tác */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => editProduct(p)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chưa có sản phẩm nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === MODAL PRODUCT === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProductId ? "Update Product" : "Create New Product"}
              </h2>
              <button onClick={resetProductForm} className="text-gray-500 hover:text-red-500 font-bold text-xl">
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  placeholder="Ví dụ: Trà sữa trân châu" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Mô tả sản phẩm..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  placeholder="https://link-anh-cua-ban.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-200" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-semibold text-gray-800">Variants</h3>
                  <button onClick={addVariant} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                    + Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        placeholder="Size" value={v.sizeName} onChange={(e) => updateVariant(i, "sizeName", e.target.value)}
                        className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="number" placeholder="Price" value={v.price === 0 ? "" : v.price} onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                        className="w-24 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button onClick={() => removeVariant(i)} className="text-red-500 hover:bg-red-50 p-1 rounded">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={resetProductForm}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveProduct} 
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProductId ? "Update Product" : "Create Product"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}