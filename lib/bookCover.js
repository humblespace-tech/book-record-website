// Function to fetch book covers from Open Library API
export async function fetchBookCoverUrl(isbn, title, author) {
    try {
          if (isbn && isbn.trim()) {
                  const isbnUrl = `https://covers.openlibrary.org/b/isbn/${isbn.trim()}-M.jpg`;
                  const response = await fetch(isbnUrl, { method: 'HEAD' });
                  if (response.ok) {
                            return isbnUrl;
                  }
          }

      if (title && author) {
              try {
                        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`;
                        const searchResponse = await fetch(searchUrl);
                        if (searchResponse.ok) {
                                    const data = await searchResponse.json();
                                    if (data.docs && data.docs.length > 0) {
                                                  const book = data.docs[0];
                                                  if (book.cover_id) {
                                                                  return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
                                                  }
                                                  if (book.isbn && book.isbn.length > 0) {
                                                                  return `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`;
                                                  }
                                    }
                        }
              } catch (error) {
                        console.log('Error searching:', error.message);
              }
      }
          return '';
    } catch (error) {
          console.error('Error fetching cover:', error.message);
          return '';
    }
}
