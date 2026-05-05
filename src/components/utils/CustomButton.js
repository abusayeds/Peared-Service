export default function CustomButton({ children }) {
  return (
    <>
      <button className=" px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:border hover:border-primary hover:text-primary hover:bg-white">
        {children}
      </button>
    </>
  );
}
