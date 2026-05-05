import Swal from "sweetalert2";

export function SuccessSwal({ title, text }) {
  return Swal.fire({
    title: title,
    text: text,
    icon: "success",
    confirmButtonColor: "#DEAD35",
    confirmButtonText: "OK",
  });
}

export function ErrorSwal({ title, text }) {
  return Swal.fire({
    title: title,
    text: text,
    icon: "error",
    confirmButtonColor: "#d33",
    confirmButtonText: "OK",
  });
}
