import { lazy } from "react";
import LandingPage from "../pages/LandingPage.jsx";
import ProtectedRoute from "../components/ProtectedRoutes.jsx";
import RecommendedForYou from "../components/landing/RecommendedForYou.jsx";

const Books = lazy(() => import("../pages/books.jsx"));
const BookDetailPage = lazy(() => import("../pages/BookDetailPage.jsx"));
const ReaderPage = lazy(() => import("../pages/ReaderPage.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const Register = lazy(() => import("../pages/Auth/Signup.jsx"));
const MyLibrary = lazy(() => import("../pages/MyLibrary.jsx"));
const ProfilePage = lazy(() => import("../pages/ProfilePage.jsx"));
const AboutPage = lazy(() => import("../pages/AboutPage.jsx"));

export const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/books",
    element: <Books />,
  },
  {
    path: "/books/free-books",
    element: <RecommendedForYou />,
  },
  {
    path: "/books/:id",
    element: <BookDetailPage />,
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signup",
    element: <Register />,
  },
  {
    path: "/my-library",
    element: (
      <ProtectedRoute>
        <MyLibrary />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/book/:id",
    element: <BookDetailPage />,
  },
  {
    path: "/read/:id",
    element: <ReaderPage />,
  },
];
