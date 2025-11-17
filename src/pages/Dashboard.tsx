import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { getProducts } from "../services/api";
import type { Product } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, ArrowRight, Star } from "lucide-react";

const LOCAL_KEY = "local_products";

const Dashboard: React.FC = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await getProducts(100, 0);
      const apiProducts = response.products;
      const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      const all = [...local, ...apiProducts];

      setTotalProducts(all.length);
      const sorted = all.sort((a, b) => b.id - a.id).slice(0, 5);
      setLatestProducts(sorted);
    } catch (error) {
      console.error("Failed to load dashboard");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-8 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold tracking-wide">Dashboard</h1>
          <p className="text-lg opacity-90 mt-1">
            Selamat datang di sistem manajemen produk 💼
          </p>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow hover:shadow-lg transition border-blue-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-blue-700 font-semibold text-xl">
                Total Produk
              </CardTitle>
              <Package className="h-10 w-10 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold text-blue-600">
                {totalProducts}
              </p>
            </CardContent>
          </Card>

          {/* Produk Terbaru */}
          <Card className="shadow hover:shadow-lg transition border-orange-200">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-orange-600 font-semibold text-xl">
                Produk Terbaru
              </CardTitle>
              <Star className="h-10 w-10 text-blue-500" />
            </CardHeader>
            <CardContent>
              {latestProducts.length === 0 ? (
                <p className="text-gray-500">Belum ada produk</p>
              ) : (
                <ul className="space-y-3">
                  {latestProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex justify-between border-b pb-2 text-sm"
                    >
                      <span className="font-semibold text-gray-800">
                        {product.title}
                      </span>
                      <span className="text-blue-600 font-bold">
                        ${product.price}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* BUTTON KE PRODUK */}
        <div className="flex items-center justify-center">
          <Link to="/products">
            <Button className="bg-gray-500 hover:opacity-90 text-lg px-8 py-6 font-bold shadow-lg flex items-center gap-2">
              🔧 Kelola Manajemen Produk
              <ArrowRight />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
