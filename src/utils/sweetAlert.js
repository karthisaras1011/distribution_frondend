import Swal from "sweetalert2";

// ✅ Success Alert
export const showSuccess = (message = "Success") => {
  return Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};

// ❌ Error Alert
export const showError = (message = "Something went wrong") => {
  return Swal.fire({
    icon: "error",
    title: "Error!",
    text: message,
    confirmButtonColor: "#842626",
  });
};

// ⚠️ Warning Alert
export const showWarning = (message = "Are you sure?") => {
  return Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#842626",
    cancelButtonColor: "#6b7280",
  });
};
