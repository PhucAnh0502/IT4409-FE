export function formatMessageTimestamp(date) {
  return new Date(date).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function getToken(){
   try {
    return sessionStorage.getItem("token");
  } catch (error) {
    console.error("Failed to get token from sessionStorage:", error);
    return null;
  }
}

export function setToken(token){
  try {
    if(token){
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  } catch (error) {
    console.error("Failed to set token in sessionStorage:", error);
  }
  
}

export function removeToken(){
  sessionStorage.removeItem("token");
}

export function getUserIdFromToken(){
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode JWT token (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    // JWT payload usually has 'sub', 'userId', 'id', or similar field
    return payload.sub || payload.userId || payload.id || payload.nameid;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export const handleInputChange = (setFormData, setErrors) => (e) => {
  const { name, value } = e.target;
  setFormData(prevData => ({ ...prevData, [name]: value }));
  setErrors(prevErrors => {
    if (prevErrors[name]) {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    }
    return prevErrors;
  });
};

export const onFileChange = (setImageToCrop) => (e) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result);
    });
    reader.readAsDataURL(file);
  }
};