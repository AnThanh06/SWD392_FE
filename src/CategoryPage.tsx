import axios from "axios";
import { useEffect, useState } from "react";

type Category = {
    id: number;
    name: string;
};

export default function CategoryPage() {
    // --- STATES ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null); // State mới để theo dõi ID đang sửa

    // --- FETCH DATA ---
    const fetchCategories = async () => {
        try {
            const res = await axios.get("https://localhost:7031/api/categories");
            setCategories(res.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách category:", error);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchCategories();
        };

        load();
    }, []);
    // --- LOGIC ---
    const resetForm = () => {
        setName("");
        setEditingCategoryId(null);
    };

    const saveCategory = async () => {
        if (!name.trim()) return alert("Vui lòng nhập tên category!");

        try {
            if (editingCategoryId) {
                // Đang có ID => GỌI API PUT ĐỂ UPDATE
                await axios.put(`https://localhost:7031/api/categories/${editingCategoryId}`, {
                    id: editingCategoryId,
                    name: name,
                });
                alert("Cập nhật thành công!");
            } else {
                // Không có ID => GỌI API POST ĐỂ TẠO MỚI
                await axios.post("https://localhost:7031/api/categories", {
                    name: name,
                });
                alert("Tạo mới thành công!");
            }

            resetForm();
            fetchCategories();
        } catch (error) {
            console.error("Lỗi khi lưu category:", error);
            alert("Có lỗi xảy ra khi lưu!");
        }
    };

    const editCategory = (category: Category) => {
        setName(category.name);
        setEditingCategoryId(category.id);
    };

    const deleteCategory = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa Category này không?")) return;

        try {
            await axios.delete(`https://localhost:7031/api/categories/${id}`);
            alert("Xóa thành công!");
            fetchCategories();
        } catch (error) {
            console.error("Lỗi khi xóa category:", error);
            alert("Lỗi khi xóa! Có thể Category này đang chứa sản phẩm nên không thể xóa.");
        }
    };

    // --- RENDER ---
    return (
        <div className="max-w-4xl mx-auto p-6 font-sans text-gray-800">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Categories Management</h1>

            {/* Khu vực Form */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên category..."
                    className="flex-1 min-w-[200px] max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                />
                <button
                    onClick={saveCategory}
                    className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                    {editingCategoryId ? "Update" : "Create"}
                </button>

                {/* Hiện nút Cancel nếu đang ở chế độ sửa */}
                {editingCategoryId && (
                    <button
                        onClick={resetForm}
                        className="px-5 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors focus:outline-none"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Khu vực hiển thị bảng */}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.length > 0 ? (
                            categories.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{c.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <button 
                                            onClick={() => editCategory(c)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            Sửa
                                        </button>
                                        <button 
                                            onClick={() => deleteCategory(c.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-8 text-center text-sm text-gray-500"
                                >
                                    Chưa có category nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}