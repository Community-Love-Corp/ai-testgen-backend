import axios from "axios";
 
export default async function verifyRecaptcha(token) { 
   if (!token) return false; 
 
   try { 
       // Query Google's verification servers 
      // const response = await axios.post( 
      //     `https://google.com?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}` 
       //); 
       // Query Google's verification servers 
       const params = new URLSearchParams();
       params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
       params.append('response', token)
       const response = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        //null,
        //"https://google.com",
        params,
        //{
         // params: {
         //   secret: process.env.RECAPTCHA_SECRET,
         //   response: token
         // }
        //},
        {
          headers: {
            "Content-Type":"application/x-www-form-urlencoded" 
          }
        }
       );
       console.log("Response: " +response.data); 
       const { success, score, action } = response.data;
       
        // Ensure the transaction succeeded and the bot score is safe (>= 0.5) 
       if (success && action === 'login' && score >= 0.5) {
          return true;
       }else if(success && action == 'register' && score >= 0.5){
          return true;
       }else if(success && action == 'forgot_password' && score >= 0.5){
           return true;
       } 
        //return response.data.success && response.data.score >= 0.5; 
        return false;
   } catch (error) { 
      if(error.response){
        console.error("Google API rejected request for "+ response.data.action+": ", error.response.data);
      }else{ 
        console.error("reCAPTCHA network error:", error.message);
      } 
       return false; // Fail secure if validation server fails 
   } 
} 
