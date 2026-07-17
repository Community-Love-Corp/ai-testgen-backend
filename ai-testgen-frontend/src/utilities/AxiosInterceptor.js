import axios from "axios";
//import { toast } from "react-toastify"; // 1. Import toast engine
// 1. AUTOMATICALLY ATTACH TOKEN TO ALL OUTGOING REQUESTS
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. CATCH EXPIRED TOKENS ON RESPONSES
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or unauthorized. Logging out...");
      localStorage.removeItem("token");
      // Safe redirect without using React Hooks/Toasts here
         window.location.href = "/login?expired=true"; 
  /*    const handleActionCheck = () => {
        toast.warn("Token expired or unauthorized. Logging out...Please Login again.");
      };*/

    }
    return Promise.reject(error);
  }
);

export default axios;
