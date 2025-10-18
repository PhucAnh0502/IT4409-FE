export function formatMessageTimestamp(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getToken(){
  return sessionStorage.getItem("token");
}

export function setToken(token){
  sessionStorage.setItem("token", token);
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