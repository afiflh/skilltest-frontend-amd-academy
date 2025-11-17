import { useState, useEffect, FormEvent } from "react";
import Layout from "../components/layout/Layout";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../services/api";
import type { Product, CreateProductRequest } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

const LOCAL_KEY = "local_products";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formError, setFormError] = useState("");

  // Load custom images
  const [customImages, setCustomImages] = useState<{ [key: number]: string }>(
    () => {
      const saved = localStorage.getItem("customImages");
      return saved ? JSON.parse(saved) : {};
    }
  );

  useEffect(() => {
    localStorage.setItem("customImages", JSON.stringify(customImages));
  }, [customImages]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  const [formData, setFormData] = useState<CreateProductRequest>({
    title: "",
    description: "",
    price: 0,
    brand: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const skip = (currentPage - 1) * productsPerPage;
      const response = await getProducts(productsPerPage, skip);

      const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

      const allProducts = [...local, ...response.products];

      setProducts(allProducts);
      setTotalProducts(response.total + local.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return fetchProducts();

    try {
      setLoading(true);
      const response = await searchProducts(searchQuery);
      const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

      const filteredLocal = local.filter((p: Product) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setProducts([...filteredLocal, ...response.products]);
      setTotalProducts(response.total + filteredLocal.length);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const saveToLocal = (data: Product[]) =>
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validasi wajib hanya untuk 3 field
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price
    ) {
      setFormError("Nama Produk, Deskripsi, dan Harga wajib diisi");
      return;
    }

    if (formData.price <= 0) {
      setFormError("Harga harus lebih besar dari 0");
      return;
    }

    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

      if (editingProduct) {
        await updateProduct({ ...formData, id: editingProduct.id });
        const updatedProduct = { ...editingProduct, ...formData };

        const updatedLocal = local.map((p: Product) =>
          p.id === editingProduct.id ? updatedProduct : p
        );
        saveToLocal(updatedLocal);

        if (imagePreview) {
          setCustomImages((prev) => ({
            ...prev,
            [editingProduct.id]: imagePreview,
          }));
        }
      } else {
        const created = await createProduct(formData);
        const localProduct = { ...created, id: Date.now() };
        const newLocal = [localProduct, ...local];
        saveToLocal(newLocal);

        if (imagePreview) {
          setCustomImages((prev) => ({
            ...prev,
            [localProduct.id]: imagePreview,
          }));
        }
      }

      alert("Produk tersimpan!");
      closeModal();
      fetchProducts();
    } catch {
      setFormError("Gagal menyimpan produk");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus produk "${title}"?`)) return;

    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    const isLocalProduct = local.some((p: Product) => p.id === id);

    try {
      // Hapus hanya dari lokal jika produk lokal
      if (isLocalProduct) {
        const updatedLocal = local.filter((p: Product) => p.id !== id);
        saveToLocal(updatedLocal);
        setProducts(products.filter((p) => p.id !== id));
        alert("Berhasil dihapus!");
        return;
      }

      // Kalau bukan produk lokal → hapus API
      await deleteProduct(id);

      const updatedLocal = local.filter((p: Product) => p.id !== id);
      saveToLocal(updatedLocal);

      setProducts(products.filter((p) => p.id !== id));
      alert("Berhasil dihapus!");
    } catch {
      alert("Gagal hapus");
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      description: "",
      price: 0,
      brand: "",
      category: "",
    });
    setImagePreview("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setImagePreview("");
    setFormError("");
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        {/* HEADER */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-3xl">Product Management</CardTitle>
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </CardHeader>
        </Card>

        {/* SEARCH */}
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products..."
          />
          <Button onClick={handleSearch} className="border">Search</Button>
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw />
          </Button>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto mb-4" />
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={
                        customImages[product.id] ||
                        product.thumbnail ||
                        "https://via.placeholder.com/300x200"
                      }
                      className="w-full h-full object-cover"
                    />
                    {customImages[product.id] && (
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        <ImageIcon className="h-3 w-3 mr-1" /> Custom
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{product.description}</p>
                    <Separator className="my-3" />
                    <span className="text-xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      onClick={() => {
                        setEditingProduct(product);
                        setFormData({
                          title: product.title,
                          description: product.description,
                          price: product.price,
                          stock: (product as any).stock ?? 0,
                          brand: (product as any).brand ?? "",
                          category: (product as any).category ?? "",
                        });
                        setImagePreview(customImages[product.id] || "");
                        setShowModal(true);
                      }}
                      className="flex-1 gap-2 bg-gray-300"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(product.id, product.title)}
                      className="flex-1 gap-2 text-black bg-red-300"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-between p-4">
                <p>
                  Page {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <ChevronLeft /> Prev
                  </Button>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next <ChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* MODAL */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-white shadow max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
              <DialogDescription>Isi form di bawah ini</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Label>Nama Produk *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />

              <Label>Deskripsi *</Label>
              <textarea
                className="border rounded-md p-2 w-full"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />

              <Label>Harga *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                required
              />

              {/* STOK */}
              <Label>Stok *</Label>
              <Input
                type="number"
                value={formData.stock ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
              />

              {/* BRAND */}
              <Label>Brand *</Label>
              <Input
                value={formData.brand ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />

              {/* KATEGORI */}
              <Label>Kategori *</Label>
              <Input
                value={formData.category ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />

              <div>
                <Label>Foto (Opsional)</Label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Products;
