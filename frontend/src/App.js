import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Forgot from "./pages/auth/Forgot";
import Reset from "./pages/auth/Reset";
import Dashboard from "./pages/dashboard/Dashboard";
import Sidebar from "./components/sidebar/Sidebar";
import Layout from "./components/layout/Layout";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { getLoginStatus, getUser } from "./services/authService";
import { SET_LOGIN, SET_USER } from "./redux/features/auth/authSlice";
import AddProduct from "./pages/addProduct/AddProduct";
import ProductDetail from "./components/product/productDetail/ProductDetail";
import EditProduct from "./pages/editProduct/EditProduct";
import Profile from "./pages/profile/Profile";
import EditProfile from "./pages/profile/EditProfile";
import Contact from "./pages/contact/Contact";
import TransactionPage from "./pages/transaction/TransactionPage";
import AddTransactionPage from "./pages/transaction/AddTransactionPage";
import TransactionDetailPage from "./pages/transaction/TransactionDetailPage";
import UserList from "./pages/admin/UserList";
import UserForm from "./pages/admin/UserForm";
import CategoryList from "./pages/admin/CategoryList";
import CategoryForm from "./pages/admin/CategoryForm";

axios.defaults.withCredentials = true;

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loginStatus() {
      try {
        setIsLoading(true);
        const status = await getLoginStatus();
        dispatch(SET_LOGIN(status));

        if (status) {
          // Fetch user data if logged in
          const userData = await getUser();
          if (userData) {
            dispatch(SET_USER(userData));
          }
        } else {
          // If not logged in, set user to an empty object to avoid undefined errors
          dispatch(
            SET_USER({
              name: "",
              email: "",
              phone: "",
              bio: "",
              photo: "",
              role: "",
              categories: [],
            })
          );
        }
      } catch (error) {
        console.log("Login status error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loginStatus();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-position Toastify"
        toastClassName="Toastify__toast"
        containerClassName="Toastify__toast-container"
      />
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/forgot"
          element={<Forgot />}
        />
        <Route
          path="/resetpassword/:resetToken"
          element={<Reset />}
        />

        <Route
          path="/dashboard"
          element={
            <Sidebar>
              <Layout>
                <Dashboard />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/add-product"
          element={
            <Sidebar>
              <Layout>
                <AddProduct />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/product-detail/:id"
          element={
            <Sidebar>
              <Layout>
                <ProductDetail />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <Sidebar>
              <Layout>
                <EditProduct />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/profile"
          element={
            <Sidebar>
              <Layout>
                <Profile />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <Sidebar>
              <Layout>
                <EditProfile />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/contact-us"
          element={
            <Sidebar>
              <Layout>
                <Contact />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/transactions"
          element={
            <Sidebar>
              <Layout>
                <TransactionPage />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <Sidebar>
              <Layout>
                <AddTransactionPage />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/transaction-detail/:id"
          element={
            <Sidebar>
              <Layout>
                <TransactionDetailPage />
              </Layout>
            </Sidebar>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <Sidebar>
              <Layout>
                <UserList />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/admin/user/add"
          element={
            <Sidebar>
              <Layout>
                <UserForm />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/admin/user/edit/:id"
          element={
            <Sidebar>
              <Layout>
                <UserForm />
              </Layout>
            </Sidebar>
          }
        />
        {/* Category Routes */}
        <Route
          path="/admin/categories"
          element={
            <Sidebar>
              <Layout>
                <CategoryList />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/admin/category/add"
          element={
            <Sidebar>
              <Layout>
                <CategoryForm />
              </Layout>
            </Sidebar>
          }
        />
        <Route
          path="/admin/category/edit/:id"
          element={
            <Sidebar>
              <Layout>
                <CategoryForm />
              </Layout>
            </Sidebar>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
