import { Routes, Route, Link } from "react-router-dom";
import Books from "./pages/Books";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/books">Books</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Welcome to Book Store</h1>} />
        <Route path="/books" element={<Books />} />
      </Routes>
    </div>
  );
}

export default App;
