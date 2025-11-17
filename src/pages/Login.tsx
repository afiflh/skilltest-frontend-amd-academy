import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { setToken, setUser, isAuthenticated } from "../utils/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ REQUIREMENT: Page harus tetap terproteksi ketika user refresh
  // Cek token dari localStorage saat component mount
  useEffect(() => {
    console.log("🔍 Checking authentication status...");
    
    const isAuth = isAuthenticated();
    console.log("✅ Is Authenticated:", isAuth);
    
    if (isAuth) {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log("🎫 Token found:", token ? token.substring(0, 50) + "..." : "null");
      console.log("👤 User data:", userData ? JSON.parse(userData) : "null");
      
      // Jika sudah ada token, redirect ke dashboard
      navigate("/dashboard", { replace: true });
    } else {
      console.log("❌ No token found - showing login page");
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("📝 Login attempt started");
    console.log("Username:", username);
    console.log("Password:", "***hidden***");

    // ✅ REQUIREMENT: Validasi sederhana (username/password wajib diisi)
    if (!username.trim()) {
      setError("Username wajib diisi");
      console.log("❌ Validation failed: Username empty");
      return;
    }

    if (!password.trim()) {
      setError("Password wajib diisi");
      console.log("❌ Validation failed: Password empty");
      return;
    }

    // Validasi tambahan: minimum length
    if (username.length < 3) {
      setError("Username minimal 3 karakter");
      console.log("❌ Validation failed: Username too short");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      console.log("❌ Validation failed: Password too short");
      return;
    }

    console.log("✅ Validation passed");
    setLoading(true);

    try {
      console.log("🌐 Sending POST request to DummyJSON API...");
      
      // ✅ REQUIREMENT: POST ke https://dummyjson.com/auth/login
      // Kirim username dan password
      const response = await login({ username, password });
      
      console.log("✅ API Response received:");
      console.log("📦 Full Response:", response);
      console.log("🎫 Token:", response.token);
      console.log("👤 User Info:", {
        id: response.id,
        username: response.username,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email
      });

      // ✅ REQUIREMENT: Simpan token ke localStorage
      console.log("💾 Saving token to localStorage...");
      setToken(response.token);
      
      console.log("💾 Saving user data to localStorage...");
      setUser(response);
      
      // Verify data tersimpan
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_data');
      
      console.log("✅ Token saved:", savedToken ? savedToken.substring(0, 50) + "..." : "FAILED");
      console.log("✅ User data saved:", savedUser ? JSON.parse(savedUser) : "FAILED");
      
      console.log("📊 localStorage contents:");
      console.log({
        auth_token: localStorage.getItem('auth_token'),
        user_data: localStorage.getItem('user_data')
      });

      // ✅ REQUIREMENT: Redirect ke Dashboard setelah login sukses
      console.log("🚀 Redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // Handle error dengan message yang jelas
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        setError(err.message);
      } else {
        console.error("Unknown error:", err);
        setError("Login gagal. Periksa username dan password Anda.");
      }
    } finally {
      setLoading(false);
      console.log("🏁 Login process finished");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border border-orange-300/40 bg-white">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-full shadow-lg shadow-orange-300/40">
              <Package className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-blue-900">
            Product Manager
          </CardTitle>
          <CardDescription className="text-base text-blue-800">
            Login untuk mengelola produk Anda
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-900">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="h-11 border-blue-300 focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-blue-700">Minimal 3 karakter</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-900">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 border-blue-300 focus:ring-2 focus:ring-orange-400 pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-blue-700 hover:text-orange-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-blue-700">Minimal 6 karakter</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md shadow-orange-400/40"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default Login;