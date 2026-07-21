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
    const isLoginRequest = error.config?.url?.endsWith('/login'); 
    if (error.response){
      
      if(error.response.status === 401) {
        if (!isLoginRequest) {  
          console.warn("Token expired. Logging out...");  
          localStorage.removeItem("token");  
          window.location.href = "/login?expired=true";   
        }else{  
          console.warn("Unauthorized. Logging out...");
        // Safe redirect without using React Hooks/Toasts here
          window.location.href = "/login"; 
    /*    const handleActionCheck = () => {
          toast.warn("Token expired or unauthorized. Logging out...Please Login again.");
        };*/
  
      }
    }
  }
  return Promise.reject(error);
});

export default axios;
