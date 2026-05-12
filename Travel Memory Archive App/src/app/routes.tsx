import { createBrowserRouter, Navigate } from "react-router";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import { MapScreen } from "./screens/MapScreen";
import { TripsScreen } from "./screens/TripsScreen";
import { AddVisitScreen } from "./screens/AddVisitScreen";
import { TripDetailScreen } from "./screens/TripDetailScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { MainLayout } from "./layouts/MainLayout";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginScreen />,
      },
      {
        path: "signup",
        element: <SignupScreen />,
      },
      {
        path: "onboarding",
        element: (
          <ProtectedRoute>
            <OnboardingScreen />
          </ProtectedRoute>
        ),
      },
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "map", element: <MapScreen /> },
          { path: "trips", element: <TripsScreen /> },
          { path: "trips/:id", element: <TripDetailScreen /> },
          { path: "add", element: <AddVisitScreen /> },
          { path: "stats", element: <StatsScreen /> },
          { path: "profile", element: <ProfileScreen /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);