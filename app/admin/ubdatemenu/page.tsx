export default function MenuPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">
        Menu Management
      </h1>

      <form className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Product Name"
        />

        <input
          className="border p-2 w-full"
          placeholder="Category"
        />

        <input
          className="border p-2 w-full"
          placeholder="Sale Price"
        />

        <input
          className="border p-2 w-full"
          placeholder="Cost Price"
        />

        <button
          className="bg-black text-white px-4 py-2"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}