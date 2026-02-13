import { useEffect, useState } from "react";
import API from "../services/api";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await API.get("/books");
        setBooks(res.data.books);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <h2>All Books</h2>
      {books.map((book) => (
        <div key={book._id}>
          <h3>{book.title}</h3>
          <p>{book.author}</p>
          <p>Price: {book.price}</p>
        </div>
      ))}
    </div>
  );
}


export default Books;
