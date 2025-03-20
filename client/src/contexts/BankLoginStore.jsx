import { BankLoginContext } from './BankLoginContext';
import { useState, useEffect } from 'react';

function BankLoginStore({ children }) {
  const [userLoginStatus, setUserLoginStatus] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [err, setErr] = useState(null);

  async function loginUser(bankCred) {
    try {
      const res = await fetch("http://localhost:4000/manager-api/bbLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankCred),
      });
  
      let data = await res.json();
      console.log(data);
  
      if (data.message === "Login successful") {
        setUserLoginStatus(true);
        setCurrentUser(data.user);
        
        // ✅ Corrected this line
        sessionStorage.setItem("bloodBankUser", JSON.stringify(data.user));
        
        return; // ✅ Exit after successful login
      }
  
      // ✅ Move setErr outside to handle failed login
      setErr(data.message);
    } catch (error) {
      console.error("Error during login:", error);
      setErr("Error during login. Please try again.");
    }
  }
  
  // Function to logout user (pass navigate as an argument)
  function logoutUser(navigate) {
    setUserLoginStatus(false);
    setCurrentUser(null);
    sessionStorage.removeItem("bloodBankUser");

    if (navigate) navigate("/bbDash");
  }

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("bloodBankUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setUserLoginStatus(true);
    }
  }, []);

  return (
    <BankLoginContext.Provider value={{ userLoginStatus, loginUser, logoutUser, currentUser, setCurrentUser, err }}>
      {children}
    </BankLoginContext.Provider>
  );
}

export default BankLoginStore;
